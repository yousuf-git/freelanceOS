import { Router } from 'express';
import authRoutes from './auth.routes.js';
import accountRoutes from './account.routes.js';
import platformRoutes from './platform.routes.js';
import clientRoutes from './client.routes.js';
import invoiceRoutes from './invoice.routes.js';
import paymentRoutes from './payment.routes.js';
import expenseRoutes from './expense.routes.js';
import taxRoutes from './tax.routes.js';
import forexRoutes from './forex.routes.js';
import cashflowRoutes from './cashflow.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import reportsRoutes from './reports.routes.js';
import overdueRoutes from './overdue.routes.js';
import reminderRoutes from './reminder.routes.js';
import accountantRoutes from './accountant.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/account', accountRoutes);
router.use('/platforms', platformRoutes);
router.use('/clients', clientRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/expenses', expenseRoutes);
router.use('/tax', taxRoutes);
router.use('/forex', forexRoutes);
router.use('/cashflow', cashflowRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportsRoutes);
router.use('/overdue', overdueRoutes);
router.use('/reminders', reminderRoutes);
router.use('/accountants', accountantRoutes);

export default router;
