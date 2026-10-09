import { Router } from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';
import wishlistRoutes from './wishlist.js';
import cartRoutes from './cart.js';
import orderRoutes from './orders.js';
import adminRoutes from './admin.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes); // admin only (see routes/admin.js)

export default router;
