import { Router } from 'express';
import { body, param, query } from 'express-validator';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { ORDER_STATUSES } from '../config/constants.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

// EVERYTHING in this file requires a valid login AND the admin role.
// (The role is reloaded from the database on each request, so a demoted admin loses access at once.)
router.use(authenticate, authorize('admin'));

const pagingRules = [
  query('page').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid page'),
  query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 50 }).withMessage('Limit must be 1 to 50'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search is too long'),
];

router.get('/stats', adminController.stats);

router.get(
  '/orders',
  pagingRules,
  query('status').optional({ values: 'falsy' }).isIn(ORDER_STATUSES).withMessage('Invalid status'),
  validate,
  adminController.orders
);

router.patch(
  '/orders/:id/status',
  param('id').isInt({ min: 1 }).withMessage('Invalid order id'),
  body('status').isIn(ORDER_STATUSES).withMessage('Invalid status'),
  validate,
  adminController.updateOrderStatus
);

router.get('/users', pagingRules, validate, adminController.users);

export default router;
