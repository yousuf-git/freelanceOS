import { describe, it, expect } from '@jest/globals';
import { computeFee } from '../../src/services/feeEngine.js';

describe('computeFee', () => {
  it('flat fee', () => {
    const platform = { feeModel: 'flat', feeConfig: { percent: 20 } };
    const result = computeFee(100000, platform, 0);
    expect(result.feeMinor).toBe(20000);
    expect(result.feePercent).toBe(20);
  });

  it('none fee', () => {
    const platform = { feeModel: 'none', feeConfig: {} };
    const result = computeFee(100000, platform, 0);
    expect(result.feeMinor).toBe(0);
    expect(result.feePercent).toBe(0);
  });

  it('sliding fee first tier', () => {
    const platform = {
      feeModel: 'sliding',
      feeConfig: {
        tiers: [
          { uptoLifetimeMinor: 50000000, percent: 20 },
          { uptoLifetimeMinor: 500000000, percent: 10 },
          { uptoLifetimeMinor: null, percent: 5 },
        ],
      },
    };
    const result = computeFee(100000, platform, 0);
    expect(result.feeMinor).toBe(20000);
    expect(result.feePercent).toBe(20);
  });

  it('sliding fee second tier', () => {
    const platform = {
      feeModel: 'sliding',
      feeConfig: {
        tiers: [
          { uptoLifetimeMinor: 50000000, percent: 20 },
          { uptoLifetimeMinor: 500000000, percent: 10 },
          { uptoLifetimeMinor: null, percent: 5 },
        ],
      },
    };
    const result = computeFee(100000, platform, 100000000);
    expect(result.feeMinor).toBe(10000);
    expect(result.feePercent).toBe(10);
  });

  it('sliding fee top tier', () => {
    const platform = {
      feeModel: 'sliding',
      feeConfig: {
        tiers: [
          { uptoLifetimeMinor: 50000000, percent: 20 },
          { uptoLifetimeMinor: 500000000, percent: 10 },
          { uptoLifetimeMinor: null, percent: 5 },
        ],
      },
    };
    const result = computeFee(100000, platform, 600000000);
    expect(result.feeMinor).toBe(5000);
    expect(result.feePercent).toBe(5);
  });

  it('fixed fee', () => {
    const platform = { feeModel: 'fixed', feeConfig: { amountMinor: 5000, currency: 'USD' } };
    const result = computeFee(100000, platform, 0);
    expect(result.feeMinor).toBe(5000);
  });

  it('zero gross returns zero fee', () => {
    const platform = { feeModel: 'flat', feeConfig: { percent: 20 } };
    const result = computeFee(0, platform, 0);
    expect(result.feeMinor).toBe(0);
  });
});
