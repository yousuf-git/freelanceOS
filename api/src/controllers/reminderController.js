import { Reminder } from '../models/Reminder.js';
import { recomputeReliability } from '../services/reliabilityService.js';
import { emitToAccount } from '../sockets/index.js';

export async function updateReminder(req, res, next) {
  try {
    const { status } = req.body;
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, accountId: req.accountId },
      { status, sentAt: status === 'sent' ? new Date() : undefined },
      { new: true }
    );
    if (!reminder) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Reminder not found' } });
    }
    // Recompute client reliability
    const score = await recomputeReliability(reminder.clientId.toString(), req.accountId);
    emitToAccount(req.accountId, 'reliability:updated', { clientId: reminder.clientId, reliabilityScore: score });
    res.json({ data: reminder });
  } catch (err) { next(err); }
}
