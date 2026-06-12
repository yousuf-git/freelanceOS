import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    sequenceStep: { type: Number, required: true },
    suggestedAction: { type: String, required: true },
    channel: { type: String, enum: ['email', 'whatsapp', 'manual'], default: 'email' },
    status: { type: String, enum: ['pending', 'sent', 'skipped'], default: 'pending' },
    sentAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

reminderSchema.index({ invoiceId: 1, sequenceStep: 1 });
reminderSchema.index({ accountId: 1, status: 1 });

export const Reminder = mongoose.model('Reminder', reminderSchema);
