import { Platform } from '../models/Platform.js';
import { Invoice } from '../models/Invoice.js';

export async function listPlatforms(req, res, next) {
  try {
    const platforms = await Platform.find({ accountId: req.accountId }).sort({ name: 1 });
    res.json({ data: platforms });
  } catch (err) {
    next(err);
  }
}

export async function createPlatform(req, res, next) {
  try {
    const platform = await Platform.create({ ...req.body, accountId: req.accountId });
    res.status(201).json({ data: platform });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'Platform name already exists' } });
    }
    next(err);
  }
}

export async function getPlatform(req, res, next) {
  try {
    const platform = await Platform.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!platform) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Platform not found' } });
    }
    res.json({ data: platform });
  } catch (err) {
    next(err);
  }
}

export async function updatePlatform(req, res, next) {
  try {
    const platform = await Platform.findOneAndUpdate(
      { _id: req.params.id, accountId: req.accountId },
      req.body,
      { new: true }
    );
    if (!platform) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Platform not found' } });
    }
    res.json({ data: platform });
  } catch (err) {
    next(err);
  }
}

export async function deletePlatform(req, res, next) {
  try {
    const platform = await Platform.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!platform) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Platform not found' } });
    }

    if (!req.query.force) {
      const referencedCount = await Invoice.countDocuments({ platformId: platform._id });
      if (referencedCount > 0) {
        return res.status(409).json({
          error: { code: 'CONFLICT', message: `Platform is referenced by ${referencedCount} invoice(s). Use ?force to delete anyway.` },
        });
      }
    }

    await Platform.findByIdAndDelete(platform._id);
    res.json({ data: { message: 'Platform deleted' } });
  } catch (err) {
    next(err);
  }
}
