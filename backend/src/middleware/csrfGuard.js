import AppError from '../utils/AppError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export default function csrfGuard(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  if (req.get('X-Requested-With') !== 'NOVA') {
    return next(new AppError('Missing or invalid request header', 403));
  }
  next();
}