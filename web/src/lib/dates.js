import { format, formatDistanceToNow, parseISO, isAfter, isBefore, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, addDays, differenceInDays } from 'date-fns';

export function formatDate(isoString, pattern = 'dd MMM yyyy') {
  if (!isoString) return '—';
  return format(parseISO(isoString), pattern);
}

export function formatDateShort(isoString) {
  return formatDate(isoString, 'dd MMM yy');
}

export function formatDateTime(isoString) {
  return formatDate(isoString, 'dd MMM yyyy, HH:mm');
}

export function formatRelative(isoString) {
  if (!isoString) return '—';
  return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
}

export function isOverdue(dueDateIso) {
  if (!dueDateIso) return false;
  return isBefore(parseISO(dueDateIso), new Date());
}

export function daysSince(isoString) {
  if (!isoString) return 0;
  return differenceInDays(new Date(), parseISO(isoString));
}

export function getPeriodRange(period, date = new Date()) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (period === 'month') return { from: startOfMonth(d), to: endOfMonth(d) };
  if (period === 'quarter') return { from: startOfQuarter(d), to: endOfQuarter(d) };
  if (period === 'year') return { from: startOfYear(d), to: endOfYear(d) };
  return { from: startOfMonth(d), to: endOfMonth(d) };
}

export function toISODate(date) {
  if (!date) return null;
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
}

export function todayISO() {
  return new Date().toISOString();
}

export function addDaysISO(isoString, days) {
  return addDays(parseISO(isoString), days).toISOString();
}

export function monthLabel(isoMonth) {
  // isoMonth = "2026-06"
  return format(parseISO(isoMonth + '-01'), 'MMM yyyy');
}
