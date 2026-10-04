import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import * as cartController from '../controllers/cartController.js';

const router = Router();

const itemIdRule = param('itemId').isInt({ min: 1 }).withMessage('Invalid cart item id');
const quantityRule = body('quantity').isInt({ min: 1, max: 1000 }).withMessage('Quantity must be at least 1');

// Rules for a list of { productId, quantity } sent from the guest's browser
const linesRules = [
  body('items').isArray({ max: 50 }).withMessage('items must be a list of at most 50 entries'),
  body('items.*.productId').isInt({ min: 1 }).withMessage('Invalid product id'),
  body('items.*.quantity').isInt({ min: 1, max: 1000 }).withMessage('Quantity must be at least 1'),
];

// PUBLIC: guests need cart totals too. Reads only, saves nothing.
router.post('/preview', linesRules, validate, cartController.previewCart);

// Everything below needs a logged-in user. The cart is always found through req.user.id,
// never an id from the request, so nobody can read or change someone else's cart.
router.use(authenticate);

router.get('/', cartController.getCart);
router.post(
  '/',
  body('productId').isInt({ min: 1 }).withMessage('Invalid product id'),
  body('quantity').optional().isInt({ min: 1, max: 1000 }).withMessage('Quantity must be at least 1'),
  validate,
  cartController.addItem
);
router.post('/merge', linesRules, validate, cartController.mergeCart);
router.put('/:itemId', itemIdRule, quantityRule, validate, cartController.updateItem);
router.delete('/:itemId', itemIdRule, validate, cartController.removeItem);

export default router;
