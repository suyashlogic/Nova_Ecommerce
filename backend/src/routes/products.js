import { Router } from 'express';
import { body, param, query } from 'express-validator';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import { uploadProductImage, verifyImageSignature } from '../config/multer.js';
import { SORT_KEYS } from '../services/productService.js';
import parseSpecs from '../utils/parseSpecs.js';
import * as productController from '../controllers/productController.js';

const router = Router();

// ---------- validation rules ----------
const idRule = param('id').isInt({ min: 1 }).withMessage('Invalid product id');

const listRules = [
  query('search').optional().isLength({ max: 100 }).withMessage('Search is too long'),
  query('category').optional({ values: 'falsy' }).matches(/^[a-z0-9-]{1,100}$/)
    .withMessage('Invalid category'),
  query('minPrice').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Invalid minimum price'),
  query('maxPrice').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Invalid maximum price'),
  query('sort').optional({ values: 'falsy' }).isIn(SORT_KEYS).withMessage('Invalid sort option'),
  query('page').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Invalid page'),
  query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 50 }).withMessage('Limit must be 1 to 50'),
];

const productRules = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Name must be 2 to 200 characters'),
  body('description').trim().isLength({ min: 10, max: 5000 })
    .withMessage('Description must be 10 to 5000 characters'),
  body('price').isFloat({ gt: 0, max: 10000000 }).withMessage('Price must be greater than 0'),
  body('discountPercent').optional({ values: 'falsy' }).isInt({ min: 0, max: 90 })
    .withMessage('Discount must be 0 to 90'),
  body('stock').isInt({ min: 0, max: 100000 }).withMessage('Stock must be 0 or more'),
  body('categoryId').isInt({ min: 1 }).withMessage('Choose a category'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be true or false'),
  body('specs').optional().custom((value) => {
    parseSpecs(value); // throws a friendly Error if invalid
    return true;
  }),
];

const stockRule = body('stock').isInt({ min: 0, max: 100000 }).withMessage('Stock must be 0 or more');

// ---------- public ----------
router.get('/', listRules, validate, productController.list);
router.get('/:id', idRule, validate, productController.getOne);

// ---------- admin only ----------
// authenticate + authorize run BEFORE the upload middleware, so a non-admin
// can never write a file to disk.
const adminOnly = [authenticate, authorize('admin')];

router.post(
  '/',
  ...adminOnly,
  uploadProductImage,
  verifyImageSignature,
  productRules,
  validate,
  productController.create
);
router.put(
  '/:id',
  ...adminOnly,
  uploadProductImage,
  verifyImageSignature,
  idRule,
  productRules,
  validate,
  productController.update
);
router.patch('/:id/stock', ...adminOnly, idRule, stockRule, validate, productController.updateStock);
router.delete('/:id', ...adminOnly, idRule, validate, productController.remove);

export default router;
