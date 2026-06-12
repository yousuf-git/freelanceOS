import { getRate } from '../services/forexService.js';

export async function getForexRate(req, res, next) {
  try {
    const { base, quote, date } = req.query;
    if (!base || !quote) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'base and quote are required' } });
    }
    try {
      const result = await getRate(base, quote, date || undefined);
      res.json({ data: { base, quote, date: date || new Date().toISOString().split('T')[0], rate: result.rate, source: result.source, cached: result.cached } });
    } catch (err) {
      if (err.code === 'FOREX_UNAVAILABLE') {
        return res.status(424).json({ error: { code: 'FOREX_UNAVAILABLE', message: err.message } });
      }
      throw err;
    }
  } catch (err) { next(err); }
}
