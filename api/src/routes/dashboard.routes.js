import { Router } from 'express';
import { getSummary, getTrends } from '../controllers/dashboardController.js';
import { authenticate, accountScope } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, accountScope);

router.get('/summary', getSummary);
router.get('/trends', getTrends);

export default router;
