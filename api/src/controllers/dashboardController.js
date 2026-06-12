import { Payment } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';
import { Expense } from '../models/Expense.js';
import { Client } from '../models/Client.js';
import { Platform } from '../models/Platform.js';
import { Account } from '../models/Account.js';
import { computeLiability } from '../services/taxService.js';

function getPeriodRange(period, date) {
  const d = date ? new Date(date) : new Date();
  let from, to;
  if (period === 'month') {
    from = new Date(d.getFullYear(), d.getMonth(), 1);
    to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'quarter') {
    const q = Math.floor(d.getMonth() / 3);
    from = new Date(d.getFullYear(), q * 3, 1);
    to = new Date(d.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999);
  } else {
    from = new Date(d.getFullYear(), 0, 1);
    to = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
  }
  return { from, to };
}

export async function getSummary(req, res, next) {
  try {
    const { period = 'month', date } = req.query;
    const { from, to } = getPeriodRange(period, date);
    const account = req.account || await Account.findById(req.accountId);
    const baseCurrency = account.baseCurrency;

    const [paymentAgg, invoiceAgg, expenseAgg, clientBreakdown, platformBreakdown, currencyBreakdown] = await Promise.all([
      Payment.aggregate([
        { $match: { accountId: account._id, paidAt: { $gte: from, $lte: to } } },
        { $group: { _id: null, grossBaseMinor: { $sum: '$grossBaseMinor' }, netReceivedBaseMinor: { $sum: '$netReceivedBaseMinor' }, feesBaseMinor: { $sum: '$platformFeeBaseMinor' } } },
      ]),
      Invoice.aggregate([
        { $match: { accountId: account._id, issueDate: { $gte: from, $lte: to }, status: { $in: ['sent', 'partially_paid', 'overdue'] } } },
        { $group: { _id: null, outstandingBase: { $sum: '$amountDueMinor' } } },
      ]),
      Expense.aggregate([
        { $match: { accountId: account._id, incurredAt: { $gte: from, $lte: to } } },
        { $group: { _id: null, totalBase: { $sum: '$amountBaseMinor' } } },
      ]),
      Payment.aggregate([
        { $match: { accountId: account._id, paidAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$clientId', netBaseMinor: { $sum: '$netReceivedBaseMinor' } } },
        { $lookup: { from: 'clients', localField: '_id', foreignField: '_id', as: 'client' } },
        { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
        { $project: { clientId: '$_id', name: { $ifNull: ['$client.name', 'Unknown'] }, netBaseMinor: 1 } },
      ]),
      Payment.aggregate([
        { $match: { accountId: account._id, paidAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$platformId', netBaseMinor: { $sum: '$netReceivedBaseMinor' } } },
        { $lookup: { from: 'platforms', localField: '_id', foreignField: '_id', as: 'platform' } },
        { $unwind: { path: '$platform', preserveNullAndEmptyArrays: true } },
        { $project: { platformId: '$_id', name: { $ifNull: ['$platform.name', 'Unknown'] }, netBaseMinor: 1 } },
      ]),
      Payment.aggregate([
        { $match: { accountId: account._id, paidAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$currency', grossMinor: { $sum: '$grossAmountMinor' }, netReceivedBaseMinor: { $sum: '$netReceivedBaseMinor' } } },
        { $project: { currency: '$_id', grossMinor: 1, netReceivedBaseMinor: 1 } },
      ]),
    ]);

    const overdueCount = await Invoice.countDocuments({ accountId: account._id, status: 'overdue' });
    const overdueAgg = await Invoice.aggregate([
      { $match: { accountId: account._id, status: 'overdue' } },
      { $group: { _id: null, total: { $sum: '$amountDueMinor' } } },
    ]);

    const now = new Date();
    const fyStart = account.fiscalYearStartMonth || 7;
    let fyYear = now.getMonth() + 1 >= fyStart ? now.getFullYear() + 1 : now.getFullYear();
    const liability = await computeLiability(req.accountId, fyYear);

    res.json({
      data: {
        baseCurrency,
        period,
        rangeFrom: from.toISOString().split('T')[0],
        rangeTo: to.toISOString().split('T')[0],
        grossInvoicedBaseMinor: paymentAgg[0]?.grossBaseMinor || 0,
        netReceivedBaseMinor: paymentAgg[0]?.netReceivedBaseMinor || 0,
        platformFeesBaseMinor: paymentAgg[0]?.feesBaseMinor || 0,
        expensesBaseMinor: expenseAgg[0]?.totalBase || 0,
        outstandingBaseMinor: invoiceAgg[0]?.outstandingBase || 0,
        overdueBaseMinor: overdueAgg[0]?.total || 0,
        estimatedTaxBaseMinor: liability.estimatedTaxMinor,
        quarterlySetAsideBaseMinor: liability.quarterlySetAsideMinor,
        byClient: clientBreakdown.map(c => ({ clientId: c.clientId, name: c.name, netBaseMinor: c.netBaseMinor })),
        byPlatform: platformBreakdown.map(p => ({ platformId: p.platformId, name: p.name, netBaseMinor: p.netBaseMinor })),
        byCurrency: currencyBreakdown.map(c => ({ currency: c.currency, grossMinor: c.grossMinor, netReceivedBaseMinor: c.netReceivedBaseMinor })),
      },
    });
  } catch (err) { next(err); }
}

export async function getTrends(req, res, next) {
  try {
    const { granularity = 'month', months = '12' } = req.query;
    const account = req.account || await Account.findById(req.accountId);
    const numMonths = Math.min(Number(months), 36);
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - numMonths + 1, 1);

    const [payments, expenses] = await Promise.all([
      Payment.find({ accountId: account._id, paidAt: { $gte: from } }),
      Expense.find({ accountId: account._id, incurredAt: { $gte: from } }),
    ]);

    // Build monthly buckets
    const buckets = {};
    for (let i = 0; i < numMonths; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - numMonths + 1 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = { period: key, grossBaseMinor: 0, netBaseMinor: 0, expensesBaseMinor: 0 };
    }

    for (const p of payments) {
      const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, '0')}`;
      if (buckets[key]) {
        buckets[key].grossBaseMinor += p.grossBaseMinor || 0;
        buckets[key].netBaseMinor += p.netReceivedBaseMinor || 0;
      }
    }

    for (const e of expenses) {
      const key = `${e.incurredAt.getFullYear()}-${String(e.incurredAt.getMonth() + 1).padStart(2, '0')}`;
      if (buckets[key]) buckets[key].expensesBaseMinor += e.amountBaseMinor || 0;
    }

    const series = Object.values(buckets);
    const nets = series.map(s => s.netBaseMinor).filter(n => n > 0);
    const averageNetBaseMinor = nets.length ? Math.round(nets.reduce((a, b) => a + b, 0) / nets.length) : 0;
    const bestMonth = series.reduce((best, s) => (!best || s.netBaseMinor > best.netBaseMinor) ? s : best, null);
    const worstMonth = series.reduce((worst, s) => (!worst || s.netBaseMinor < worst.netBaseMinor) ? s : worst, null);

    res.json({
      data: {
        baseCurrency: account.baseCurrency,
        series,
        averageNetBaseMinor,
        bestMonth: bestMonth ? { period: bestMonth.period, netBaseMinor: bestMonth.netBaseMinor } : null,
        worstMonth: worstMonth ? { period: worstMonth.period, netBaseMinor: worstMonth.netBaseMinor } : null,
      },
    });
  } catch (err) { next(err); }
}
