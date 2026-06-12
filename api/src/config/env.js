import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/freelanceos',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  ACCESS_TTL: process.env.ACCESS_TTL || '15m',
  REFRESH_TTL: process.env.REFRESH_TTL || '7d',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
  S3_BUCKET: process.env.S3_BUCKET || '',
  SES_FROM: process.env.SES_FROM || 'no-reply@freelanceos.com',
  FOREX_PRIMARY: process.env.FOREX_PRIMARY || 'https://api.frankfurter.app',
  FOREX_FALLBACK: process.env.FOREX_FALLBACK || 'https://v6.exchangerate-api.com/v6',
  EXCHANGERATE_API_KEY: process.env.EXCHANGERATE_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
