import http from '../http';

export const clients = {
  async list(params = {}) {
    const res = await http.get('/clients', { params });
    return res.data;
  },
  async get(id) {
    const res = await http.get(`/clients/${id}`);
    return res.data;
  },
  async create(body) {
    const res = await http.post('/clients', body);
    return res.data;
  },
  async update(id, body) {
    const res = await http.patch(`/clients/${id}`, body);
    return res.data;
  },
  async remove(id, force = false) {
    const res = await http.delete(`/clients/${id}${force ? '?force=true' : ''}`);
    return res.data;
  },
  async getNotes(clientId, params = {}) {
    const res = await http.get(`/clients/${clientId}/notes`, { params });
    return res.data;
  },
  async addNote(clientId, body) {
    const res = await http.post(`/clients/${clientId}/notes`, body);
    return res.data;
  },
  async deleteNote(clientId, noteId) {
    const res = await http.delete(`/clients/${clientId}/notes/${noteId}`);
    return res.data;
  },
};
