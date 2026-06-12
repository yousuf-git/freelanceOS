import { sleep } from '../../lib/utils';
import { annualSummary, clientProfitability, platformComparison } from './fixtures/index';

export const reports = {
  async getAnnualSummary({ fiscalYear } = {}) {
    await sleep(500);
    return { data: { ...annualSummary, fiscalYear: fiscalYear || annualSummary.fiscalYear } };
  },

  async generateAnnualPdf({ fiscalYear } = {}) {
    await sleep(2000);
    return { data: { pdfUrl: `https://s3.amazonaws.com/freelanceos-exports/reports/annual-${fiscalYear || 2026}.pdf` } };
  },

  async getClientProfitability({ from, to, sort } = {}) {
    await sleep(400);
    let clients = [...clientProfitability.clients];
    if (sort === '-netBaseMinor') clients.sort((a, b) => b.netBaseMinor - a.netBaseMinor);
    return { data: { ...clientProfitability, clients } };
  },

  async getPlatformComparison({ from, to } = {}) {
    await sleep(350);
    return { data: { ...platformComparison } };
  },
};
