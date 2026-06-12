import { sleep } from '../../lib/utils';
import { invoices as _invoices } from './fixtures/index';

let _data = [..._invoices];
let _seq = 9; // next number after INV-2026-0009

function paginate(items, page = 1, limit = 20) {
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export const invoices = {
  async list({ page = 1, limit = 20, status, clientId, platformId, overdue, from, to, sort = '-issueDate' } = {}) {
    await sleep(300);
    let items = [..._data];
    if (status) items = items.filter(i => i.status === status);
    if (clientId) items = items.filter(i => i.clientId === clientId);
    if (platformId) items = items.filter(i => i.platformId === platformId);
    if (overdue === 'true' || overdue === true) items = items.filter(i => i.status === 'overdue' || i.overdueDays > 0);
    if (from) items = items.filter(i => new Date(i.issueDate) >= new Date(from));
    if (to) items = items.filter(i => new Date(i.issueDate) <= new Date(to));
    items.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
    return paginate(items, page, limit);
  },

  async get(id) {
    await sleep(200);
    const item = _data.find(i => i.id === id);
    if (!item) { const e = new Error('Not found'); e.status = 404; throw e; }
    return { data: { ...item } };
  },

  async create(body) {
    await sleep(500);
    const lineItems = (body.lineItems || []).map(li => ({
      description: li.description,
      quantity: li.quantity,
      unitPriceMinor: li.unitPriceMinor,
      amountMinor: Math.round(li.quantity * li.unitPriceMinor),
    }));
    const subtotalMinor = lineItems.reduce((s, li) => s + li.amountMinor, 0);
    const totalMinor = subtotalMinor + (body.taxOnInvoiceMinor || 0);
    _seq++;
    const item = {
      id: 'inv_' + Date.now(),
      number: `INV-2026-${String(_seq).padStart(4, '0')}`,
      ...body,
      lineItems,
      subtotalMinor,
      taxOnInvoiceMinor: body.taxOnInvoiceMinor || 0,
      totalMinor,
      amountPaidMinor: 0,
      amountDueMinor: totalMinor,
      pdfUrl: null,
      overdueDays: 0,
      agingBucket: 'current',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _data.unshift(item);
    return { data: { ...item } };
  },

  async update(id, body) {
    await sleep(400);
    const idx = _data.findIndex(i => i.id === id);
    if (idx === -1) { const e = new Error('Not found'); e.status = 404; throw e; }
    _data[idx] = { ..._data[idx], ...body, updatedAt: new Date().toISOString() };
    return { data: { ..._data[idx] } };
  },

  async send(id) {
    await sleep(350);
    const idx = _data.findIndex(i => i.id === id);
    if (idx === -1) { const e = new Error('Not found'); e.status = 404; throw e; }
    _data[idx] = { ..._data[idx], status: 'sent', updatedAt: new Date().toISOString() };
    return { data: { ..._data[idx] } };
  },

  async voidInvoice(id) {
    await sleep(350);
    const idx = _data.findIndex(i => i.id === id);
    if (idx === -1) { const e = new Error('Not found'); e.status = 404; throw e; }
    if (_data[idx].status === 'paid') {
      const e = new Error('Cannot void paid invoice');
      e.status = 409;
      throw e;
    }
    _data[idx] = { ..._data[idx], status: 'void', updatedAt: new Date().toISOString() };
    return { data: { ..._data[idx] } };
  },

  async remove(id) {
    await sleep(350);
    _data = _data.filter(i => i.id !== id);
    return null;
  },

  async generatePdf(id) {
    await sleep(1500);
    return { data: { pdfUrl: `https://s3.amazonaws.com/freelanceos-exports/invoices/${id}.pdf` } };
  },
};
