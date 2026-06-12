import { z } from 'zod';

export const createExpenseSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.enum(['software', 'hardware', 'internet', 'coworking', 'marketing', 'fees', 'travel', 'other']),
  amountMinor: z.number().int().positive(),
  currency: z.string().length(3),
  forexRate: z.number().positive().optional(),
  isManualRate: z.boolean().optional().default(false),
  incurredAt: z.string().or(z.date()),
  isBusiness: z.boolean().optional().default(true),
  isDeductible: z.boolean().optional().default(true),
  note: z.string().optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  category: z.enum(['software', 'hardware', 'internet', 'coworking', 'marketing', 'fees', 'travel', 'other']).optional(),
  isBusiness: z.enum(['true', 'false']).optional(),
  isDeductible: z.enum(['true', 'false']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sort: z.string().optional().default('-incurredAt'),
});

export const categorySummaryQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});
