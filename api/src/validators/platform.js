import { z } from 'zod';

const feeConfigSchema = z.object({}).passthrough();

export const createPlatformSchema = z.object({
  name: z.string().min(1).max(100),
  feeModel: z.enum(['flat', 'sliding', 'fixed', 'none']),
  feeConfig: feeConfigSchema,
  isSystemDefault: z.boolean().optional().default(false),
});

export const updatePlatformSchema = createPlatformSchema.partial();
