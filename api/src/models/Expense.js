import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['software', 'hardware', 'internet', 'coworking', 'marketing', 'fees', 'travel', 'other'],
      required: true,
    },
    amountMinor: { type: Number, required: true },
    currency: { type: String, required: true },
    forexRate: { type: Number, required: true },
    forexRateSource: {
      type: String,
      enum: ['frankfurter', 'exchangerate-api', 'manual'],
      required: true,
    },
    amountBaseMinor: { type: Number },
    incurredAt: { type: Date, required: true },
    isBusiness: { type: Boolean, default: true },
    isDeductible: { type: Boolean, default: true },
    note: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

expenseSchema.index({ accountId: 1, incurredAt: -1 });
expenseSchema.index({ accountId: 1, category: 1 });
expenseSchema.index({ accountId: 1, isDeductible: 1 });

export const Expense = mongoose.model('Expense', expenseSchema);
