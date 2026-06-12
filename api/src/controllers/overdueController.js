import { Invoice } from '../models/Invoice.js';
import { Client } from '../models/Client.js';
import { Account } from '../models/Account.js';
import { getRate } from '../services/forexService.js';

export async function getOverdue(req, res, next) {
  try {
    const { bucket, clientId } = req.query;
    const account = req.account || await Account.findById(req.accountId);
    const baseCurrency = account.baseCurrency;

    const match = {
      accountId: account._id,
      status: { $in: ['sent', 'partially_paid', 'overdue'] },
    };
    if (clientId) match.clientId = clientId;
    if (bucket) match.agingBucket = bucket;

    const invoices = await Invoice.find(match).sort({ dueDate: 1 });

    // Build buckets summary
    const buckets = {
      current: { count: 0, totalBaseMinor: 0 },
      d30: { count: 0, totalBaseMinor: 0 },
      d60: { count: 0, totalBaseMinor: 0 },
      d90plus: { count: 0, totalBaseMinor: 0 },
    };

    const result = [];
    for (const inv of invoices) {
      const rate = inv.currency !== baseCurrency ? await getRate(inv.currency, baseCurrency).then(r => r.rate).catch(() => 1) : 1;
      const amountDueBaseMinor = Math.round(inv.amountDueMinor * rate);
      const b = inv.agingBucket || 'current';
      if (buckets[b]) {
        buckets[b].count++;
        buckets[b].totalBaseMinor += amountDueBaseMinor;
      }

      const client = await Client.findById(inv.clientId).select('name').lean();
      result.push({
        invoiceId: inv._id,
        number: inv.number,
        clientId: inv.clientId,
        clientName: client?.name || 'Unknown',
        dueDate: inv.dueDate,
        overdueDays: inv.overdueDays || 0,
        agingBucket: b,
        amountDueMinor: inv.amountDueMinor,
        currency: inv.currency,
        amountDueBaseMinor,
      });
    }

    res.json({ data: { baseCurrency, buckets, invoices: result } });
  } catch (err) { next(err); }
}
