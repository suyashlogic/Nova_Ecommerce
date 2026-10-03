import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export function signToken(user) {
  return jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: String(user.id), // standard "sub" claim
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  });
}

const baseOptions = {
  httpOnly: true, // JavaScript cannot read this cookie
  secure: env.cookieSecure, // HTTPS only (true in production)
  sameSite: env.cookieSameSite, // 'lax' by default; part of our CSRF defense
  path: '/',
};

export function setAuthCookie(res, token) {
  const { exp } = jwt.decode(token); // seconds since epoch
  res.cookie(env.cookieName, token, { ...baseOptions, expires: new Date(exp * 1000) });
}

// The browser only deletes a cookie if the options match how it was set
export function clearAuthCookie(res) {
  res.clearCookie(env.cookieName, baseOptions);
}
