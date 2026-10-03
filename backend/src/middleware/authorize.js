import AppError from '../utils/AppError.js';

// Use AFTER authenticate: router.get('/x', authenticate, authorize('admin'), handler)
export default function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden('You do not have permission to do this'));
    }
    next();
  };
}
