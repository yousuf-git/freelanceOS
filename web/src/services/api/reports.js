import http from '../http';

export const reports = {
  async getAnnualSummary(params = {}) {
    const res = await http.get('/reports/annual-summary', { params });
    return res.data;
  },
  async generateAnnualPdf(body) {
    const res = await http.post('/reports/annual-summary/pdf', body);
    return res.data;
  },
  async getClientProfitability(params = {}) {
    const res = await http.get('/reports/client-profitability', { params });
    return res.data;
  },
  async getPlatformComparison(params = {}) {
    const res = await http.get('/reports/platform-comparison', { params });
    return res.data;
  },
};
