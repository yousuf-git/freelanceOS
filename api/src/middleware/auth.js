import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Account } from '../models/Account.js';
import { AccountLink } from '../models/AccountLink.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Missing or invalid authorization header' } });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = { userId: payload.userId, accountId: payload.accountId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired access token' } });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Not authenticated' } });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
    }
    next();
  };
}

export const requireFreelancer = requireRole('freelancer');

export async function accountScope(req, res, next) {
  try {
    if (req.user.role === 'freelancer') {
      // freelancer: use their own accountId
      const account = await Account.findOne({ ownerUserId: req.user.userId });
      if (!account) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Account not found' } });
      }
      req.accountId = account._id.toString();
      req.account = account;
      return next();
    }

    if (req.user.role === 'accountant') {
      const headerAccountId = req.headers['x-account-id'];
      if (!headerAccountId) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'X-Account-Id header required for accountants' } });
      }
      // Verify active accountLink
      const link = await AccountLink.findOne({
        accountId: headerAccountId,
        accountantUserId: req.user.userId,
        status: 'active',
      });
      if (!link) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Account not found or access not granted' } });
      }
      const account = await Account.findById(headerAccountId);
      if (!account) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Account not found' } });
      }
      req.accountId = headerAccountId;
      req.account = account;
      return next();
    }

    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Unknown role' } });
  } catch (err) {
    next(err);
  }
}
