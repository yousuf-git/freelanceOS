import { sleep } from '../../lib/utils';
import { dashboardSummary, dashboardTrends } from './fixtures/index';

export const dashboard = {
  async getSummary({ period = 'month', date } = {}) {
    await sleep(350);
    return { data: dashboardSummary[period] || dashboardSummary.month };
  },

  async getTrends({ granularity = 'month', months = 12 } = {}) {
    await sleep(400);
    const series = dashboardTrends.series.slice(-months);
    return { data: { ...dashboardTrends, series } };
  },
};
