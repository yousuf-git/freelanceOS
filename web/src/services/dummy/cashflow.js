import { sleep } from '../../lib/utils';
import { cashflowTimeline } from './fixtures/index';

export const cashflow = {
  async getTimeline({ from, to, openingBalanceMinor } = {}) {
    await sleep(400);
    return { data: { ...cashflowTimeline, openingBalanceMinor: openingBalanceMinor || cashflowTimeline.openingBalanceMinor } };
  },
};
