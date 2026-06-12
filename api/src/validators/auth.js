import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  role: z.enum(['freelancer', 'accountant']).optional().default('freelancer'),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
