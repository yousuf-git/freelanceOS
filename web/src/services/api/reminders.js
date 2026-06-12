import http from '../http';

export const reminders = {
  async list(invoiceId, params = {}) {
    const res = await http.get(`/invoices/${invoiceId}/reminders`, { params });
    return res.data;
  },
  async create(invoiceId) {
    const res = await http.post(`/invoices/${invoiceId}/reminders`);
    return res.data;
  },
  async update(reminderId, body) {
    const res = await http.patch(`/reminders/${reminderId}`, body);
    return res.data;
  },
};
