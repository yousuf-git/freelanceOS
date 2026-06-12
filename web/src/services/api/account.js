import http from '../http';

export const account = {
  async getSettings() {
    const res = await http.get('/account/settings');
    return res.data;
  },
  async updateSettings(patch) {
    const res = await http.patch('/account/settings', patch);
    return res.data;
  },
};
