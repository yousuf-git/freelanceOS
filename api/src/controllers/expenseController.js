import { Expense } from '../models/Expense.js';
import { Account } from '../models/Account.js';
import { getRate } from '../services/forexService.js';
import { computeLiability } from '../services/taxService.js';
import { emitToAccount } from '../sockets/index.js';

function buildSort(sortStr) {
  const sort = {};
  for (const part of String(sortStr).split(',')) {
    if (part.startsWith('-')) sort[part.slice(1)] = -1;
    else sort[part] = 1;
  }
  return sort;
}

export async function listExpenses(req, res, next) {
  try {
    const { page, limit, category, isBusiness, isDeductible, from, to, sort } = req.query;
    const filter = { accountId: req.accountId };
    if (category) filter.category = category;
    if (isBusiness !== undefined) filter.isBusiness = isBusiness === 'true';
    if (isDeductible !== undefined) filter.isDeductible = isDeductible === 'true';
    if (from || to) {
      filter.incurredAt = {};
      if (from) filter.incurredAt.$gte = new Date(from);
      if (to) filter.incurredAt.$lte = new Date(to);
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort(buildSort(sort)).skip(skip).limit(Number(limit)),
      Expense.countDocuments(filter),
    ]);
    res.json({ data: expenses, meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
}

export async function createExpense(req, res, next) {
  try {
    const { title, category, amountMinor, currency, forexRate: manualRate, isManualRate, incurredAt, isBusiness, isDeductible, note } = req.body;
    const account = req.account || await Account.findById(req.accountId);
    const baseCurrency = account.baseCurrency;

    let forexRate, forexRateSource;
    if (isManualRate && manualRate) {
      forexRate = manualRate;
      forexRateSource = 'manual';
    } else if (currency === baseCurrency) {
      forexRate = 1;
      forexRateSource = 'manual';
    } else {
      const dateStr = incurredAt ? new Date(incurredAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const result = await getRate(currency, baseCurrency, dateStr);
      forexRate = result.rate;
      forexRateSource = result.source;
    }

    const amountBaseMinor = Math.round(amountMinor * forexRate);
    const expense = await Expense.create({
      accountId: req.accountId,
      title, category, amountMinor, currency, forexRate, forexRateSource,
      amountBaseMinor,
      incurredAt: new Date(incurredAt),
      isBusiness: isBusiness !== undefined ? isBusiness : true,
      isDeductible: isDeductible !== undefined ? isDeductible : true,
      note,
    });

    // Recompute tax
    const now = new Date();
    const fyStart = account.fiscalYearStartMonth || 7;
    let fyYear = now.getMonth() + 1 >= fyStart ? now.getFullYear() + 1 : now.getFullYear();
    const liability = await computeLiability(req.accountId, fyYear);
    emitToAccount(req.accountId, 'tax:updated', { data: liability });

    res.status(201).json({ data: expense });
  } catch (err) { next(err); }
}

export async function getExpense(req, res, next) {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!expense) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Expense not found' } });
    res.json({ data: expense });
  } catch (err) { next(err); }
}

export async function updateExpense(req, res, next) {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, accountId: req.accountId },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Expense not found' } });
    res.json({ data: expense });
  } catch (err) { next(err); }
}

export async function deleteExpense(req, res, next) {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, accountId: req.accountId });
    if (!expense) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Expense not found' } });
    const account = req.account || await Account.findById(req.accountId);
    const now = new Date();
    const fyStart = account.fiscalYearStartMonth || 7;
    let fyYear = now.getMonth() + 1 >= fyStart ? now.getFullYear() + 1 : now.getFullYear();
    const liability = await computeLiability(req.accountId, fyYear);
    emitToAccount(req.accountId, 'tax:updated', { data: liability });
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function getCategorySummary(req, res, next) {
  try {
    const { from, to } = req.query;
    const match = { accountId: req.accountId };
    if (from || to) {
      match.incurredAt = {};
      if (from) match.incurredAt.$gte = new Date(from);
      if (to) match.incurredAt.$lte = new Date(to);
    }
    const account = req.account || await Account.findById(req.accountId);
    const agg = await Expense.aggregate([
      { $match: match },
      { $group: {
        _id: '$category',
        totalBaseMinor: { $sum: '$amountBaseMinor' },
        deductibleBaseMinor: { $sum: { $cond: ['$isDeductible', '$amountBaseMinor', 0] } },
        count: { $sum: 1 },
      }},
    ]);
    const byCategory = agg.map(r => ({ category: r._id, totalBaseMinor: r.totalBaseMinor, deductibleBaseMinor: r.deductibleBaseMinor, count: r.count }));
    const totalBaseMinor = byCategory.reduce((s, c) => s + c.totalBaseMinor, 0);
    const deductibleBaseMinor = byCategory.reduce((s, c) => s + c.deductibleBaseMinor, 0);
    res.json({ data: { baseCurrency: account.baseCurrency, byCategory, totalBaseMinor, deductibleBaseMinor } });
  } catch (err) { next(err); }
}
