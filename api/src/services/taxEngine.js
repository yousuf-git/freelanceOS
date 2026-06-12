/**
 * Pure tax computation engine — no I/O, unit-testable.
 */

/**
 * Compute tax from income using progressive slab system.
 * @param {number} taxableIncomeMinor - income in minor units
 * @param {Array<{uptoMinor: number|null, rate: number, fixedMinor: number}>} slabs
 * @returns {{ estimatedTaxMinor: number, effectiveRate: number }}
 */
export function computeTax(taxableIncomeMinor, slabs) {
  if (!slabs || slabs.length === 0 || taxableIncomeMinor <= 0) {
    return { estimatedTaxMinor: 0, effectiveRate: 0 };
  }

  // Sort slabs ascending by uptoMinor (null = infinity at the end)
  const sortedSlabs = slabs.slice().sort((a, b) => {
    if (a.uptoMinor === null) return 1;
    if (b.uptoMinor === null) return -1;
    return a.uptoMinor - b.uptoMinor;
  });

  let totalTax = 0;
  let previousUpto = 0;
  let remainingIncome = taxableIncomeMinor;

  for (const slab of sortedSlabs) {
    if (remainingIncome <= 0) break;

    const slabCeiling = slab.uptoMinor !== null ? slab.uptoMinor : Infinity;
    const slabSize = slabCeiling - previousUpto;
    const incomeInSlab = Math.min(remainingIncome, slabSize);

    if (incomeInSlab > 0) {
      const slabTax = Math.round((incomeInSlab * slab.rate) / 100) + (slab.fixedMinor || 0);
      totalTax += slabTax;
    }

    remainingIncome -= incomeInSlab;
    previousUpto = slabCeiling === Infinity ? previousUpto : slabCeiling;
  }

  const estimatedTaxMinor = Math.round(totalTax);
  const effectiveRate = taxableIncomeMinor > 0 ? (estimatedTaxMinor / taxableIncomeMinor) * 100 : 0;

  return { estimatedTaxMinor, effectiveRate };
}

/**
 * Compute quarterly set-aside amount.
 * @param {number} estimatedTaxMinor - full year estimated tax
 * @param {number} currentMonth - current calendar month (1-12)
 * @param {number} fiscalYearStartMonth - FY start month (1-12)
 * @returns {number} setAsideMinor
 */
export function computeQuarterlySetAside(estimatedTaxMinor, currentMonth, fiscalYearStartMonth) {
  // Determine how far we are into the fiscal year
  let monthsElapsed = currentMonth - fiscalYearStartMonth;
  if (monthsElapsed < 0) monthsElapsed += 12;

  // Remaining months in the FY
  const monthsRemaining = 12 - monthsElapsed;
  const quartersRemaining = Math.ceil(monthsRemaining / 3);

  if (quartersRemaining <= 0) return 0;

  // Proportional quarterly set-aside
  const totalQuarters = 4;
  const quartersElapsed = totalQuarters - quartersRemaining;
  const taxAlreadyDue = Math.round((estimatedTaxMinor * quartersElapsed) / totalQuarters);
  const taxRemaining = estimatedTaxMinor - taxAlreadyDue;

  return Math.round(taxRemaining / quartersRemaining);
}
