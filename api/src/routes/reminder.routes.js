import { Router } from 'express';
import { updateReminder } from '../controllers/reminderController.js';
import { authenticate, requireFreelancer, accountScope } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, accountScope);

router.patch('/:id', requireFreelancer, updateReminder);

export default router;
