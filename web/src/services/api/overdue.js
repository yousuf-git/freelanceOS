import http from '../http';

export const overdue = {
  async getOverdue(params = {}) {
    const res = await http.get('/overdue', { params });
    return res.data;
  },
};
