import { Account } from '../models/Account.js';

export async function getSettings(req, res, next) {
  try {
    const account = req.account || await Account.findById(req.accountId);
    if (!account) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }
    res.json({ data: account });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const allowed = ['baseCurrency', 'taxRegime', 'fiscalYearStartMonth', 'dangerZoneThresholdMinor', 'dangerZoneCurrency'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const account = await Account.findByIdAndUpdate(req.accountId, updates, { new: true });
    if (!account) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }
    res.json({ data: account });
  } catch (err) {
    next(err);
  }
}
