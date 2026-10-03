import { Router } from 'express';
import { body, param } from 'express-validator';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import * as wishlistController from '../controllers/wishlistController.js';

const router = Router();

// Every wishlist route needs a logged-in user
router.use(authenticate);

router.get('/', wishlistController.list);
router.post(
  '/',
  body('productId').isInt({ min: 1 }).withMessage('Invalid product id'),
  validate,
  wishlistController.add
);
router.delete(
  '/:productId',
  param('productId').isInt({ min: 1 }).withMessage('Invalid product id'),
  validate,
  wishlistController.remove
);

export default router;
