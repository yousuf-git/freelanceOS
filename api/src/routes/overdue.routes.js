import { Router } from 'express';
import { getOverdue } from '../controllers/overdueController.js';
import { authenticate, accountScope } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, accountScope);

router.get('/', getOverdue);

export default router;
