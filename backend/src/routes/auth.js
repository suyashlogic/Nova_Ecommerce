import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import * as authController from '../controllers/authController.js';

const router = Router();

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2 to 100 characters'),
  body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email')
    .isLength({ max: 255 }).withMessage('Email is too long'),
  body('password')
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/\d/).withMessage('Password must contain a number'),
];

const loginRules = [
  body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Optional text fields: skipped when empty, length-checked when present
const optionalText = (field, max) =>
  body(field).optional({ values: 'falsy' }).trim().isLength({ max })
    .withMessage(`${field} must be at most ${max} characters`);

const profileRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2 to 100 characters'),
  body('phone').optional({ values: 'falsy' }).trim().matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage('Enter a valid phone number'),
  optionalText('addressLine1', 255),
  optionalText('addressLine2', 255),
  optionalText('city', 100),
  optionalText('state', 100),
  optionalText('postalCode', 20),
  optionalText('country', 100),
];

router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, profileRules, validate, authController.updateMe);

export default router;
