import passport from 'passport';
import * as authService from '../services/authService.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/authCookie.js';
import AppError from '../utils/AppError.js';

function sendAuthSuccess(res, user, statusCode) {
  setAuthCookie(res, signToken(user));
  res.status(statusCode).json({ status: 'success', user });
}

export async function register(req, res) {
  // Pick fields explicitly. NEVER spread req.body (mass-assignment risk).
  const { name, email, password } = req.body;
  const user = await authService.registerUser({ name, email, password });
  sendAuthSuccess(res, user, 201);
}

export function login(req, res, next) {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return next(AppError.unauthorized('Invalid email or password'));
    sendAuthSuccess(res, user, 200);
  })(req, res, next);
}

export function logout(req, res) {
  clearAuthCookie(res);
  res.json({ status: 'success', message: 'Logged out' });
}

export function getMe(req, res) {
  res.json({ status: 'success', user: req.user });
}

export async function updateMe(req, res) {
  const { name, phone, addressLine1, addressLine2, city, state, postalCode, country } = req.body;
  const user = await authService.updateProfile(req.user.id, {
    name, phone, addressLine1, addressLine2, city, state, postalCode, country,
  });
  res.json({ status: 'success', user });
}
