import { Payment } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';
import { Expense } from '../models/Expense.js';
import { Client } from '../models/Client.js';
import { Platform } from '../models/Platform.js';
import { Account } from '../models/Account.js';
import { computeLiability, getFiscalYearRange } from '../services/taxService.js';
import { generateReportPdf } from '../services/pdfService.js';

export async function getAnnualSummary(req, res, next) {
  try {
    const account = req.account || await Account.findById(req.accountId);
    const fyStart = account.fiscalYearStartMonth || 7;
    const now = new Date();
    let fiscalYear = req.query.fiscalYear ? Number(req.query.fiscalYear) : null;
    if (!fiscalYear) {
      fiscalYear = now.getMonth() + 1 >= fyStart ? now.getFullYear() + 1 : now.getFullYear();
    }
    const { from, to } = getFiscalYearRange(fiscalYear, fyStart);

    const [liability, payments, expenses, clientBreakdown, platformBreakdown] = await Promise.all([
      computeLiability(req.accountId, fiscalYear),
      Payment.find({ accountId: account._id, paidAt: { $gte: from, $lte: to } }),
      Expense.find({ accountId: account._id, isDeductible: true, incurredAt: { $gte: from, $lte: to } }),
      Payment.aggregate([
        { $match: { accountId: account._id, paidAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$clientId', netBaseMinor: { $sum: '$netReceivedBaseMinor' } } },
        { $lookup: { from: 'clients', localField: '_id', foreignField: '_id', as: 'client' } },
        { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
      ]),
      Payment.aggregate([
        { $match: { accountId: account._id, paidAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$platformId', grossBaseMinor: { $sum: '$grossBaseMinor' }, feesBaseMinor: { $sum: '$platformFeeBaseMinor' }, netBaseMinor: { $sum: '$netReceivedBaseMinor' } } },
        { $lookup: { from: 'platforms', localField: '_id', foreignField: '_id', as: 'platform' } },
        { $unwind: { path: '$platform', preserveNullAndEmptyArrays: true } },
      ]),
    ]);

    // Build byMonth
    const monthBuckets = {};
    for (const p of payments) {
      const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthBuckets[key]) monthBuckets[key] = { month: key, grossBaseMinor: 0, netBaseMinor: 0, expensesBaseMinor: 0 };
      monthBuckets[key].grossBaseMinor += p.grossBaseMinor || 0;
      monthBuckets[key].netBaseMinor += p.netReceivedBaseMinor || 0;
    }
    for (const e of expenses) {
      const key = `${e.incurredAt.getFullYear()}-${String(e.incurredAt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthBuckets[key]) monthBuckets[key] = { month: key, grossBaseMinor: 0, netBaseMinor: 0, expensesBaseMinor: 0 };
      monthBuckets[key].expensesBaseMinor += e.amountBaseMinor || 0;
    }

    // Gross invoiced = sum of all invoices issued in FY
    const invoiceAgg = await Invoice.aggregate([
      { $match: { accountId: account._id, issueDate: { $gte: from, $lte: to }, status: { $ne: 'void' } } },
      { $group: { _id: null, grossInvoicedBaseMinor: { $sum: '$totalMinor' } } },
    ]);

    res.json({
      data: {
        fiscalYear,
        baseCurrency: account.baseCurrency,
        grossInvoicedBaseMinor: invoiceAgg[0]?.grossInvoicedBaseMinor || 0,
        platformFeesBaseMinor: liability.platformFeesBaseMinor,
        netReceivedBaseMinor: liability.netIncomeBaseMinor,
        deductibleExpensesBaseMinor: liability.deductibleExpensesBaseMinor,
        taxableIncomeBaseMinor: liability.taxableIncomeBaseMinor,
        estimatedTaxBaseMinor: liability.estimatedTaxMinor,
        byMonth: Object.values(monthBuckets).sort((a, b) => a.month.localeCompare(b.month)),
        byClient: clientBreakdown.map(c => ({ clientId: c._id, name: c.client?.name || 'Unknown', netBaseMinor: c.netBaseMinor })),
        byPlatform: platformBreakdown.map(p => ({ platformId: p._id, name: p.platform?.name || 'Unknown', grossBaseMinor: p.grossBaseMinor, feesBaseMinor: p.feesBaseMinor, netBaseMinor: p.netBaseMinor })),
      },
    });
  } catch (err) { next(err); }
}

export async function generateAnnualSummaryPdf(req, res, next) {
  try {
    const account = req.account || await Account.findById(req.accountId);
    const fiscalYear = req.body.fiscalYear || new Date().getFullYear();
    const fyStart = account.fiscalYearStartMonth || 7;
    const fy = Number(fiscalYear);
    const liability = await computeLiability(req.accountId, fy);

    const summary = { fiscalYear: fy, ...liability };
    const pdfUrl = await generateReportPdf(summary, account.toObject());

    res.json({ data: { pdfUrl } });
  } catch (err) { next(err); }
}

export async function getClientProfitability(req, res, next) {
  try {
    const { from, to, sort = '-netBaseMinor' } = req.query;
    const account = req.account || await Account.findById(req.accountId);
    const match = { accountId: account._id };
    if (from || to) {
      match.paidAt = {};
      if (from) match.paidAt.$gte = new Date(from);
      if (to) match.paidAt.$lte = new Date(to);
    }

    const agg = await Payment.aggregate([
      { $match: match },
      { $group: { _id: '$clientId', grossBaseMinor: { $sum: '$grossBaseMinor' }, feesBaseMinor: { $sum: '$platformFeeBaseMinor' }, netBaseMinor: { $sum: '$netReceivedBaseMinor' }, invoiceIds: { $addToSet: '$invoiceId' } } },
      { $lookup: { from: 'clients', localField: '_id', foreignField: '_id', as: 'client' } },
      { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
    ]);

    const clients = await Promise.all(agg.map(async c => {
      const overdueCount = await Invoice.countDocuments({ clientId: c._id, accountId: account._id, status: 'overdue' });
      return {
        clientId: c._id,
        name: c.client?.name || 'Unknown',
        grossBaseMinor: c.grossBaseMinor,
        feesBaseMinor: c.feesBaseMinor,
        netBaseMinor: c.netBaseMinor,
        invoiceCount: c.invoiceIds.length,
        overdueCount,
        reliabilityScore: c.client?.reliabilityScore || 100,
      };
    }));

    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDir = sort.startsWith('-') ? -1 : 1;
    clients.sort((a, b) => (a[sortField] - b[sortField]) * sortDir);

    res.json({ data: { baseCurrency: account.baseCurrency, clients } });
  } catch (err) { next(err); }
}

export async function getPlatformComparison(req, res, next) {
  try {
    const { from, to } = req.query;
    const account = req.account || await Account.findById(req.accountId);
    const match = { accountId: account._id };
    if (from || to) {
      match.paidAt = {};
      if (from) match.paidAt.$gte = new Date(from);
      if (to) match.paidAt.$lte = new Date(to);
    }

    const agg = await Payment.aggregate([
      { $match: match },
      { $group: { _id: '$platformId', grossBaseMinor: { $sum: '$grossBaseMinor' }, feesBaseMinor: { $sum: '$platformFeeBaseMinor' }, netBaseMinor: { $sum: '$netReceivedBaseMinor' }, paymentCount: { $sum: 1 } } },
      { $lookup: { from: 'platforms', localField: '_id', foreignField: '_id', as: 'platform' } },
      { $unwind: { path: '$platform', preserveNullAndEmptyArrays: true } },
    ]);

    const platforms = agg.map(p => ({
      platformId: p._id,
      name: p.platform?.name || 'Unknown',
      grossBaseMinor: p.grossBaseMinor,
      feesBaseMinor: p.feesBaseMinor,
      netBaseMinor: p.netBaseMinor,
      effectiveFeeRate: p.grossBaseMinor > 0 ? Math.round((p.feesBaseMinor / p.grossBaseMinor) * 10000) / 100 : 0,
      paymentCount: p.paymentCount,
    }));

    res.json({ data: { baseCurrency: account.baseCurrency, platforms } });
  } catch (err) { next(err); }
}
