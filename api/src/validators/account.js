import { z } from 'zod';

export const updateSettingsSchema = z.object({
  baseCurrency: z.string().length(3).optional(),
  taxRegime: z.enum(['PK_FBR', 'IN_IT', 'BD_NBR', 'CUSTOM']).optional(),
  fiscalYearStartMonth: z.number().int().min(1).max(12).optional(),
  dangerZoneThresholdMinor: z.number().int().nonnegative().optional(),
  dangerZoneCurrency: z.string().length(3).optional(),
});
