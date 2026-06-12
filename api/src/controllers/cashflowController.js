import { buildTimeline } from '../services/cashflowService.js';
import { Account } from '../models/Account.js';

export async function getTimeline(req, res, next) {
  try {
    const { from, to, openingBalanceMinor } = req.query;
    const account = req.account || await Account.findById(req.accountId);

    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const toDate = to ? new Date(to) : new Date(new Date().getFullYear(), new Date().getMonth() + 3, 0);
    const opening = openingBalanceMinor ? Number(openingBalanceMinor) : 0;

    const timeline = await buildTimeline(req.accountId, fromDate, toDate, opening);

    res.json({
      data: {
        baseCurrency: account.baseCurrency,
        openingBalanceMinor: timeline.openingBalanceMinor,
        dangerZoneThresholdMinor: account.dangerZoneThresholdMinor || 0,
        events: timeline.events.map(e => ({
          date: typeof e.date === 'object' ? e.date.toISOString().split('T')[0] : e.date,
          type: e.type,
          label: e.reference?.invoiceNumber || e.reference?.title || e.type,
          refId: e.reference?.invoiceId || e.reference?.paymentId || e.reference?.expenseId || null,
          amountBaseMinor: e.amountBaseMinor,
          confidence: e.type === 'confirmed_income' ? 'confirmed' : e.type === 'expected_income' ? 'expected' : 'scheduled',
        })),
        balancePoints: timeline.events.map(e => ({
          date: typeof e.date === 'object' ? e.date.toISOString().split('T')[0] : e.date,
          projectedBalanceMinor: e.runningBalanceBaseMinor,
          inDanger: e.runningBalanceBaseMinor < (account.dangerZoneThresholdMinor || 0),
        })),
        dangerWindows: timeline.dangerWindows.map(dw => ({
          from: typeof dw.from === 'object' ? dw.from.toISOString().split('T')[0] : dw.from,
          to: typeof dw.to === 'object' ? dw.to.toISOString().split('T')[0] : dw.to,
          minBalanceMinor: dw.minBalanceMinor,
        })),
      },
    });
  } catch (err) { next(err); }
}
