/**
 * Money formatting utilities.
 * All amounts stored as integer minor units (paisa/cents/pence).
 * Format ONLY at display layer — never do math on formatted strings.
 */

const CURRENCY_CONFIG = {
  PKR: { symbol: '₨', locale: 'en-PK', decimals: 2, divisor: 100 },
  USD: { symbol: '$', locale: 'en-US', decimals: 2, divisor: 100 },
  EUR: { symbol: '€', locale: 'de-DE', decimals: 2, divisor: 100 },
  GBP: { symbol: '£', locale: 'en-GB', decimals: 2, divisor: 100 },
  AED: { symbol: 'د.إ', locale: 'ar-AE', decimals: 2, divisor: 100 },
  CAD: { symbol: 'CA$', locale: 'en-CA', decimals: 2, divisor: 100 },
  AUD: { symbol: 'A$', locale: 'en-AU', decimals: 2, divisor: 100 },
};

/**
 * Convert minor units to major units (e.g. 150000 PKR paisa → 1500.00 PKR)
 */
export function minorToMajor(amountMinor, currency) {
  const cfg = CURRENCY_CONFIG[currency] || { divisor: 100, decimals: 2 };
  return amountMinor / cfg.divisor;
}

/**
 * Convert major units to minor units
 */
export function majorToMinor(amount, currency) {
  const cfg = CURRENCY_CONFIG[currency] || { divisor: 100, decimals: 2 };
  return Math.round(Number(amount) * cfg.divisor);
}

/**
 * Format a minor-unit amount for display.
 * Returns string like "PKR 1,500.00" or "$ 1,500.00"
 * @param {number} amountMinor
 * @param {string} currency ISO-4217
 * @param {object} options
 * @param {boolean} options.compact - Use K/M abbreviation for large numbers
 * @param {boolean} options.symbolOnly - Omit currency code
 * @param {boolean} options.codeOnly - Show code not symbol
 */
export function formatMoney(amountMinor, currency, options = {}) {
  if (amountMinor === null || amountMinor === undefined) return '—';
  const cfg = CURRENCY_CONFIG[currency] || { divisor: 100, decimals: 2, locale: 'en-US' };
  const major = amountMinor / cfg.divisor;

  if (options.compact && Math.abs(major) >= 1_000_000) {
    const m = (major / 1_000_000).toFixed(2);
    return `${currency} ${m}M`;
  }
  if (options.compact && Math.abs(major) >= 1_000) {
    const k = (major / 1_000).toFixed(1);
    return `${currency} ${k}K`;
  }

  const formatted = new Intl.NumberFormat(cfg.locale, {
    minimumFractionDigits: cfg.decimals,
    maximumFractionDigits: cfg.decimals,
  }).format(major);

  if (options.symbolOnly) return `${cfg.symbol}${formatted}`;
  if (options.codeOnly) return `${currency} ${formatted}`;
  return `${currency} ${formatted}`;
}

/**
 * Format just the numeric part (no currency prefix) — mono display
 */
export function formatAmount(amountMinor, currency) {
  if (amountMinor === null || amountMinor === undefined) return '—';
  const cfg = CURRENCY_CONFIG[currency] || { divisor: 100, decimals: 2, locale: 'en-US' };
  const major = amountMinor / cfg.divisor;
  return new Intl.NumberFormat(cfg.locale, {
    minimumFractionDigits: cfg.decimals,
    maximumFractionDigits: cfg.decimals,
  }).format(major);
}

/**
 * Format a PKR base-currency amount with compact notation for dashboard
 */
export function formatPKR(amountMinor, compact = false) {
  return formatMoney(amountMinor, 'PKR', { compact });
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency) {
  return (CURRENCY_CONFIG[currency] || {}).symbol || currency;
}

/**
 * All supported currencies list
 */
export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_CONFIG);

/**
 * Parse a user-typed decimal string to minor units
 */
export function parseMoneyInput(str, currency) {
  const num = parseFloat(String(str).replace(/,/g, ''));
  if (isNaN(num)) return 0;
  return majorToMinor(num, currency);
}

/**
 * Net vs Gross label helper
 */
export function moneyLabel(amountMinor, currency, variant = 'default') {
  const base = formatMoney(amountMinor, currency);
  if (variant === 'net') return { value: base, className: 'text-green-600 money font-semibold' };
  if (variant === 'gross') return { value: base, className: 'text-slate-500 money' };
  if (variant === 'danger') return { value: base, className: 'text-red-600 money font-semibold' };
  if (variant === 'warning') return { value: base, className: 'text-amber-600 money font-semibold' };
  return { value: base, className: 'text-slate-900 money' };
}
