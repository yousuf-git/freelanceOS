import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPriceMinor: { type: Number, required: true },
    amountMinor: { type: Number, required: true },
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    number: { type: String, required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    platformId: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform', required: true },
    currency: { type: String, required: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void'],
      default: 'draft',
    },
    lineItems: { type: [lineItemSchema], required: true },
    subtotalMinor: { type: Number, default: 0 },
    taxOnInvoiceMinor: { type: Number, default: 0 },
    totalMinor: { type: Number, default: 0 },
    amountPaidMinor: { type: Number, default: 0 },
    amountDueMinor: { type: Number, default: 0 },
    notes: { type: String, default: null },
    pdfUrl: { type: String, default: null },
    overdueDays: { type: Number, default: 0 },
    agingBucket: {
      type: String,
      enum: ['current', 'd30', 'd60', 'd90plus'],
      default: 'current',
    },
  },
  { timestamps: true }
);

invoiceSchema.index({ accountId: 1, status: 1 });
invoiceSchema.index({ accountId: 1, clientId: 1 });
invoiceSchema.index({ accountId: 1, dueDate: 1 });
invoiceSchema.index({ accountId: 1, number: 1 }, { unique: true });
invoiceSchema.index({ accountId: 1, agingBucket: 1 });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
