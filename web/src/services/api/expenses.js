import http from '../http';

export const expenses = {
  async list(params = {}) {
    const res = await http.get('/expenses', { params });
    return res.data;
  },
  async get(id) {
    const res = await http.get(`/expenses/${id}`);
    return res.data;
  },
  async create(body) {
    const res = await http.post('/expenses', body);
    return res.data;
  },
  async update(id, body) {
    const res = await http.patch(`/expenses/${id}`, body);
    return res.data;
  },
  async remove(id) {
    const res = await http.delete(`/expenses/${id}`);
    return res.data;
  },
  async getCategorySummary(params = {}) {
    const res = await http.get('/expenses/categories/summary', { params });
    return res.data;
  },
};
