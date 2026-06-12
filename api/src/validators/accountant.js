import { z } from 'zod';

export const inviteAccountantSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(8).optional(),
});
