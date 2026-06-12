import mongoose from 'mongoose';

const platformSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    name: { type: String, required: true },
    isSystemDefault: { type: Boolean, default: false },
    feeModel: { type: String, enum: ['flat', 'sliding', 'fixed', 'none'], required: true },
    feeConfig: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

platformSchema.index({ accountId: 1 });
platformSchema.index({ accountId: 1, name: 1 }, { unique: true });

export const Platform = mongoose.model('Platform', platformSchema);
