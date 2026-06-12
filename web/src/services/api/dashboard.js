import http from '../http';

export const dashboard = {
  async getSummary(params = {}) {
    const res = await http.get('/dashboard/summary', { params });
    return res.data;
  },
  async getTrends(params = {}) {
    const res = await http.get('/dashboard/trends', { params });
    return res.data;
  },
};
