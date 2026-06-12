import { Router } from 'express';
import { listPayments, createPayment, getPayment, deletePayment } from '../controllers/paymentController.js';
import { authenticate, requireFreelancer, accountScope } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { createPaymentSchema, paymentQuerySchema } from '../validators/payment.js';

const router = Router();

router.use(authenticate, accountScope);

router.get('/', validateQuery(paymentQuerySchema), listPayments);
router.post('/', requireFreelancer, validate(createPaymentSchema), createPayment);
router.get('/:id', getPayment);
router.delete('/:id', requireFreelancer, deletePayment);

export default router;
