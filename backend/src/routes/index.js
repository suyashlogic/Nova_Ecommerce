import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import healthRoutes from './health.js';

const router = Router();

router.use('/health', healthRoutes);

// Phase 4: router.use('/auth', authRoutes);
// Phase 5: router.use('/products', productRoutes);
//          router.use('/categories', categoryRoutes);
// Phase 8: router.use('/cart', cartRoutes);
// Phase 9: router.use('/orders', orderRoutes);
// Phase 10: router.use('/admin', adminRoutes);

// ---- TEMPORARY: used only to test Phase 3. Delete in Phase 4. ----
router.post('/_dev/echo',
  [body('email').isEmail().withMessage('Enter a valid email')],
  validate,
  (req, res) => res.json({ ok: true, email: req.body.email }));
router.get('/_dev/crash', () => { throw new Error('boom'); });
// -------------------------------------------------------------------

export default router;