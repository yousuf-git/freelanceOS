import { Router } from 'express';
import { getTimeline } from '../controllers/cashflowController.js';
import { authenticate, accountScope } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, accountScope);

router.get('/timeline', getTimeline);

export default router;
