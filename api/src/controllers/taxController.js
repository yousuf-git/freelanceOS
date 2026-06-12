import { TaxConfig } from '../models/TaxConfig.js';
import { Account } from '../models/Account.js';
import { computeLiability } from '../services/taxService.js';
import { emitToAccount } from '../sockets/index.js';

export const PK_FBR_SLABS = [
  { uptoMinor: 60000000, rate: 0, fixedMinor: 0 },
  { uptoMinor: 120000000, rate: 15, fixedMinor: 0 },
  { uptoMinor: 160000000, rate: 20, fixedMinor: 9000000 },
  { uptoMinor: null, rate: 25, fixedMinor: 17000000 },
];

const IN_IT_SLABS = [
  { uptoMinor: 25000000, rate: 0, fixedMinor: 0 },
  { uptoMinor: 50000000, rate: 5, fixedMinor: 0 },
  { uptoMinor: 100000000, rate: 20, fixedMinor: 1250000 },
  { uptoMinor: 150000000, rate: 30, fixedMinor: 11250000 },
  { uptoMinor: null, rate: 30, fixedMinor: 26250000 },
];

const BD_NBR_SLABS = [
  { uptoMinor: 30000000, rate: 0, fixedMinor: 0 },
  { uptoMinor: 40000000, rate: 5, fixedMinor: 0 },
  { uptoMinor: 70000000, rate: 10, fixedMinor: 500000 },
  { uptoMinor: 150000000, rate: 15, fixedMinor: 3500000 },
  { uptoMinor: null, rate: 20, fixedMinor: 15500000 },
];

const TAX_PRESETS = [
  { regime: 'PK_FBR', label: 'Pakistan FBR (TY 2024-25)', currency: 'PKR', fiscalYearStartMonth: 7, slabs: PK_FBR_SLABS },
  { regime: 'IN_IT', label: 'India Income Tax (AY 2024-25)', currency: 'INR', fiscalYearStartMonth: 4, slabs: IN_IT_SLABS },
  { regime: 'BD_NBR', label: 'Bangladesh NBR (FY 2023-24)', currency: 'BDT', fiscalYearStartMonth: 7, slabs: BD_NBR_SLABS },
];

export async function getTaxConfig(req, res, next) {
  try {
    const config = await TaxConfig.findOne({ accountId: req.accountId });
    if (!config) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Tax config not found' } });
    res.json({ data: config });
  } catch (err) { next(err); }
}

export async function putTaxConfig(req, res, next) {
  try {
    const { regime, currency, fiscalYearStartMonth, slabs, isCustom } = req.body;
    const config = await TaxConfig.findOneAndUpdate(
      { accountId: req.accountId },
      { regime, currency, fiscalYearStartMonth, slabs, isCustom: isCustom || regime === 'CUSTOM' },
      { new: true, upsert: true, runValidators: true }
    );
    if (fiscalYearStartMonth) {
      await Account.findByIdAndUpdate(req.accountId, { fiscalYearStartMonth, taxRegime: regime });
    }
    const now = new Date();
    const fyStart = fiscalYearStartMonth || 7;
    let fyYear = now.getMonth() + 1 >= fyStart ? now.getFullYear() + 1 : now.getFullYear();
    const liability = await computeLiability(req.accountId, fyYear);
    emitToAccount(req.accountId, 'tax:updated', { data: liability });
    res.json({ data: config });
  } catch (err) { next(err); }
}

export async function getTaxPresets(req, res, next) {
  try {
    res.json({ data: TAX_PRESETS });
  } catch (err) { next(err); }
}

export async function getTaxLiability(req, res, next) {
  try {
    const account = req.account || await Account.findById(req.accountId);
    const fyStart = account.fiscalYearStartMonth || 7;
    const now = new Date();
    let fiscalYear = req.query.fiscalYear ? Number(req.query.fiscalYear) : null;
    if (!fiscalYear) {
      fiscalYear = now.getMonth() + 1 >= fyStart ? now.getFullYear() + 1 : now.getFullYear();
    }
    const liability = await computeLiability(req.accountId, fiscalYear);
    res.json({
      data: {
        fiscalYear: liability.fiscalYear,
        baseCurrency: liability.currency,
        grossIncomeBaseMinor: liability.grossIncomeBaseMinor,
        platformFeesBaseMinor: liability.platformFeesBaseMinor,
        netIncomeBaseMinor: liability.netIncomeBaseMinor,
        deductibleExpensesBaseMinor: liability.deductibleExpensesBaseMinor,
        taxableIncomeBaseMinor: liability.taxableIncomeBaseMinor,
        estimatedTaxBaseMinor: liability.estimatedTaxMinor,
        effectiveRate: liability.effectiveRate,
        quarterlySetAsideBaseMinor: liability.quarterlySetAsideMinor,
        asOf: now.toISOString(),
      },
    });
  } catch (err) { next(err); }
}
