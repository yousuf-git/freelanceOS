import { sleep } from '../../lib/utils';
import { platforms as _platforms } from './fixtures/index';

let _data = [..._platforms];

function paginate(items, page = 1, limit = 20) {
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export const platforms = {
  async list({ page = 1, limit = 20 } = {}) {
    await sleep(250);
    return paginate(_data, page, limit);
  },

  async get(id) {
    await sleep(200);
    const item = _data.find(p => p.id === id);
    if (!item) { const e = new Error('Not found'); e.status = 404; throw e; }
    return { data: { ...item } };
  },

  async create(body) {
    await sleep(400);
    const item = {
      id: 'plt_' + Date.now(),
      ...body,
      isSystemDefault: false,
      createdAt: new Date().toISOString(),
    };
    _data.push(item);
    return { data: { ...item } };
  },

  async update(id, body) {
    await sleep(350);
    const idx = _data.findIndex(p => p.id === id);
    if (idx === -1) { const e = new Error('Not found'); e.status = 404; throw e; }
    _data[idx] = { ..._data[idx], ...body };
    return { data: { ..._data[idx] } };
  },

  async remove(id) {
    await sleep(350);
    _data = _data.filter(p => p.id !== id);
    return null;
  },
};
