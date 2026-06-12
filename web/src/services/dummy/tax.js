import { sleep } from '../../lib/utils';
import { taxConfig as _config, taxPresets, taxLiability } from './fixtures/index';

let config = { ..._config };

export const tax = {
  async getConfig() {
    await sleep(250);
    return { data: { ...config } };
  },

  async putConfig(body) {
    await sleep(500);
    config = {
      ...config,
      ...body,
      isCustom: body.regime === 'CUSTOM',
      updatedAt: new Date().toISOString(),
    };
    return { data: { ...config } };
  },

  async getPresets() {
    await sleep(200);
    return { data: taxPresets };
  },

  async getLiability({ fiscalYear } = {}) {
    await sleep(350);
    return { data: { ...taxLiability, fiscalYear: fiscalYear || taxLiability.fiscalYear } };
  },
};
