import passport from 'passport';
import AppError from '../utils/AppError.js';

// Wraps passport so failures flow into OUR error handler (consistent JSON),
// instead of Passport's default plain-text "Unauthorized".
export default function authenticate(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return next(AppError.unauthorized('Please log in to continue'));
    req.user = user;
    next();
  })(req, res, next);
}
