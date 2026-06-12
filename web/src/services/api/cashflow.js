import http from '../http';

export const cashflow = {
  async getTimeline(params = {}) {
    const res = await http.get('/cashflow/timeline', { params });
    return res.data;
  },
};
