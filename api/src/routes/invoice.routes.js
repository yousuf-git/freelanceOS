import { Router } from 'express';
import { listInvoices, createInvoice, getInvoice, updateInvoice, sendInvoice, voidInvoice, deleteInvoice, generatePdf, listReminders, createReminder } from '../controllers/invoiceController.js';
import { authenticate, requireFreelancer, accountScope } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { createInvoiceSchema, updateInvoiceSchema, invoiceQuerySchema, reminderSchema } from '../validators/invoice.js';

const router = Router();

router.use(authenticate, accountScope);

router.get('/', validateQuery(invoiceQuerySchema), listInvoices);
router.post('/', requireFreelancer, validate(createInvoiceSchema), createInvoice);
router.get('/:id', getInvoice);
router.patch('/:id', requireFreelancer, validate(updateInvoiceSchema), updateInvoice);
router.post('/:id/send', requireFreelancer, sendInvoice);
router.post('/:id/void', requireFreelancer, voidInvoice);
router.delete('/:id', requireFreelancer, deleteInvoice);
router.post('/:id/pdf', requireFreelancer, generatePdf);
router.get('/:id/reminders', listReminders);
router.post('/:id/reminders', requireFreelancer, validate(reminderSchema), createReminder);

export default router;
