import { z } from 'zod';

export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  paidAt: z.string().or(z.date()),
  grossAmountMinor: z.number().int().positive(),
  currency: z.string().length(3),
  forexRate: z.number().positive().optional(),
  isManualRate: z.boolean().optional().default(false),
  note: z.string().optional().nullable(),
});

export const paymentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  clientId: z.string().optional(),
  platformId: z.string().optional(),
  invoiceId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sort: z.string().optional().default('-paidAt'),
});
