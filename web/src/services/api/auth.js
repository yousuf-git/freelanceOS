import http from '../http';

export const auth = {
  async register(body) {
    const res = await http.post('/auth/register', body);
    return res.data;
  },
  async login(body) {
    const res = await http.post('/auth/login', body);
    return res.data;
  },
  async refresh(body) {
    const res = await http.post('/auth/refresh', body);
    return res.data;
  },
  async logout(body) {
    const res = await http.post('/auth/logout', body);
    return res.data;
  },
  async me() {
    const res = await http.get('/auth/me');
    return res.data;
  },
};
