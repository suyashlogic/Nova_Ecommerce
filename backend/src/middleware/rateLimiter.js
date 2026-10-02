import rateLimit from 'express-rate-limit';
import AppError from '../utils/AppError.js';

const createLimiter = ({ windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',   // sends RateLimit-* headers
    legacyHeaders: false,
    // Route the rejection through our error handler for a consistent shape
    handler: (req, res, next) => next(new AppError(message, 429)),
  });

export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: 'Too many requests. Please try again later.',
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: 'Too many login attempts. Please try again in 15 minutes.',
});