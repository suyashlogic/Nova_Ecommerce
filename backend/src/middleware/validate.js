import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

export default function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  // Keep the first message per field: { email: 'Invalid email', password: '...' }
  const errors = {};
  for (const err of result.array()) {
    if (!errors[err.path]) errors[err.path] = err.msg;
  }
  next(new AppError('Validation failed', 422, { errors }));
}