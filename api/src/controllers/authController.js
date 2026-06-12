import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Account } from '../models/Account.js';
import { AccountLink } from '../models/AccountLink.js';
import { TaxConfig } from '../models/TaxConfig.js';
import { Platform } from '../models/Platform.js';
import { env } from '../config/env.js';
import { PK_FBR_SLABS } from './taxController.js';

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

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'Email already registered' } });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role: role || 'freelancer' });

    let account = null;
    if (user.role === 'freelancer') {
      account = await Account.create({ ownerUserId: user._id });
      // Create default tax config
      await TaxConfig.create({
        accountId: account._id,
        regime: 'PK_FBR',
        currency: 'PKR',
        fiscalYearStartMonth: 7,
        slabs: PK_FBR_SLABS,
        isCustom: false,
      });
      // Create default platforms
      await Platform.insertMany([
        {
          accountId: account._id,
          name: 'Upwork',
          isSystemDefault: true,
          feeModel: 'sliding',
          feeConfig: {
            tiers: [
              { uptoLifetimeMinor: 50000000, percent: 20 },
              { uptoLifetimeMinor: 500000000, percent: 10 },
              { uptoLifetimeMinor: null, percent: 5 },
            ],
          },
        },
        {
          accountId: account._id,
          name: 'Fiverr',
          isSystemDefault: true,
          feeModel: 'flat',
          feeConfig: { percent: 20 },
        },
        {
          accountId: account._id,
          name: 'Direct',
          isSystemDefault: true,
          feeModel: 'none',
          feeConfig: {},
        },
      ]);
    }

    const accessToken = generateAccessToken(user, account?._id);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await User.findByIdAndUpdate(user._id, { refreshTokenHash });

    res.status(201).json({
      data: {
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid credentials' } });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid credentials' } });
    }

    let accountId = null;
    if (user.role === 'freelancer') {
      const account = await Account.findOne({ ownerUserId: user._id });
      accountId = account?._id;
    }

    const accessToken = generateAccessToken(user, accountId);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await User.findByIdAndUpdate(user._id, { refreshTokenHash });

    res.json({
      data: {
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    let payload;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid refresh token' } });
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Token revoked' } });
    }

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid refresh token' } });
    }

    let accountId = null;
    if (user.role === 'freelancer') {
      const account = await Account.findOne({ ownerUserId: user._id });
      accountId = account?._id;
    }

    const newAccessToken = generateAccessToken(user, accountId);
    const newRefreshToken = generateRefreshToken(user);
    const newHash = await bcrypt.hash(newRefreshToken, 10);
    await User.findByIdAndUpdate(user._id, { refreshTokenHash: newHash });

    res.json({
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user.userId, { refreshTokenHash: null });
    res.json({ data: { message: 'Logged out successfully' } });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash -refreshTokenHash');
    if (!user) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const result = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    if (user.role === 'accountant') {
      const links = await AccountLink.find({
        accountantUserId: user._id,
        status: 'active',
      }).populate({ path: 'accountId', populate: { path: 'ownerUserId', select: 'name' } });

      result.accounts = links.map((l) => ({
        accountId: l.accountId?._id,
        freelancerName: l.accountId?.ownerUserId?.name,
      }));
    }

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}
