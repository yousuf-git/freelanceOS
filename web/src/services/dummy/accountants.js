import { sleep } from '../../lib/utils';
import { accountants as _accountants } from './fixtures/index';

let _data = [..._accountants];

function paginate(items, page = 1, limit = 20) {
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export const accountants = {
  async list({ page = 1, limit = 20 } = {}) {
    await sleep(250);
    return paginate(_data, page, limit);
  },

  async invite({ email }) {
    await sleep(450);
    const item = {
      id: 'act_' + Date.now(),
      email,
      status: 'pending',
      token: 'inv_tok_' + Math.random().toString(36).slice(2, 10),
      invitedAt: new Date().toISOString(),
      acceptedAt: null,
    };
    _data.push(item);
    return { data: { ...item } };
  },

  async revoke(id) {
    await sleep(350);
    _data = _data.filter(a => a.id !== id);
    return null;
  },

  async accept({ token, name, password }) {
    await sleep(600);
    return {
      data: {
        user: {
          id: 'usr_act_' + Date.now(),
          email: 'accountant@example.com',
          name,
          role: 'accountant',
          createdAt: new Date().toISOString(),
        },
        accessToken: 'dummy_accountant_access_token',
        refreshToken: 'dummy_accountant_refresh_token',
      },
    };
  },
};
