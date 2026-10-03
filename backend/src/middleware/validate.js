import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';
import { deleteFileAtPath } from '../utils/files.js';

export default function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  // Multer saves the file BEFORE validation runs. If the form is invalid,
  // remove it so rejected requests don't leave orphan files on disk.
  deleteFileAtPath(req.file?.path);

  // Keep the first message per field: { email: 'Invalid email', password: '...' }
  const errors = {};
  for (const err of result.array()) {
    if (!errors[err.path]) errors[err.path] = err.msg;
  }
  next(new AppError('Validation failed', 422, { errors }));
}
