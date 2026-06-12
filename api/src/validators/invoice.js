import { z } from 'zod';

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPriceMinor: z.number().int().nonnegative(),
  amountMinor: z.number().int().nonnegative().optional(),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1),
  platformId: z.string().min(1),
  currency: z.string().length(3),
  issueDate: z.string().or(z.date()),
  dueDate: z.string().or(z.date()),
  lineItems: z.array(lineItemSchema).min(1),
  notes: z.string().optional().nullable(),
  taxOnInvoiceMinor: z.number().int().nonnegative().optional().default(0),
});

export const updateInvoiceSchema = z.object({
  clientId: z.string().min(1).optional(),
  platformId: z.string().min(1).optional(),
  currency: z.string().length(3).optional(),
  issueDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  lineItems: z.array(lineItemSchema).min(1).optional(),
  notes: z.string().optional().nullable(),
  taxOnInvoiceMinor: z.number().int().nonnegative().optional(),
});

export const invoiceQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.enum(['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void']).optional(),
  clientId: z.string().optional(),
  platformId: z.string().optional(),
  overdue: z.enum(['true', 'false']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sort: z.string().optional().default('-issueDate'),
});

export const reminderSchema = z.object({
  sequenceStep: z.number().int().positive(),
  suggestedAction: z.string().min(1),
  channel: z.enum(['email', 'whatsapp', 'manual']).optional().default('email'),
});
