import { ForexRate } from '../models/ForexRate.js';
import { env } from '../config/env.js';

const TIMEOUT_MS = 5000;

function todayString() {
  return new Date().toISOString().split('T')[0];
}

async function fetchWithTimeout(url, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFrankfurter(base, quote, date) {
  const url = `${env.FOREX_PRIMARY}/${date}?from=${base}&to=${quote}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Frankfurter responded ${res.status}`);
  const data = await res.json();
  const rate = data.rates && data.rates[quote];
  if (!rate) throw new Error(`No rate for ${quote} from frankfurter`);
  return { rate, source: 'frankfurter' };
}

async function fetchExchangeRateApi(base, quote, date) {
  if (!env.EXCHANGERATE_API_KEY) throw new Error('EXCHANGERATE_API_KEY not configured');
  const [year, month, day] = date.split('-');
  const url = `${env.FOREX_FALLBACK}/${env.EXCHANGERATE_API_KEY}/history/${base}/${year}/${month}/${day}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`ExchangeRate-API responded ${res.status}`);
  const data = await res.json();
  if (data.result !== 'success') throw new Error(`ExchangeRate-API error: ${data['error-type']}`);
  const rate = data.conversion_rates && data.conversion_rates[quote];
  if (!rate) throw new Error(`No rate for ${quote} from exchangerate-api`);
  return { rate, source: 'exchangerate-api' };
}

/**
 * Get the forex rate for base/quote on a given date.
 * @param {string} base
 * @param {string} quote
 * @param {string|Date} [date] - defaults to today
 * @returns {Promise<{ rate: number, source: string, cached: boolean }>}
 */
export async function getRate(base, quote, date) {
  if (base === quote) {
    return { rate: 1, source: 'manual', cached: false };
  }

  const dateStr = date
    ? (date instanceof Date ? date.toISOString().split('T')[0] : String(date))
    : todayString();

  // Check cache
  const cached = await ForexRate.findOne({ base, quote, date: dateStr });
  if (cached) {
    return { rate: cached.rate, source: cached.source, cached: true };
  }

  let result;
  try {
    result = await fetchFrankfurter(base, quote, dateStr);
  } catch (primaryErr) {
    try {
      result = await fetchExchangeRateApi(base, quote, dateStr);
    } catch (fallbackErr) {
      const err = new Error(`Forex unavailable for ${base}/${quote} on ${dateStr}`);
      err.code = 'FOREX_UNAVAILABLE';
      throw err;
    }
  }

  // Cache
  try {
    await ForexRate.create({
      base,
      quote,
      date: dateStr,
      rate: result.rate,
      source: result.source,
    });
  } catch (_) {
    // ignore duplicate key on race condition
  }

  return { rate: result.rate, source: result.source, cached: false };
}
