import mongoose from 'mongoose';

const slabSchema = new mongoose.Schema(
  {
    uptoMinor: { type: Number, default: null },
    rate: { type: Number, required: true },
    fixedMinor: { type: Number, default: 0 },
  },
  { _id: false }
);

const taxConfigSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, unique: true },
    regime: { type: String, enum: ['PK_FBR', 'IN_IT', 'BD_NBR', 'CUSTOM'], required: true },
    currency: { type: String, required: true },
    fiscalYearStartMonth: { type: Number, min: 1, max: 12 },
    slabs: { type: [slabSchema], required: true },
    isCustom: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taxConfigSchema.index({ accountId: 1 }, { unique: true });

export const TaxConfig = mongoose.model('TaxConfig', taxConfigSchema);
