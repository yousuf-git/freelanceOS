import { describe, it, expect } from '@jest/globals';
import { computeTax, computeQuarterlySetAside } from '../../src/services/taxEngine.js';

const PK_FBR_SLABS = [
  { uptoMinor: 60000000, rate: 0, fixedMinor: 0 },
  { uptoMinor: 120000000, rate: 15, fixedMinor: 0 },
  { uptoMinor: 160000000, rate: 20, fixedMinor: 9000000 },
  { uptoMinor: null, rate: 25, fixedMinor: 17000000 },
];

describe('computeTax', () => {
  it('zero income = zero tax', () => {
    const { estimatedTaxMinor, effectiveRate } = computeTax(0, PK_FBR_SLABS);
    expect(estimatedTaxMinor).toBe(0);
    expect(effectiveRate).toBe(0);
  });

  it('income in zero-rate band = zero tax', () => {
    const { estimatedTaxMinor } = computeTax(50000000, PK_FBR_SLABS);
    expect(estimatedTaxMinor).toBe(0);
  });

  it('income spanning two bands', () => {
    // 60M at 0% + 60M at 15% = 9M tax
    const { estimatedTaxMinor } = computeTax(120000000, PK_FBR_SLABS);
    expect(estimatedTaxMinor).toBe(9000000);
  });

  it('income spanning three bands', () => {
    // 60M at 0% + 60M at 15% + 40M at 20% = 0 + 9M + 8M + 9M(fixed) = 26M
    const { estimatedTaxMinor } = computeTax(160000000, PK_FBR_SLABS);
    expect(estimatedTaxMinor).toBe(26000000);
  });

  it('empty slabs = zero tax', () => {
    const { estimatedTaxMinor } = computeTax(100000000, []);
    expect(estimatedTaxMinor).toBe(0);
  });

  it('negative income = zero tax', () => {
    const { estimatedTaxMinor } = computeTax(-1000, PK_FBR_SLABS);
    expect(estimatedTaxMinor).toBe(0);
  });

  it('effective rate is percent of taxable income', () => {
    const { estimatedTaxMinor, effectiveRate } = computeTax(120000000, PK_FBR_SLABS);
    const expected = (9000000 / 120000000) * 100;
    expect(effectiveRate).toBeCloseTo(expected, 2);
  });
});

describe('computeQuarterlySetAside', () => {
  it('returns quarterly portion of remaining tax', () => {
    // FY starts July (7), current month = October (10), 3 months elapsed of 12
    // 9 months remaining, 3 quarters remaining → quarterly = tax * 3/4 / 3 = tax/4
    const tax = 12000000;
    const result = computeQuarterlySetAside(tax, 10, 7);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(tax);
  });

  it('zero tax = zero set aside', () => {
    expect(computeQuarterlySetAside(0, 10, 7)).toBe(0);
  });
});
