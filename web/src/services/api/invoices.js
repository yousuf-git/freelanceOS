import http from '../http';

export const invoices = {
  async list(params = {}) {
    const res = await http.get('/invoices', { params });
    return res.data;
  },
  async get(id) {
    const res = await http.get(`/invoices/${id}`);
    return res.data;
  },
  async create(body) {
    const res = await http.post('/invoices', body);
    return res.data;
  },
  async update(id, body) {
    const res = await http.patch(`/invoices/${id}`, body);
    return res.data;
  },
  async send(id) {
    const res = await http.post(`/invoices/${id}/send`);
    return res.data;
  },
  async voidInvoice(id) {
    const res = await http.post(`/invoices/${id}/void`);
    return res.data;
  },
  async remove(id) {
    const res = await http.delete(`/invoices/${id}`);
    return res.data;
  },
  async generatePdf(id) {
    const res = await http.post(`/invoices/${id}/pdf`);
    return res.data;
  },
};
