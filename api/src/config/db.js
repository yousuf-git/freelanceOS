import mongoose from 'mongoose';
import { env } from './env.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let retryCount = 0;

export async function connectDB(uri) {
  const mongoUri = uri || env.MONGODB_URI;
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    retryCount = 0;
    console.log('MongoDB connected');
  } catch (err) {
    retryCount++;
    console.error(`MongoDB connection failed (attempt ${retryCount}):`, err.message);
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(() => connectDB(mongoUri), RETRY_DELAY_MS);
    } else {
      console.error('Max retries reached. Running without database.');
    }
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});
