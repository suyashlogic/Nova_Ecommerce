import { Router } from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

// Phase 8:  router.use('/cart', cartRoutes);
// Phase 9:  router.use('/orders', orderRoutes);
// Phase 10: router.use('/admin', adminRoutes);

export default router;
