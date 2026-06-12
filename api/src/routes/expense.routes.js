import { Router } from 'express';
import { listExpenses, createExpense, getExpense, updateExpense, deleteExpense, getCategorySummary } from '../controllers/expenseController.js';
import { authenticate, requireFreelancer, accountScope } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { createExpenseSchema, updateExpenseSchema, expenseQuerySchema, categorySummaryQuerySchema } from '../validators/expense.js';

const router = Router();

router.use(authenticate, accountScope);

router.get('/categories/summary', validateQuery(categorySummaryQuerySchema), getCategorySummary);
router.get('/', validateQuery(expenseQuerySchema), listExpenses);
router.post('/', requireFreelancer, validate(createExpenseSchema), createExpense);
router.get('/:id', getExpense);
router.patch('/:id', requireFreelancer, validate(updateExpenseSchema), updateExpense);
router.delete('/:id', requireFreelancer, deleteExpense);

export default router;
