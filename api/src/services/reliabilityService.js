import { Invoice } from '../models/Invoice.js';
import { Reminder } from '../models/Reminder.js';
import { Client } from '../models/Client.js';

/**
 * Recompute reliability score for a client.
 * Base score 100, deduct for overdue invoices and old pending reminders.
 * @param {string} clientId
 * @param {string} accountId
 * @returns {Promise<number>} score 0-100
 */
export async function recomputeReliability(clientId, accountId) {
  let score = 100;

  // Get overdue invoices
  const overdueInvoices = await Invoice.find({
    clientId,
    accountId,
    status: { $in: ['overdue', 'partially_paid'] },
    dueDate: { $lt: new Date() },
  });

  for (const inv of overdueInvoices) {
    const bucket = inv.agingBucket;
    if (bucket === 'd90plus') score -= 20;
    else if (bucket === 'd60') score -= 10;
    else if (bucket === 'd30') score -= 5;
  }

  // Deduct for old pending reminders (older than 14 days)
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const oldReminders = await Reminder.countDocuments({
    clientId,
    accountId,
    status: 'pending',
    createdAt: { $lt: cutoff },
  });

  score -= oldReminders * 2;

  const finalScore = Math.max(0, Math.min(100, score));

  await Client.findOneAndUpdate(
    { _id: clientId, accountId },
    { reliabilityScore: finalScore }
  );

  return finalScore;
}
