import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable(),
  company: z.string().optional().nullable(),
  billingCurrency: z.string().length(3),
  defaultPlatformId: z.string().optional().nullable(),
  contractTerms: z.string().optional().nullable(),
  rateAgreement: z.object({
    amountMinor: z.number().int().positive(),
    currency: z.string().length(3),
    unit: z.enum(['hour', 'month', 'project']),
  }).optional().nullable(),
});

export const updateClientSchema = createClientSchema.partial();

export const createNoteSchema = z.object({
  body: z.string().min(1),
});

export const clientQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  sort: z.string().optional().default('-createdAt'),
});
