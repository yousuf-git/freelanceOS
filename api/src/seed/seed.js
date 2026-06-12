import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { Account } from '../models/Account.js';
import { Platform } from '../models/Platform.js';
import { Client } from '../models/Client.js';
import { TaxConfig } from '../models/TaxConfig.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { Expense } from '../models/Expense.js';
import { env } from '../config/env.js';

const PK_FBR_SLABS = [
  { uptoMinor: 60000000, rate: 0, fixedMinor: 0 },
  { uptoMinor: 120000000, rate: 15, fixedMinor: 0 },
  { uptoMinor: 160000000, rate: 20, fixedMinor: 9000000 },
  { uptoMinor: null, rate: 25, fixedMinor: 17000000 },
];

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clean up existing demo data
  const existingUser = await User.findOne({ email: 'demo@freelanceos.app' });
  if (existingUser) {
    const existingAccount = await Account.findOne({ ownerUserId: existingUser._id });
    if (existingAccount) {
      await Promise.all([
        Invoice.deleteMany({ accountId: existingAccount._id }),
        Payment.deleteMany({ accountId: existingAccount._id }),
        Expense.deleteMany({ accountId: existingAccount._id }),
        Platform.deleteMany({ accountId: existingAccount._id }),
        Client.deleteMany({ accountId: existingAccount._id }),
        TaxConfig.deleteMany({ accountId: existingAccount._id }),
        Account.deleteOne({ _id: existingAccount._id }),
      ]);
    }
    await User.deleteOne({ _id: existingUser._id });
  }

  // Create demo user
  const passwordHash = await bcrypt.hash('Password123!', 12);
  const user = await User.create({
    name: 'Demo Freelancer',
    email: 'demo@freelanceos.app',
    passwordHash,
    role: 'freelancer',
  });

  // Create account
  const account = await Account.create({
    ownerUserId: user._id,
    baseCurrency: 'PKR',
    taxRegime: 'PK_FBR',
    fiscalYearStartMonth: 7,
    dangerZoneThresholdMinor: 5000000,
    dangerZoneCurrency: 'PKR',
    invoiceSeq: 0,
  });

  // Create platforms
  const [upwork, fiverr, direct] = await Platform.insertMany([
    {
      accountId: account._id,
      name: 'Upwork',
      isSystemDefault: true,
      feeModel: 'sliding',
      feeConfig: {
        tiers: [
          { uptoLifetimeMinor: 50000000, percent: 20 },
          { uptoLifetimeMinor: 500000000, percent: 10 },
          { uptoLifetimeMinor: null, percent: 5 },
        ],
      },
    },
    {
      accountId: account._id,
      name: 'Fiverr',
      isSystemDefault: true,
      feeModel: 'flat',
      feeConfig: { percent: 20 },
    },
    {
      accountId: account._id,
      name: 'Direct',
      isSystemDefault: true,
      feeModel: 'none',
      feeConfig: {},
    },
  ]);

  // Create PK FBR tax config
  await TaxConfig.create({
    accountId: account._id,
    regime: 'PK_FBR',
    currency: 'PKR',
    fiscalYearStartMonth: 7,
    slabs: PK_FBR_SLABS,
    isCustom: false,
  });

  // Create clients
  const [acme, techCorp, localClient] = await Client.insertMany([
    {
      accountId: account._id,
      name: 'Acme Corp',
      email: 'billing@acme.com',
      company: 'Acme Corporation',
      billingCurrency: 'USD',
      defaultPlatformId: upwork._id,
      contractTerms: 'Net-30, monthly retainer',
      rateAgreement: { amountMinor: 500000, currency: 'USD', unit: 'month' },
      reliabilityScore: 90,
    },
    {
      accountId: account._id,
      name: 'TechCorp GmbH',
      email: 'accounts@techcorp.de',
      company: 'TechCorp GmbH',
      billingCurrency: 'EUR',
      defaultPlatformId: fiverr._id,
      contractTerms: 'Net-14',
      rateAgreement: { amountMinor: 7500, currency: 'EUR', unit: 'hour' },
      reliabilityScore: 85,
    },
    {
      accountId: account._id,
      name: 'Local Business',
      email: 'owner@local.pk',
      company: 'Local Business PK',
      billingCurrency: 'PKR',
      defaultPlatformId: direct._id,
      contractTerms: 'Net-7',
      rateAgreement: { amountMinor: 5000000, currency: 'PKR', unit: 'project' },
      reliabilityScore: 95,
    },
  ]);

  // Helpers
  async function nextInvoiceNumber() {
    const a = await Account.findByIdAndUpdate(account._id, { $inc: { invoiceSeq: 1 } }, { new: true });
    return `INV-2025-26-${String(a.invoiceSeq).padStart(4, '0')}`;
  }

  // Create invoices and payments
  // Invoice 1: USD, paid via Upwork
  const inv1Number = await nextInvoiceNumber();
  const inv1 = await Invoice.create({
    accountId: account._id,
    number: inv1Number,
    clientId: acme._id,
    platformId: upwork._id,
    currency: 'USD',
    issueDate: new Date('2026-01-15'),
    dueDate: new Date('2026-02-14'),
    status: 'paid',
    lineItems: [{ description: 'React Dashboard Development', quantity: 1, unitPriceMinor: 200000, amountMinor: 200000 }],
    subtotalMinor: 200000,
    taxOnInvoiceMinor: 0,
    totalMinor: 200000,
    amountPaidMinor: 200000,
    amountDueMinor: 0,
  });

  const pay1 = await Payment.create({
    accountId: account._id,
    invoiceId: inv1._id,
    clientId: acme._id,
    platformId: upwork._id,
    paidAt: new Date('2026-02-10'),
    grossAmountMinor: 200000,
    currency: 'USD',
    forexRate: 278,
    forexRateSource: 'manual',
    isManualRate: true,
    platformFeeMinor: 20000,
    platformFeeBaseMinor: 5560000,
    netReceivedMinor: 180000,
    netReceivedBaseMinor: 50040000,
    grossBaseMinor: 55600000,
    note: 'Q1 retainer payment',
  });

  // Invoice 2: EUR, paid via Fiverr
  const inv2Number = await nextInvoiceNumber();
  const inv2 = await Invoice.create({
    accountId: account._id,
    number: inv2Number,
    clientId: techCorp._id,
    platformId: fiverr._id,
    currency: 'EUR',
    issueDate: new Date('2026-02-01'),
    dueDate: new Date('2026-02-15'),
    status: 'paid',
    lineItems: [
      { description: 'UI Design - Landing Page', quantity: 1, unitPriceMinor: 150000, amountMinor: 150000 },
      { description: 'UI Design - Dashboard', quantity: 1, unitPriceMinor: 100000, amountMinor: 100000 },
    ],
    subtotalMinor: 250000,
    taxOnInvoiceMinor: 0,
    totalMinor: 250000,
    amountPaidMinor: 250000,
    amountDueMinor: 0,
  });

  await Payment.create({
    accountId: account._id,
    invoiceId: inv2._id,
    clientId: techCorp._id,
    platformId: fiverr._id,
    paidAt: new Date('2026-02-12'),
    grossAmountMinor: 250000,
    currency: 'EUR',
    forexRate: 305,
    forexRateSource: 'manual',
    isManualRate: true,
    platformFeeMinor: 50000,
    platformFeeBaseMinor: 15250000,
    netReceivedMinor: 200000,
    netReceivedBaseMinor: 61000000,
    grossBaseMinor: 76250000,
    note: 'Fiverr order completion',
  });

  // Invoice 3: PKR, via Direct, partially paid
  const inv3Number = await nextInvoiceNumber();
  const inv3 = await Invoice.create({
    accountId: account._id,
    number: inv3Number,
    clientId: localClient._id,
    platformId: direct._id,
    currency: 'PKR',
    issueDate: new Date('2026-03-01'),
    dueDate: new Date('2026-03-08'),
    status: 'partially_paid',
    lineItems: [{ description: 'WordPress Website', quantity: 1, unitPriceMinor: 8000000, amountMinor: 8000000 }],
    subtotalMinor: 8000000,
    taxOnInvoiceMinor: 0,
    totalMinor: 8000000,
    amountPaidMinor: 4000000,
    amountDueMinor: 4000000,
  });

  await Payment.create({
    accountId: account._id,
    invoiceId: inv3._id,
    clientId: localClient._id,
    platformId: direct._id,
    paidAt: new Date('2026-03-05'),
    grossAmountMinor: 4000000,
    currency: 'PKR',
    forexRate: 1,
    forexRateSource: 'manual',
    isManualRate: true,
    platformFeeMinor: 0,
    platformFeeBaseMinor: 0,
    netReceivedMinor: 4000000,
    netReceivedBaseMinor: 4000000,
    grossBaseMinor: 4000000,
    note: 'Advance payment 50%',
  });

  // Invoice 4: USD overdue
  const inv4Number = await nextInvoiceNumber();
  const inv4 = await Invoice.create({
    accountId: account._id,
    number: inv4Number,
    clientId: acme._id,
    platformId: upwork._id,
    currency: 'USD',
    issueDate: new Date('2026-04-01'),
    dueDate: new Date('2026-05-01'),
    status: 'overdue',
    lineItems: [{ description: 'Backend API Development', quantity: 40, unitPriceMinor: 7500, amountMinor: 300000 }],
    subtotalMinor: 300000,
    taxOnInvoiceMinor: 0,
    totalMinor: 300000,
    amountPaidMinor: 0,
    amountDueMinor: 300000,
    overdueDays: 40,
    agingBucket: 'd30',
  });

  // Invoice 5: USD draft
  const inv5Number = await nextInvoiceNumber();
  await Invoice.create({
    accountId: account._id,
    number: inv5Number,
    clientId: acme._id,
    platformId: upwork._id,
    currency: 'USD',
    issueDate: new Date('2026-06-01'),
    dueDate: new Date('2026-07-01'),
    status: 'draft',
    lineItems: [{ description: 'Mobile App Development - Sprint 1', quantity: 1, unitPriceMinor: 500000, amountMinor: 500000 }],
    subtotalMinor: 500000,
    taxOnInvoiceMinor: 0,
    totalMinor: 500000,
    amountPaidMinor: 0,
    amountDueMinor: 500000,
  });

  // Expenses
  await Expense.insertMany([
    {
      accountId: account._id,
      title: 'Adobe Creative Cloud',
      category: 'software',
      amountMinor: 5999,
      currency: 'USD',
      forexRate: 278,
      forexRateSource: 'manual',
      amountBaseMinor: 1667722,
      incurredAt: new Date('2026-01-10'),
      isBusiness: true,
      isDeductible: true,
      note: 'Annual plan',
    },
    {
      accountId: account._id,
      title: 'GitHub Copilot',
      category: 'software',
      amountMinor: 1000,
      currency: 'USD',
      forexRate: 278,
      forexRateSource: 'manual',
      amountBaseMinor: 278000,
      incurredAt: new Date('2026-01-15'),
      isBusiness: true,
      isDeductible: true,
    },
    {
      accountId: account._id,
      title: 'Laptop Stand + Keyboard',
      category: 'hardware',
      amountMinor: 1200000,
      currency: 'PKR',
      forexRate: 1,
      forexRateSource: 'manual',
      amountBaseMinor: 1200000,
      incurredAt: new Date('2026-02-20'),
      isBusiness: true,
      isDeductible: true,
      note: 'Home office equipment',
    },
    {
      accountId: account._id,
      title: 'Fiber Internet - 3 months',
      category: 'internet',
      amountMinor: 900000,
      currency: 'PKR',
      forexRate: 1,
      forexRateSource: 'manual',
      amountBaseMinor: 900000,
      incurredAt: new Date('2026-01-01'),
      isBusiness: true,
      isDeductible: true,
    },
    {
      accountId: account._id,
      title: 'Figma Professional',
      category: 'software',
      amountMinor: 1500,
      currency: 'USD',
      forexRate: 278,
      forexRateSource: 'manual',
      amountBaseMinor: 417000,
      incurredAt: new Date('2026-03-05'),
      isBusiness: true,
      isDeductible: true,
    },
    {
      accountId: account._id,
      title: 'Client Lunch',
      category: 'marketing',
      amountMinor: 500000,
      currency: 'PKR',
      forexRate: 1,
      forexRateSource: 'manual',
      amountBaseMinor: 500000,
      incurredAt: new Date('2026-03-15'),
      isBusiness: true,
      isDeductible: false,
      note: 'Entertainment - non-deductible',
    },
  ]);

  console.log('Seed complete!');
  console.log('Demo login: demo@freelanceos.app / Password123!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
