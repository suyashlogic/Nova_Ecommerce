import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = Router();

router.get('/', categoryController.list); // public

export default router;
