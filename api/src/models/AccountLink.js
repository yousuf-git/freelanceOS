import mongoose from 'mongoose';

const accountLinkSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    accountantUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    email: { type: String, required: true, lowercase: true },
    inviteToken: { type: String, unique: true, sparse: true, default: null },
    status: { type: String, enum: ['pending', 'active', 'revoked'], default: 'pending' },
    invitedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
  }
);

accountLinkSchema.index({ accountId: 1, email: 1 }, { unique: true });
accountLinkSchema.index({ inviteToken: 1 }, { unique: true, sparse: true });
accountLinkSchema.index({ accountantUserId: 1 });

export const AccountLink = mongoose.model('AccountLink', accountLinkSchema);
