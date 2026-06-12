import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/accountController.js';
import { authenticate, requireFreelancer, accountScope } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateSettingsSchema } from '../validators/account.js';

const router = Router();

router.use(authenticate, accountScope);

router.get('/settings', getSettings);
router.patch('/settings', requireFreelancer, validate(updateSettingsSchema), updateSettings);

export default router;
