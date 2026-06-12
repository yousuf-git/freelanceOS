import http from '../http';

export const tax = {
  async getConfig() {
    const res = await http.get('/tax/config');
    return res.data;
  },
  async putConfig(body) {
    const res = await http.put('/tax/config', body);
    return res.data;
  },
  async getPresets() {
    const res = await http.get('/tax/presets');
    return res.data;
  },
  async getLiability(params = {}) {
    const res = await http.get('/tax/liability', { params });
    return res.data;
  },
};
