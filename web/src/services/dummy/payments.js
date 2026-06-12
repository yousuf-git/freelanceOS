import { sleep } from '../../lib/utils';
import { payments as _payments } from './fixtures/index';

let _data = [..._payments];

function paginate(items, page = 1, limit = 20) {
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export const payments = {
  async list({ page = 1, limit = 20, clientId, platformId, invoiceId, from, to } = {}) {
    await sleep(300);
    let items = [..._data];
    if (clientId) items = items.filter(p => p.clientId === clientId);
    if (platformId) items = items.filter(p => p.platformId === platformId);
    if (invoiceId) items = items.filter(p => p.invoiceId === invoiceId);
    if (from) items = items.filter(p => new Date(p.paidAt) >= new Date(from));
    if (to) items = items.filter(p => new Date(p.paidAt) <= new Date(to));
    items.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
    return paginate(items, page, limit);
  },

  async get(id) {
    await sleep(200);
    const item = _data.find(p => p.id === id);
    if (!item) { const e = new Error('Not found'); e.status = 404; throw e; }
    return { data: { ...item } };
  },

  async create(body) {
    await sleep(600);
    // Simulate forex unavailability if forexRate is string 'unavailable'
    if (body.forexRate === 'unavailable') {
      const e = new Error('Forex unavailable');
      e.status = 424;
      e.data = { error: { code: 'FOREX_UNAVAILABLE', message: 'Provide forexRate manually', details: [{ field: 'forexRate', message: 'required' }] } };
      throw e;
    }

    const forexRate = body.forexRate || 282.0;
    const grossAmountMinor = body.grossAmountMinor;
    const grossBaseMinor = Math.round(grossAmountMinor * forexRate);
    const platformFeeMinor = body.platformFeeOverrideMinor || Math.round(grossAmountMinor * 0.1);
    const platformFeeBaseMinor = Math.round(platformFeeMinor * forexRate);
    const netReceivedMinor = grossAmountMinor - platformFeeMinor;
    const netReceivedBaseMinor = grossBaseMinor - platformFeeBaseMinor;

    const item = {
      id: 'pay_' + Date.now(),
      invoiceId: body.invoiceId,
      clientId: body.clientId || 'cli000000000000000000001',
      platformId: body.platformId || 'plt000000000000000000001',
      paidAt: body.paidAt,
      gross: {
        amountMinor: grossAmountMinor,
        currency: body.currency,
        baseAmountMinor: grossBaseMinor,
        baseCurrency: 'PKR',
        forexRate,
        forexRateSource: body.forexRate ? 'manual' : 'frankfurter',
      },
      platformFeeMinor,
      platformFeeBaseMinor,
      netReceived: {
        amountMinor: netReceivedMinor,
        currency: body.currency,
        baseAmountMinor: netReceivedBaseMinor,
        baseCurrency: 'PKR',
        forexRate,
        forexRateSource: body.forexRate ? 'manual' : 'frankfurter',
      },
      isManualRate: !!body.forexRate,
      note: body.note || '',
      createdAt: new Date().toISOString(),
    };
    _data.unshift(item);
    return { data: { ...item } };
  },

  async remove(id) {
    await sleep(400);
    _data = _data.filter(p => p.id !== id);
    return null;
  },
};
