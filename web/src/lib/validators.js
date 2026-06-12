import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  baseCurrency: z.string().length(3, 'Select a base currency'),
});

export const clientSchema = z.object({
  name: z.string().min(1, 'Client name required'),
  email: z.string().email('Valid email').optional().or(z.literal('')),
  company: z.string().optional(),
  billingCurrency: z.string().length(3, 'Select billing currency'),
  defaultPlatformId: z.string().optional(),
  contractTerms: z.string().optional(),
  rateAgreement: z.object({
    amount: z.string().optional(),
    currency: z.string().optional(),
    unit: z.enum(['hour', 'month', 'project']).optional(),
  }).optional(),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Select a client'),
  platformId: z.string().min(1, 'Select a platform'),
  currency: z.string().length(3, 'Select currency'),
  issueDate: z.string().min(1, 'Issue date required'),
  dueDate: z.string().min(1, 'Due date required'),
  lineItems: z.array(z.object({
    description: z.string().min(1, 'Description required'),
    quantity: z.coerce.number().min(0.01, 'Quantity must be positive'),
    unitPrice: z.coerce.number().min(0.01, 'Unit price must be positive'),
  })).min(1, 'At least one line item required'),
  taxOnInvoice: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent']).default('draft'),
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice required'),
  paidAt: z.string().min(1, 'Payment date required'),
  grossAmount: z.coerce.number().min(0.01, 'Amount must be positive'),
  currency: z.string().length(3, 'Currency required'),
  forexRate: z.coerce.number().optional().nullable(),
  platformFeeOverride: z.coerce.number().optional().nullable(),
  note: z.string().optional(),
});

export const expenseSchema = z.object({
  title: z.string().min(1, 'Title required'),
  category: z.enum(['software', 'hardware', 'internet', 'coworking', 'marketing', 'fees', 'travel', 'other']),
  amount: z.coerce.number().min(0.01, 'Amount must be positive'),
  currency: z.string().length(3, 'Currency required'),
  forexRate: z.coerce.number().optional().nullable(),
  incurredAt: z.string().min(1, 'Date required'),
  isBusiness: z.boolean().default(true),
  isDeductible: z.boolean().default(true),
  note: z.string().optional(),
});

export const platformSchema = z.object({
  name: z.string().min(1, 'Platform name required'),
  feeModel: z.enum(['flat', 'sliding', 'fixed', 'none']),
  percent: z.coerce.number().min(0).max(100).optional(),
});

export const settingsSchema = z.object({
  baseCurrency: z.string().length(3),
  taxRegime: z.enum(['PK_FBR', 'IN_IT', 'BD_NBR', 'CUSTOM']),
  dangerZoneThreshold: z.coerce.number().min(0),
  fiscalYearStartMonth: z.coerce.number().min(1).max(12),
});

export const accountantInviteSchema = z.object({
  email: z.string().email('Valid email required'),
});
