import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export function errorHandler(err, req, res, next) {
  // ZodError
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // JWT errors
  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: err.message },
    });
  }

  // Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: Object.values(err.errors).map((e) => ({
          path: e.path,
          message: e.message,
        })),
      },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      error: { code: 'CONFLICT', message: `Duplicate value for ${field}` },
    });
  }

  // Known app errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: { code: err.code || 'INTERNAL', message: err.message, details: err.details },
    });
  }

  // FOREX_UNAVAILABLE
  if (err.code === 'FOREX_UNAVAILABLE') {
    return res.status(424).json({
      error: { code: 'FOREX_UNAVAILABLE', message: err.message },
    });
  }

  // Unknown
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: { code: 'INTERNAL', message: 'Internal server error' },
  });
}

export class AppError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
