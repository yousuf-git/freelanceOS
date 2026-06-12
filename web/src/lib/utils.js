import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

export function truncate(str, len = 40) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-cyan-100 text-cyan-700',
  partially_paid: 'bg-teal-100 text-teal-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  void: 'bg-slate-200 text-slate-500',
};

export const AGING_COLORS = {
  current: 'bg-slate-100 text-slate-600',
  d30: 'bg-amber-100 text-amber-700',
  d60: 'bg-orange-100 text-orange-700',
  d90plus: 'bg-red-100 text-red-700',
};

export const AGING_LABELS = {
  current: 'Current',
  d30: '30 days',
  d60: '60 days',
  d90plus: '90+ days',
};

export const STATUS_LABELS = {
  draft: 'Draft',
  sent: 'Sent',
  partially_paid: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
};

export const CATEGORY_LABELS = {
  software: 'Software',
  hardware: 'Hardware',
  internet: 'Internet',
  coworking: 'Coworking',
  marketing: 'Marketing',
  fees: 'Fees',
  travel: 'Travel',
  other: 'Other',
};

export const CATEGORY_ICONS = {
  software: '💻',
  hardware: '🖥️',
  internet: '📡',
  coworking: '🏢',
  marketing: '📣',
  fees: '💳',
  travel: '✈️',
  other: '📦',
};

export const REGIME_LABELS = {
  PK_FBR: 'Pakistan FBR (TY 2024–25)',
  IN_IT: 'India Income Tax',
  BD_NBR: 'Bangladesh NBR',
  CUSTOM: 'Custom Slabs',
};

export const PLATFORM_COLORS = ['#0F766E', '#0E7490', '#D97706', '#7C3AED', '#DB2777', '#EA580C'];

export function getReliabilityColor(score) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

export function getReliabilityBg(score) {
  if (score >= 80) return 'bg-green-100 text-green-700';
  if (score >= 60) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

export function objectId() {
  // Generate a fake 24-char hex ObjectId for dummy data
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}
