import http from '../http';

export const forex = {
  async getRate(params = {}) {
    const res = await http.get('/forex/rate', { params });
    return res.data;
  },
};
