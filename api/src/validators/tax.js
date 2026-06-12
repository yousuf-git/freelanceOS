import { z } from 'zod';

const slabSchema = z.object({
  uptoMinor: z.number().int().nullable().optional().default(null),
  rate: z.number().min(0).max(100),
  fixedMinor: z.number().int().nonnegative().optional().default(0),
});

export const taxConfigSchema = z.object({
  regime: z.enum(['PK_FBR', 'IN_IT', 'BD_NBR', 'CUSTOM']),
  currency: z.string().length(3),
  fiscalYearStartMonth: z.number().int().min(1).max(12).optional(),
  slabs: z.array(slabSchema).min(1),
  isCustom: z.boolean().optional().default(false),
});

export const taxLiabilityQuerySchema = z.object({
  fiscalYear: z.coerce.number().int().positive().optional(),
});
