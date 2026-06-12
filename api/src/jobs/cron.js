import cron from 'node-cron';
import { Invoice } from '../models/Invoice.js';
import { Client } from '../models/Client.js';
import { recomputeReliability } from '../services/reliabilityService.js';
import { emitToAccount } from '../sockets/index.js';

/**
 * Daily job: recompute overdue aging, reliability scores, danger-zone alerts.
 */
async function dailyRecompute() {
  console.log('[cron] Running daily recompute...');
  try {
    const now = new Date();

    // Update overdue aging buckets for all non-final invoices
    const activeInvoices = await Invoice.find({
      status: { $in: ['sent', 'partially_paid', 'overdue'] },
    });

    for (const inv of activeInvoices) {
      const overdueDays = inv.dueDate < now
        ? Math.floor((now - inv.dueDate) / (1000 * 60 * 60 * 24))
        : 0;

      let agingBucket = 'current';
      if (overdueDays > 90) agingBucket = 'd90plus';
      else if (overdueDays > 60) agingBucket = 'd60';
      else if (overdueDays > 30) agingBucket = 'd30';

      const newStatus = overdueDays > 0 && inv.status !== 'partially_paid' ? 'overdue' : inv.status;
      await Invoice.findByIdAndUpdate(inv._id, { overdueDays, agingBucket, status: newStatus });
    }

    // Recompute reliability for all clients with active invoices
    const clientIds = [...new Set(activeInvoices.map(i => i.clientId.toString()))];
    for (const clientId of clientIds) {
      const client = await Client.findById(clientId);
      if (!client) continue;
      const score = await recomputeReliability(clientId, client.accountId.toString());
      emitToAccount(client.accountId.toString(), 'reliability:updated', { clientId, reliabilityScore: score });
    }

    console.log('[cron] Daily recompute complete');
  } catch (err) {
    console.error('[cron] Daily recompute error:', err.message);
  }
}

export function startCronJobs() {
  // Run daily at 00:05 UTC
  cron.schedule('5 0 * * *', dailyRecompute);
  console.log('[cron] Scheduled daily recompute at 00:05 UTC');
}
