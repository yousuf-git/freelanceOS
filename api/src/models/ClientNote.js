import mongoose from 'mongoose';

const clientNoteSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    body: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

clientNoteSchema.index({ clientId: 1, createdAt: -1 });

export const ClientNote = mongoose.model('ClientNote', clientNoteSchema);
