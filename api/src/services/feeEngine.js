/**
 * Pure fee computation engine — no I/O, unit-testable.
 */

/**
 * Compute platform fee for a payment.
 * @param {number} grossAmountMinor - gross payment amount in minor units (invoice currency)
 * @param {object} platform - platform document with feeModel and feeConfig
 * @param {number} lifetimeBilledMinor - total lifetime billed to this platform (for sliding scale)
 * @returns {{ feeMinor: number, feePercent: number }}
 */
export function computeFee(grossAmountMinor, platform, lifetimeBilledMinor = 0) {
  const { feeModel, feeConfig } = platform;

  switch (feeModel) {
    case 'flat': {
      const percent = feeConfig.percent || 0;
      const feeMinor = Math.round((grossAmountMinor * percent) / 100);
      return { feeMinor, feePercent: percent };
    }

    case 'sliding': {
      // tiers: [{ uptoLifetimeMinor: number|null, percent: number }]
      // sorted ascending by uptoLifetimeMinor (null = top band)
      const tiers = (feeConfig.tiers || []).slice().sort((a, b) => {
        if (a.uptoLifetimeMinor === null) return 1;
        if (b.uptoLifetimeMinor === null) return -1;
        return a.uptoLifetimeMinor - b.uptoLifetimeMinor;
      });

      let applicablePercent = 0;
      for (const tier of tiers) {
        if (tier.uptoLifetimeMinor === null || lifetimeBilledMinor <= tier.uptoLifetimeMinor) {
          applicablePercent = tier.percent;
          break;
        }
      }

      const feeMinor = Math.round((grossAmountMinor * applicablePercent) / 100);
      return { feeMinor, feePercent: applicablePercent };
    }

    case 'fixed': {
      // feeConfig.amountMinor in feeConfig.currency
      // Note: currency conversion would happen at caller level if needed
      const feeMinor = Math.round(feeConfig.amountMinor || 0);
      const feePercent = grossAmountMinor > 0 ? (feeMinor / grossAmountMinor) * 100 : 0;
      return { feeMinor, feePercent };
    }

    case 'none':
    default:
      return { feeMinor: 0, feePercent: 0 };
  }
}
