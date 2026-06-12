import { sleep } from '../../lib/utils';
import { reminders as _reminders } from './fixtures/index';

let _data = { ..._reminders };

function paginate(items, page = 1, limit = 20) {
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

const REMINDER_ACTIONS = [
  'Polite nudge — invoice overdue. Friendly email or message.',
  'Firm reminder — still unpaid. Request confirmed payment date.',
  'Final notice — escalate or consider pausing work.',
];

export const reminders = {
  async list(invoiceId, { page = 1, limit = 20 } = {}) {
    await sleep(250);
    const items = _data[invoiceId] || [];
    return paginate(items, page, limit);
  },

  async create(invoiceId, { clientId } = {}) {
    await sleep(400);
    const existing = _data[invoiceId] || [];
    const step = existing.length + 1;
    const reminder = {
      id: 'rem_' + Date.now(),
      invoiceId,
      clientId: clientId || '',
      sequenceStep: step,
      suggestedAction: REMINDER_ACTIONS[Math.min(step - 1, REMINDER_ACTIONS.length - 1)],
      channel: step === 2 ? 'whatsapp' : 'email',
      status: 'pending',
      sentAt: null,
      createdAt: new Date().toISOString(),
    };
    if (!_data[invoiceId]) _data[invoiceId] = [];
    _data[invoiceId].push(reminder);
    return { data: { ...reminder } };
  },

  async update(reminderId, body) {
    await sleep(300);
    for (const invoiceId of Object.keys(_data)) {
      const idx = _data[invoiceId].findIndex(r => r.id === reminderId);
      if (idx !== -1) {
        _data[invoiceId][idx] = {
          ..._data[invoiceId][idx],
          ...body,
          sentAt: body.status === 'sent' ? new Date().toISOString() : _data[invoiceId][idx].sentAt,
        };
        return { data: { ..._data[invoiceId][idx] } };
      }
    }
    const e = new Error('Not found'); e.status = 404; throw e;
  },
};
