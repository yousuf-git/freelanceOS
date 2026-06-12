import { Router } from 'express';
import { getForexRate } from '../controllers/forexController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/rate', authenticate, getForexRate);

export default router;
