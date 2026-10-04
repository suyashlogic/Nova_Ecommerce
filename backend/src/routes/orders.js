import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import { PAYMENT_METHODS } from '../config/constants.js';
import * as orderController from '../controllers/orderController.js';

const router = Router();

const idRule = param('id').isInt({ min: 1 }).withMessage('Invalid order id');

const checkoutRules = [
  body('shipping.name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2 to 100 characters'),
  body('shipping.phone').trim().matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Enter a valid phone number'),
  body('shipping.line1').trim().isLength({ min: 3, max: 255 }).withMessage('Enter your street address'),
  body('shipping.line2').optional({ values: 'falsy' }).trim().isLength({ max: 255 }).withMessage('Address line 2 is too long'),
  body('shipping.city').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your city'),
  body('shipping.state').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your state'),
  body('shipping.postalCode').trim().isLength({ min: 3, max: 20 }).withMessage('Enter a valid postal code'),
  body('shipping.country').trim().isLength({ min: 2, max: 100 }).withMessage('Enter your country'),
  body('paymentMethod').isIn(PAYMENT_METHODS).withMessage('Choose a payment method'),
];

// Every order route needs a logged-in user. Orders are always looked up with req.user.id
// from the verified token, so a customer can never read or cancel someone else's order.
router.use(authenticate);

router.post('/', checkoutRules, validate, orderController.create);
router.get('/', orderController.list);
router.get('/:id', idRule, validate, orderController.getOne);
router.patch('/:id/cancel', idRule, validate, orderController.cancel);

export default router;
