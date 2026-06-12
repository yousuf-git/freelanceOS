import { AccountLink } from '../models/AccountLink.js';
import { User } from '../models/User.js';
import { Account } from '../models/Account.js';
import { TaxConfig } from '../models/TaxConfig.js';
import { Platform } from '../models/Platform.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { PK_FBR_SLABS } from './taxController.js';
import { v4 as uuidv4 } from 'uuid';

function generateAccessToken(user, accountId) {
  return jwt.sign(
    { userId: user._id.toString(), accountId: accountId?.toString(), role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TTL }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user._id.toString() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TTL }
  );
}

export async function listAccountants(req, res, next) {
  try {
    const links = await AccountLink.find({ accountId: req.accountId }).sort({ invitedAt: -1 });
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const total = links.length;
    const sliced = links.slice((page - 1) * limit, page * limit);
    const data = sliced.map(l => ({
      id: l._id,
      email: l.email,
      status: l.status,
      token: l.status === 'pending' ? l.inviteToken : undefined,
      invitedAt: l.invitedAt,
      acceptedAt: l.acceptedAt,
    }));
    res.json({ data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
}

export async function inviteAccountant(req, res, next) {
  try {
    const { email } = req.body;
    const existing = await AccountLink.findOne({ accountId: req.accountId, email });
    if (existing && existing.status !== 'revoked') {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'Accountant already invited for this account' } });
    }
    const token = uuidv4();
    const link = await AccountLink.create({
      accountId: req.accountId,
      email,
      inviteToken: token,
      status: 'pending',
    });
    res.status(201).json({
      data: {
        id: link._id,
        email: link.email,
        status: link.status,
        token: link.inviteToken,
        invitedAt: link.invitedAt,
        acceptedAt: null,
      },
    });
  } catch (err) { next(err); }
}

export async function revokeAccountant(req, res, next) {
  try {
    const link = await AccountLink.findOneAndUpdate(
      { _id: req.params.id, accountId: req.accountId },
      { status: 'revoked' },
      { new: true }
    );
    if (!link) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Accountant link not found' } });
    }
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function acceptInvite(req, res, next) {
  try {
    const { token, name, password } = req.body;
    const link = await AccountLink.findOne({ inviteToken: token, status: 'pending' });
    if (!link) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invalid or expired invite token' } });
    }

    // Check if user with this email already exists
    let user = await User.findOne({ email: link.email });
    if (!user) {
      if (!name || !password) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'name and password required for new accountant' } });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      user = await User.create({ name, email: link.email, passwordHash, role: 'accountant' });
    }

    // Activate link
    link.accountantUserId = user._id;
    link.status = 'active';
    link.acceptedAt = new Date();
    link.inviteToken = null;
    await link.save();

    const accessToken = generateAccessToken(user, link.accountId);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await User.findByIdAndUpdate(user._id, { refreshTokenHash });

    res.status(201).json({
      data: {
        user: { id: user._id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) { next(err); }
}
