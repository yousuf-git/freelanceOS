import http from '../http';

export const platforms = {
  async list(params = {}) {
    const res = await http.get('/platforms', { params });
    return res.data;
  },
  async get(id) {
    const res = await http.get(`/platforms/${id}`);
    return res.data;
  },
  async create(body) {
    const res = await http.post('/platforms', body);
    return res.data;
  },
  async update(id, body) {
    const res = await http.patch(`/platforms/${id}`, body);
    return res.data;
  },
  async remove(id, force = false) {
    const res = await http.delete(`/platforms/${id}${force ? '?force=true' : ''}`);
    return res.data;
  },
};
