import { Invoice } from '../models/Invoice.js';
import { Account } from '../models/Account.js';
import { Reminder } from '../models/Reminder.js';
import { generateInvoicePdf } from '../services/pdfService.js';
import { Client } from '../models/Client.js';

function buildSort(sortStr) {
  const sort = {};
  const parts = String(sortStr).split(',');
  for (const part of parts) {
    if (part.startsWith('-')) sort[part.slice(1)] = -1;
    else sort[part] = 1;
  }
  return sort;
}

function computeInvoiceTotals(lineItems) {
  const subtotalMinor = lineItems.reduce((sum, item) => {
    const amount = item.quantity * item.unitPriceMinor;
    item.amountMinor = Math.round(amount);
    return sum + item.amountMinor;
  }, 0);
  return subtotalMinor;
}

async function generateInvoiceNumber(accountId) {
  const account = await Account.findByIdAndUpdate(
    accountId,
    { $inc: { invoiceSeq: 1 } },
    { new: true }
  );
  const now = new Date();
  const fyStartMonth = account.fiscalYearStartMonth || 7;
  let fyYear = now.getFullYear();
  if (now.getMonth() + 1 < fyStartMonth) fyYear -= 1;
  const fy = `${fyYear}-${String(fyYear + 1).slice(2)}`;
  const seq = String(account.invoiceSeq).padStart(4, '0');
  return `INV-${fy}-${seq}`;
}

export async function listInvoices(req, res, next) {
  try {
    const { page, limit, status, clientId, platformId, overdue, from, to, sort } = req.query;
    const filter = { accountId: req.accountId };

    if (status) filter.status = status;
    if (clientId) filter.clientId = clientId;
    if (platformId) filter.platformId = platformId;
    if (overdue === 'true') filter.status = 'overdue';
    if (from || to) {
      filter.issueDate = {};
      if (from) filter.issueDate.$gte = new Date(from);
      if (to) filter.issueDate.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;
    const [invoices, total] = await Promise.all([
      Invoice.find(filter).sort(buildSort(sort)).skip(skip).limit(Number(limit)),
      Invoice.countDocuments(filter),
    ]);

    res.json({
      data: invoices,
      meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function createInvoice(req, res, next) {
  try {
    const { clientId, platformId, currency, issueDate, dueDate, lineItems, notes, taxOnInvoiceMinor } = req.body;

    const subtotalMinor = computeInvoiceTotals(lineItems);
    const tax = taxOnInvoiceMinor || 0;
    const totalMinor = subtotalMinor + tax;
    const number = await generateInvoiceNumber(req.accountId);

    const invoice = await Invoice.create({
      accountId: req.accountId,
      number,
      clientId,
      platformId,
      currency,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      lineItems,
      subtotalMinor,
      taxOnInvoiceMinor: tax,
      totalMinor,
      amountPaidMinor: 0,
      amountDueMinor: totalMinor,
      notes,
    });

    res.status(201).json({ data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function getInvoice(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!invoice) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }
    res.json({ data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function updateInvoice(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!invoice) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    if (!['draft', 'sent'].includes(invoice.status)) {
      return res.status(409).json({
        error: { code: 'CONFLICT', message: 'Only draft or sent invoices can be edited' },
      });
    }

    const updates = { ...req.body };
    if (updates.lineItems) {
      const subtotalMinor = computeInvoiceTotals(updates.lineItems);
      const tax = updates.taxOnInvoiceMinor ?? invoice.taxOnInvoiceMinor;
      updates.subtotalMinor = subtotalMinor;
      updates.totalMinor = subtotalMinor + tax;
      updates.amountDueMinor = updates.totalMinor - invoice.amountPaidMinor;
    }

    const updated = await Invoice.findByIdAndUpdate(invoice._id, updates, { new: true });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

export async function sendInvoice(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!invoice) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    if (invoice.status !== 'draft') {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'Only draft invoices can be sent' } });
    }

    const updated = await Invoice.findByIdAndUpdate(invoice._id, { status: 'sent' }, { new: true });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

export async function voidInvoice(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!invoice) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    if (invoice.status === 'paid') {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'Cannot void a paid invoice' } });
    }

    const updated = await Invoice.findByIdAndUpdate(invoice._id, { status: 'void' }, { new: true });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteInvoice(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!invoice) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    if (invoice.status !== 'draft') {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'Only draft invoices can be deleted' } });
    }

    await Invoice.findByIdAndDelete(invoice._id);
    res.json({ data: { message: 'Invoice deleted' } });
  } catch (err) {
    next(err);
  }
}

export async function generatePdf(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!invoice) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    const client = await Client.findById(invoice.clientId);
    const account = req.account;

    const pdfUrl = await generateInvoicePdf(invoice.toObject(), client?.toObject() || {}, account?.toObject() || {});
    await Invoice.findByIdAndUpdate(invoice._id, { pdfUrl });

    res.json({ data: { pdfUrl } });
  } catch (err) {
    next(err);
  }
}

export async function listReminders(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!invoice) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    const reminders = await Reminder.find({ invoiceId: invoice._id, accountId: req.accountId })
      .sort({ sequenceStep: 1 });
    res.json({ data: reminders });
  } catch (err) {
    next(err);
  }
}

export async function createReminder(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!invoice) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    const reminder = await Reminder.create({
      accountId: req.accountId,
      invoiceId: invoice._id,
      clientId: invoice.clientId,
      sequenceStep: req.body.sequenceStep,
      suggestedAction: req.body.suggestedAction,
      channel: req.body.channel || 'email',
    });

    res.status(201).json({ data: reminder });
  } catch (err) {
    next(err);
  }
}
