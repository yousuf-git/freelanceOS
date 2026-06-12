import { Router } from 'express';
import { getAnnualSummary, generateAnnualSummaryPdf, getClientProfitability, getPlatformComparison } from '../controllers/reportsController.js';
import { authenticate, accountScope } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, accountScope);

router.get('/annual-summary', getAnnualSummary);
router.post('/annual-summary/pdf', generateAnnualSummaryPdf);
router.get('/client-profitability', getClientProfitability);
router.get('/platform-comparison', getPlatformComparison);

export default router;
