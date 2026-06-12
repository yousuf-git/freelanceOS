import { sleep } from '../../lib/utils';

const MOCK_RATES = {
  'USD_PKR': 282.0,
  'EUR_PKR': 307.0,
  'GBP_PKR': 355.0,
  'AED_PKR': 76.8,
  'CAD_PKR': 208.0,
  'AUD_PKR': 187.0,
  'PKR_USD': 0.00354,
  'PKR_EUR': 0.00326,
  'PKR_GBP': 0.00282,
};

export const forex = {
  async getRate({ base, quote, date } = {}) {
    await sleep(250);
    const key = `${base}_${quote}`;
    const rate = MOCK_RATES[key];
    if (!rate) {
      const e = new Error('Forex unavailable');
      e.status = 424;
      e.data = { error: { code: 'FOREX_UNAVAILABLE', message: 'Rate not available for this pair' } };
      throw e;
    }
    return {
      data: {
        base,
        quote,
        date: date || new Date().toISOString().split('T')[0],
        rate,
        source: 'frankfurter',
        cached: true,
      },
    };
  },
};
