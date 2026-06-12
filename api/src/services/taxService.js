import { Payment } from '../models/Payment.js';
import { Expense } from '../models/Expense.js';
import { TaxConfig } from '../models/TaxConfig.js';
import { Account } from '../models/Account.js';
import { computeTax, computeQuarterlySetAside } from './taxEngine.js';

/**
 * Get fiscal year date range.
 * FY 2026 with startMonth=7: July 1 2025 to June 30 2026
 * @param {number} fiscalYear - the ending year of the fiscal year
 * @param {number} fiscalYearStartMonth - 1-12
 * @returns {{ from: Date, to: Date }}
 */
export function getFiscalYearRange(fiscalYear, fiscalYearStartMonth) {
  const startYear = fiscalYearStartMonth === 1 ? fiscalYear : fiscalYear - 1;
  const from = new Date(startYear, fiscalYearStartMonth - 1, 1);
  const to = new Date(
    fiscalYearStartMonth === 1 ? fiscalYear + 1 : fiscalYear,
    fiscalYearStartMonth - 1,
    0,
    23, 59, 59, 999
  );
  return { from, to };
}

/**
 * Compute full tax liability for an account for a fiscal year.
 * @param {string} accountId
 * @param {number} fiscalYear
 * @returns {Promise<object>} liability object
 */
export async function computeLiability(accountId, fiscalYear) {
  const account = await Account.findById(accountId);
  if (!account) throw new Error('Account not found');

  const taxConfig = await TaxConfig.findOne({ accountId });
  if (!taxConfig) {
    return {
      fiscalYear,
      regime: 'NONE',
      grossIncomeBaseMinor: 0,
      netIncomeBaseMinor: 0,
      platformFeesBaseMinor: 0,
      deductibleExpensesBaseMinor: 0,
      taxableIncomeBaseMinor: 0,
      estimatedTaxMinor: 0,
      effectiveRate: 0,
      quarterlySetAsideMinor: 0,
      currency: account.baseCurrency,
    };
  }

  const fyStart = account.fiscalYearStartMonth || 7;
  const { from, to } = getFiscalYearRange(fiscalYear, fyStart);

  // Aggregate payments
  const paymentAgg = await Payment.aggregate([
    {
      $match: {
        accountId: account._id,
        paidAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: null,
        netIncomeBaseMinor: { $sum: '$netReceivedBaseMinor' },
        platformFeesBaseMinor: { $sum: '$platformFeeBaseMinor' },
      },
    },
  ]);

  const netIncomeBaseMinor = paymentAgg[0]?.netIncomeBaseMinor || 0;
  const platformFeesBaseMinor = paymentAgg[0]?.platformFeesBaseMinor || 0;
  const grossIncomeBaseMinor = netIncomeBaseMinor + platformFeesBaseMinor;

  // Aggregate deductible expenses
  const expenseAgg = await Expense.aggregate([
    {
      $match: {
        accountId: account._id,
        isDeductible: true,
        incurredAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: null,
        deductibleExpensesBaseMinor: { $sum: '$amountBaseMinor' },
      },
    },
  ]);

  const deductibleExpensesBaseMinor = expenseAgg[0]?.deductibleExpensesBaseMinor || 0;
  const taxableIncomeBaseMinor = Math.max(0, netIncomeBaseMinor - deductibleExpensesBaseMinor);

  const { estimatedTaxMinor, effectiveRate } = computeTax(taxableIncomeBaseMinor, taxConfig.slabs);

  const now = new Date();
  const quarterlySetAsideMinor = computeQuarterlySetAside(
    estimatedTaxMinor,
    now.getMonth() + 1,
    fyStart
  );

  return {
    fiscalYear,
    regime: taxConfig.regime,
    grossIncomeBaseMinor,
    netIncomeBaseMinor,
    platformFeesBaseMinor,
    deductibleExpensesBaseMinor,
    taxableIncomeBaseMinor,
    estimatedTaxMinor,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    quarterlySetAsideMinor,
    currency: taxConfig.currency || account.baseCurrency,
    slabs: taxConfig.slabs,
  };
}
