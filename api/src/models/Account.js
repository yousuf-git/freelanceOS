import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    baseCurrency: { type: String, default: 'PKR' },
    taxRegime: {
      type: String,
      enum: ['PK_FBR', 'IN_IT', 'BD_NBR', 'CUSTOM'],
      default: 'PK_FBR',
    },
    fiscalYearStartMonth: { type: Number, min: 1, max: 12, default: 7 },
    dangerZoneThresholdMinor: { type: Number, default: 0 },
    dangerZoneCurrency: { type: String },
    invoiceSeq: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

accountSchema.index({ ownerUserId: 1 }, { unique: true });

export const Account = mongoose.model('Account', accountSchema);
