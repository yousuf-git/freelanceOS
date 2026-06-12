import { sleep } from '../../lib/utils';
import { clients as _clients, clientNotes as _notes } from './fixtures/index';

let _data = [..._clients];
let _notesData = { ..._notes };

function paginate(items, page = 1, limit = 20) {
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export const clients = {
  async list({ page = 1, limit = 20, search, sort } = {}) {
    await sleep(300);
    let items = [..._data];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    }
    if (sort === 'reliability') items.sort((a, b) => b.reliabilityScore - a.reliabilityScore);
    if (sort === '-createdAt') items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return paginate(items, page, limit);
  },

  async get(id) {
    await sleep(200);
    const item = _data.find(c => c.id === id);
    if (!item) { const e = new Error('Not found'); e.status = 404; throw e; }
    return { data: { ...item } };
  },

  async create(body) {
    await sleep(450);
    const item = {
      id: 'cli_' + Date.now(),
      ...body,
      reliabilityScore: 100,
      stats: { totalInvoicedBaseMinor: 0, totalReceivedBaseMinor: 0, overdueCount: 0 },
      createdAt: new Date().toISOString(),
    };
    _data.push(item);
    return { data: { ...item } };
  },

  async update(id, body) {
    await sleep(350);
    const idx = _data.findIndex(c => c.id === id);
    if (idx === -1) { const e = new Error('Not found'); e.status = 404; throw e; }
    _data[idx] = { ..._data[idx], ...body };
    return { data: { ..._data[idx] } };
  },

  async remove(id) {
    await sleep(350);
    _data = _data.filter(c => c.id !== id);
    return null;
  },

  async getNotes(clientId, { page = 1, limit = 20 } = {}) {
    await sleep(250);
    const notes = _notesData[clientId] || [];
    return paginate(notes, page, limit);
  },

  async addNote(clientId, { body }) {
    await sleep(300);
    const note = {
      id: 'cnote_' + Date.now(),
      clientId,
      body,
      createdAt: new Date().toISOString(),
    };
    if (!_notesData[clientId]) _notesData[clientId] = [];
    _notesData[clientId].unshift(note);
    return { data: { ...note } };
  },

  async deleteNote(clientId, noteId) {
    await sleep(250);
    if (_notesData[clientId]) {
      _notesData[clientId] = _notesData[clientId].filter(n => n.id !== noteId);
    }
    return null;
  },
};
