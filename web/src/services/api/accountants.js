import http from '../http';

export const accountants = {
  async list(params = {}) {
    const res = await http.get('/accountants', { params });
    return res.data;
  },
  async invite(body) {
    const res = await http.post('/accountants/invite', body);
    return res.data;
  },
  async revoke(id) {
    const res = await http.delete(`/accountants/${id}`);
    return res.data;
  },
  async accept(body) {
    const res = await http.post('/accountants/accept', body);
    return res.data;
  },
};
