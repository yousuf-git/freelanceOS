import { Client } from '../models/Client.js';
import { ClientNote } from '../models/ClientNote.js';
import { Invoice } from '../models/Invoice.js';
import mongoose from 'mongoose';

function buildSort(sortStr) {
  const sort = {};
  const parts = sortStr.split(',');
  for (const part of parts) {
    if (part.startsWith('-')) sort[part.slice(1)] = -1;
    else sort[part] = 1;
  }
  return sort;
}

export async function listClients(req, res, next) {
  try {
    const { page, limit, search, sort } = req.query;
    const filter = { accountId: req.accountId };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [clients, total] = await Promise.all([
      Client.find(filter).sort(buildSort(sort)).skip(skip).limit(limit),
      Client.countDocuments(filter),
    ]);

    res.json({
      data: clients,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function createClient(req, res, next) {
  try {
    const client = await Client.create({ ...req.body, accountId: req.accountId });
    res.status(201).json({ data: client });
  } catch (err) {
    next(err);
  }
}

export async function getClient(req, res, next) {
  try {
    const client = await Client.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!client) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }
    res.json({ data: client });
  } catch (err) {
    next(err);
  }
}

export async function updateClient(req, res, next) {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, accountId: req.accountId },
      req.body,
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }
    res.json({ data: client });
  } catch (err) {
    next(err);
  }
}

export async function deleteClient(req, res, next) {
  try {
    const client = await Client.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!client) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    if (!req.query.force) {
      const invoiceCount = await Invoice.countDocuments({ clientId: client._id });
      if (invoiceCount > 0) {
        return res.status(409).json({
          error: { code: 'CONFLICT', message: `Client has ${invoiceCount} invoice(s). Use ?force to delete anyway.` },
        });
      }
    }

    await Client.findByIdAndDelete(client._id);
    res.json({ data: { message: 'Client deleted' } });
  } catch (err) {
    next(err);
  }
}

export async function listNotes(req, res, next) {
  try {
    const client = await Client.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!client) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    const notes = await ClientNote.find({ clientId: client._id, accountId: req.accountId })
      .sort({ createdAt: -1 });
    res.json({ data: notes });
  } catch (err) {
    next(err);
  }
}

export async function createNote(req, res, next) {
  try {
    const client = await Client.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!client) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    const note = await ClientNote.create({
      accountId: req.accountId,
      clientId: client._id,
      body: req.body.body,
    });
    res.status(201).json({ data: note });
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(req, res, next) {
  try {
    const client = await Client.findOne({ _id: req.params.id, accountId: req.accountId });
    if (!client) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    const note = await ClientNote.findOneAndDelete({
      _id: req.params.noteId,
      clientId: client._id,
      accountId: req.accountId,
    });
    if (!note) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } });
    }

    res.json({ data: { message: 'Note deleted' } });
  } catch (err) {
    next(err);
  }
}
