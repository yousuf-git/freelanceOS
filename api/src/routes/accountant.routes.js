import { Router } from 'express';
import { listAccountants, inviteAccountant, revokeAccountant, acceptInvite } from '../controllers/accountantController.js';
import { authenticate, requireFreelancer, accountScope } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { inviteAccountantSchema, acceptInviteSchema } from '../validators/accountant.js';

const router = Router();

// Public: accept invite
router.post('/accept', validate(acceptInviteSchema), acceptInvite);

// Protected
router.use(authenticate, accountScope);
router.get('/', requireFreelancer, listAccountants);
router.post('/invite', requireFreelancer, validate(inviteAccountantSchema), inviteAccountant);
router.delete('/:id', requireFreelancer, revokeAccountant);

export default router;
