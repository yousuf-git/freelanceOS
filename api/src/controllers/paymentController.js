import { Payment } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';
import { Platform } from '../models/Platform.js';
import { Account } from '../models/Account.js';
import { getRate } from '../services/forexService.js';
import { computeFee } from '../services/feeEngine.js';
import { computeLiability } from '../services/taxService.js';
import { emitToAccount } from '../sockets/index.js';

function buildSort(sortStr) {
  const sort = {};
  const parts = String(sortStr).split(',');
  for (const part of parts) {
    if (part.startsWith('-')) sort[part.slice(1)] = -1;
    else sort[part] = 1;
  }
  return sort;
}

async function updateInvoiceStatus(invoice) {
  const now = new Date();
  let status;

  if (invoice.amountPaidMinor <= 0) {
    status = invoice.status === 'draft' ? 'draft' : 'sent';
    if (invoice.dueDate < now && status === 'sent') status = 'overdue';
  } else if (invoice.amountPaidMinor >= invoice.totalMinor) {
    status = 'paid';
  } else {
    status = 'partially_paid';
    if (invoice.dueDate < now) status = 'overdue';
  }

  return status;
}

export async function listPayments(req, res, next) {
  try {
    const { page, limit, clientId, platformId, invoiceId, from, to, sort } = req.query;
    const filter = { accountId: req.accountId };

    if (clientId) filter.clientId = clientId;
    if (platformId) filter.platformId = platformId;
    if (invoiceId) filter.invoiceId = invoiceId;
    if (from || to) {
      filter.paidAt = {};
      if (from) filter.paidAt.$gte = new Date(from);
      if (to) filter.paidAt.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [payments, total] = await Promise.all([
      Payment.find(filter).sort(buildSort(sort)).skip(skip).limit(Number(limit)),
      Payment.countDocuments(filter),
    ]);

    res.json({
      data: payments,
      meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function createPayment(req, res, next) {
  try {
    const { invoiceId, paidAt, grossAmountMinor, currency, forexRate: manualRate, isManualRate, note } = req.body;

    // Fetch invoice
    const invoice = await Invoice.findOne({ _id: invoiceId, accountId: req.accountId });
    if (!invoice) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    const account = req.account || await Account.findById(req.accountId);
    const baseCurrency = account.baseCurrency;
    const platform = await Platform.findById(invoice.platformId);

    // Resolve forex rate
    let forexRate, forexRateSource;
    if (isManualRate && manualRate) {
      forexRate = manualRate;
      forexRateSource = 'manual';
    } else {
      const paidDate = paidAt ? new Date(paidAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const rateResult = await getRate(currency, baseCurrency, paidDate);
      forexRate = rateResult.rate;
      forexRateSource = rateResult.source;
    }

    // Compute lifetime billed for sliding scale
    const lifetimePayments = await Payment.aggregate([
      { $match: { accountId: account._id, platformId: invoice.platformId } },
      { $group: { _id: null, total: { $sum: '$grossAmountMinor' } } },
    ]);
    const lifetimeBilledMinor = lifetimePayments[0]?.total || 0;

    // Compute platform fee
    const { feeMinor } = computeFee(grossAmountMinor, platform, lifetimeBilledMinor);

    // Derived amounts
    const grossBaseMinor = Math.round(grossAmountMinor * forexRate);
    const platformFeeBaseMinor = Math.round(feeMinor * forexRate);
    const netReceivedMinor = grossAmountMinor - feeMinor;
    const netReceivedBaseMinor = grossBaseMinor - platformFeeBaseMinor;

    const payment = await Payment.create({
      accountId: req.accountId,
      invoiceId: invoice._id,
      clientId: invoice.clientId,
      platformId: invoice.platformId,
      paidAt: new Date(paidAt),
      grossAmountMinor,
      currency,
      forexRate,
      forexRateSource,
      isManualRate: isManualRate || false,
      platformFeeMinor: feeMinor,
      platformFeeBaseMinor,
      netReceivedMinor,
      netReceivedBaseMinor,
      grossBaseMinor,
      note,
    });

    // Update invoice: resum all payments
    const allPayments = await Payment.find({ invoiceId: invoice._id });
    const totalPaid = allPayments.reduce((s, p) => s + p.grossAmountMinor, 0);
    const updatedInvoice = await Invoice.findById(invoice._id);
    updatedInvoice.amountPaidMinor = totalPaid;
    updatedInvoice.amountDueMinor = Math.max(0, updatedInvoice.totalMinor - totalPaid);
    updatedInvoice.status = await updateInvoiceStatus(updatedInvoice);
    await updatedInvoice.save();

    // Recompute tax
    const now = new Date();
    const fyStart = account.fiscalYearStartMonth || 7;
    let fyYear = now.getFullYear();
    if (now.getMonth() + 1 < fyStart) fyYear -= 1;
    else fyYear += 1; // current FY end year
    const taxLiability = await computeLiability(req.accountId, fyYear);

    // Emit socket events
    emitToAccount(req.accountId, 'payment:created', { data: payment });
    emitToAccount(req.accountId, 'invoice:updated', { data: updatedInvoice });
    emitToAccount(req.accountId, 'tax:updated', { data: taxLiability });

    // Check cashflow danger
    if (account.dangerZoneThresholdMinor > 0) {
      emitToAccount(req.accountId, 'cashflow:danger', {
        data: { message: 'Cashflow check triggered after payment' },
      });
    }

    res.status(201).json({ data: payment });
  } catch (err) {
    next(err);
  }
}

export async function getPayment(req, res, next) {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!payment) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Payment not found' } });
    }
    res.json({ data: payment });
  } catch (err) {
    next(err);
  }
}

export async function deletePayment(req, res, next) {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!payment) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Payment not found' } });
    }

    await Payment.findByIdAndDelete(payment._id);

    // Reverse invoice totals
    const allPayments = await Payment.find({ invoiceId: payment.invoiceId });
    const totalPaid = allPayments.reduce((s, p) => s + p.grossAmountMinor, 0);

    const invoice = await Invoice.findById(payment.invoiceId);
    if (invoice) {
      invoice.amountPaidMinor = totalPaid;
      invoice.amountDueMinor = Math.max(0, invoice.totalMinor - totalPaid);
      invoice.status = await updateInvoiceStatus(invoice);
      await invoice.save();

      emitToAccount(req.accountId, 'invoice:updated', { data: invoice });
    }

    // Recompute tax
    const account = req.account || await Account.findById(req.accountId);
    const now = new Date();
    const fyStart = account.fiscalYearStartMonth || 7;
    let fyYear = now.getFullYear();
    if (now.getMonth() + 1 < fyStart) fyYear -= 1;
    else fyYear += 1;
    const taxLiability = await computeLiability(req.accountId, fyYear);
    emitToAccount(req.accountId, 'tax:updated', { data: taxLiability });

    emitToAccount(req.accountId, 'payment:deleted', { id: payment._id, invoiceId: payment.invoiceId });

    res.json({ data: { message: 'Payment deleted' } });
  } catch (err) {
    next(err);
  }
}
