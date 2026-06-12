import { sleep } from '../../lib/utils';
import { currentUser } from './fixtures/index';

let _user = { ...currentUser };

export const auth = {
  async register({ name, email, password, baseCurrency }) {
    await sleep(600);
    _user = { id: 'usr_new_001', email, name, role: 'freelancer', createdAt: new Date().toISOString() };
    return {
      data: {
        user: { ..._user },
        accessToken: 'dummy_access_token',
        refreshToken: 'dummy_refresh_token',
      },
    };
  },

  async login({ email, password }) {
    await sleep(500);
    if (email === 'wrong@email.com') {
      const err = new Error('Invalid credentials');
      err.status = 401;
      err.data = { error: { code: 'UNAUTHENTICATED', message: 'Invalid email or password' } };
      throw err;
    }
    return {
      data: {
        user: { ..._user, email },
        accessToken: 'dummy_access_token',
        refreshToken: 'dummy_refresh_token',
      },
    };
  },

  async refresh({ refreshToken }) {
    await sleep(200);
    return {
      data: {
        accessToken: 'dummy_access_token_new',
        refreshToken: 'dummy_refresh_token_new',
      },
    };
  },

  async logout() {
    await sleep(200);
    return null;
  },

  async me() {
    await sleep(200);
    return { data: { user: { ..._user } } };
  },
};
