import http from '../http';

export const payments = {
  async list(params = {}) {
    const res = await http.get('/payments', { params });
    return res.data;
  },
  async get(id) {
    const res = await http.get(`/payments/${id}`);
    return res.data;
  },
  async create(body) {
    const res = await http.post('/payments', body);
    return res.data;
  },
  async remove(id) {
    const res = await http.delete(`/payments/${id}`);
    return res.data;
  },
};
