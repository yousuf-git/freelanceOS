import mongoose from 'mongoose';

const forexRateSchema = new mongoose.Schema(
  {
    base: { type: String, required: true },
    quote: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    rate: { type: Number, required: true },
    source: { type: String, enum: ['frankfurter', 'exchangerate-api'], required: true },
    fetchedAt: { type: Date, default: Date.now },
  }
);

forexRateSchema.index({ base: 1, quote: 1, date: 1 }, { unique: true });

export const ForexRate = mongoose.model('ForexRate', forexRateSchema);
