import { sleep } from '../../lib/utils';
import { expenses as _expenses } from './fixtures/index';

let _data = [..._expenses];

function paginate(items, page = 1, limit = 20) {
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export const expenses = {
  async list({ page = 1, limit = 20, category, isBusiness, isDeductible, from, to } = {}) {
    await sleep(300);
    let items = [..._data];
    if (category) items = items.filter(e => e.category === category);
    if (isBusiness !== undefined) items = items.filter(e => e.isBusiness === (isBusiness === 'true' || isBusiness === true));
    if (isDeductible !== undefined) items = items.filter(e => e.isDeductible === (isDeductible === 'true' || isDeductible === true));
    if (from) items = items.filter(e => new Date(e.incurredAt) >= new Date(from));
    if (to) items = items.filter(e => new Date(e.incurredAt) <= new Date(to));
    items.sort((a, b) => new Date(b.incurredAt) - new Date(a.incurredAt));
    return paginate(items, page, limit);
  },

  async get(id) {
    await sleep(200);
    const item = _data.find(e => e.id === id);
    if (!item) { const e = new Error('Not found'); e.status = 404; throw e; }
    return { data: { ...item } };
  },

  async create(body) {
    await sleep(450);
    const forexRate = body.forexRate || 1.0;
    const amountMinor = body.amountMinor;
    const amountBaseMinor = Math.round(amountMinor * forexRate);
    const item = {
      id: 'exp_' + Date.now(),
      title: body.title,
      category: body.category,
      amount: {
        amountMinor,
        currency: body.currency,
        baseAmountMinor,
        baseCurrency: 'PKR',
        forexRate,
        forexRateSource: body.forexRate ? 'manual' : 'frankfurter',
      },
      incurredAt: body.incurredAt,
      isBusiness: body.isBusiness !== undefined ? body.isBusiness : true,
      isDeductible: body.isDeductible !== undefined ? body.isDeductible : true,
      note: body.note || '',
      createdAt: new Date().toISOString(),
    };
    _data.unshift(item);
    return { data: { ...item } };
  },

  async update(id, body) {
    await sleep(400);
    const idx = _data.findIndex(e => e.id === id);
    if (idx === -1) { const e = new Error('Not found'); e.status = 404; throw e; }
    _data[idx] = { ..._data[idx], ...body };
    return { data: { ..._data[idx] } };
  },

  async remove(id) {
    await sleep(350);
    _data = _data.filter(e => e.id !== id);
    return null;
  },

  async getCategorySummary({ from, to } = {}) {
    await sleep(300);
    let items = [..._data];
    if (from) items = items.filter(e => new Date(e.incurredAt) >= new Date(from));
    if (to) items = items.filter(e => new Date(e.incurredAt) <= new Date(to));

    const byCategory = {};
    for (const e of items) {
      const cat = e.category;
      if (!byCategory[cat]) byCategory[cat] = { category: cat, totalBaseMinor: 0, deductibleBaseMinor: 0, count: 0 };
      byCategory[cat].totalBaseMinor += e.amount.baseAmountMinor;
      if (e.isDeductible) byCategory[cat].deductibleBaseMinor += e.amount.baseAmountMinor;
      byCategory[cat].count++;
    }

    return {
      data: {
        baseCurrency: 'PKR',
        byCategory: Object.values(byCategory),
        totalBaseMinor: items.reduce((s, e) => s + e.amount.baseAmountMinor, 0),
        deductibleBaseMinor: items.filter(e => e.isDeductible).reduce((s, e) => s + e.amount.baseAmountMinor, 0),
      },
    };
  },
};
