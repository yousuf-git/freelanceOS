import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { Expense } from '../models/Expense.js';
import { Account } from '../models/Account.js';
import { ForexRate } from '../models/ForexRate.js';

/**
 * Get the last known forex rate from cache (no live fetch).
 * Returns 1 if not found.
 */
async function getLastKnownRate(base, quote) {
  if (base === quote) return 1;
  const record = await ForexRate.findOne({ base, quote }).sort({ date: -1 });
  return record ? record.rate : 1;
}

/**
 * Build cashflow timeline for an account.
 * @param {string} accountId
 * @param {Date} from
 * @param {Date} to
 * @param {number} openingBalanceMinor
 * @returns {Promise<object>}
 */
export async function buildTimeline(accountId, from, to, openingBalanceMinor = 0) {
  const account = await Account.findById(accountId);
  if (!account) throw new Error('Account not found');

  const baseCurrency = account.baseCurrency;

  // Outstanding invoices (sent/partially_paid) — expected income at dueDate
  const outstandingInvoices = await Invoice.find({
    accountId,
    status: { $in: ['sent', 'partially_paid', 'overdue'] },
    dueDate: { $gte: from, $lte: to },
  });

  // Confirmed payments
  const payments = await Payment.find({
    accountId,
    paidAt: { $gte: from, $lte: to },
  });

  // Expenses
  const expenses = await Expense.find({
    accountId,
    incurredAt: { $gte: from, $lte: to },
  });

  // Build events array
  const events = [];

  for (const inv of outstandingInvoices) {
    const rate = inv.currency !== baseCurrency
      ? await getLastKnownRate(inv.currency, baseCurrency)
      : 1;
    const amountBaseMinor = Math.round(inv.amountDueMinor * rate);
    events.push({
      date: inv.dueDate,
      type: 'expected_income',
      amountBaseMinor,
      currency: baseCurrency,
      reference: { invoiceId: inv._id, invoiceNumber: inv.number },
    });
  }

  for (const pay of payments) {
    events.push({
      date: pay.paidAt,
      type: 'confirmed_income',
      amountBaseMinor: pay.netReceivedBaseMinor || 0,
      currency: baseCurrency,
      reference: { paymentId: pay._id, invoiceId: pay.invoiceId },
    });
  }

  for (const exp of expenses) {
    events.push({
      date: exp.incurredAt,
      type: 'expense',
      amountBaseMinor: -(exp.amountBaseMinor || 0),
      currency: baseCurrency,
      reference: { expenseId: exp._id, title: exp.title },
    });
  }

  // Sort by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Build day-by-day running balance
  let runningBalance = openingBalanceMinor;
  const timeline = [];
  const dangerWindows = [];
  let dangerStart = null;

  for (const ev of events) {
    runningBalance += ev.amountBaseMinor;
    timeline.push({
      ...ev,
      runningBalanceBaseMinor: runningBalance,
    });

    const threshold = account.dangerZoneThresholdMinor || 0;
    if (runningBalance < threshold && dangerStart === null) {
      dangerStart = ev.date;
    } else if (runningBalance >= threshold && dangerStart !== null) {
      dangerWindows.push({ from: dangerStart, to: ev.date, minBalanceMinor: runningBalance });
      dangerStart = null;
    }
  }

  if (dangerStart !== null) {
    const minBalance = Math.min(...timeline.filter(e => new Date(e.date) >= new Date(dangerStart)).map(e => e.runningBalanceBaseMinor));
    dangerWindows.push({ from: dangerStart, to, minBalanceMinor: minBalance });
  }

  return {
    from,
    to,
    openingBalanceMinor,
    closingBalanceMinor: runningBalance,
    currency: baseCurrency,
    events: timeline,
    dangerWindows,
  };
}
