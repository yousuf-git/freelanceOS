import { sleep } from '../../lib/utils';
import { accountSettings as _settings } from './fixtures/index';

let settings = { ..._settings };

export const account = {
  async getSettings() {
    await sleep(250);
    return { data: { ...settings } };
  },

  async updateSettings(patch) {
    await sleep(400);
    settings = { ...settings, ...patch };
    return { data: { ...settings } };
  },
};
