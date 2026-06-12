import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    platformId: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform', required: true },
    paidAt: { type: Date, required: true },
    grossAmountMinor: { type: Number, required: true },
    currency: { type: String, required: true },
    forexRate: { type: Number, required: true },
    forexRateSource: {
      type: String,
      enum: ['frankfurter', 'exchangerate-api', 'manual'],
      required: true,
    },
    isManualRate: { type: Boolean, default: false },
    platformFeeMinor: { type: Number, required: true },
    platformFeeBaseMinor: { type: Number },
    netReceivedMinor: { type: Number },
    netReceivedBaseMinor: { type: Number },
    grossBaseMinor: { type: Number },
    note: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

paymentSchema.index({ accountId: 1, paidAt: -1 });
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ accountId: 1, clientId: 1 });
paymentSchema.index({ accountId: 1, platformId: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
