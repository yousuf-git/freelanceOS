import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    name: { type: String, required: true },
    email: { type: String, default: null },
    company: { type: String, default: null },
    billingCurrency: { type: String, required: true },
    defaultPlatformId: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform', default: null },
    contractTerms: { type: String, default: null },
    rateAgreement: {
      type: {
        amountMinor: Number,
        currency: String,
        unit: { type: String, enum: ['hour', 'month', 'project'] },
      },
      default: null,
    },
    reliabilityScore: { type: Number, min: 0, max: 100, default: 100 },
    stats: {
      totalInvoicedBaseMinor: { type: Number, default: 0 },
      totalReceivedBaseMinor: { type: Number, default: 0 },
      overdueCount: { type: Number, default: 0 },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

clientSchema.index({ accountId: 1 });
clientSchema.index({ accountId: 1, name: 1 });
clientSchema.index({ accountId: 1, reliabilityScore: -1 });

export const Client = mongoose.model('Client', clientSchema);
