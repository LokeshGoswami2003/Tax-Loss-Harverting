import type { CapitalGains, GainBucket, GainSummary, Holding } from '../types';

const roundToTwo = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const clampGainBucket = (bucket: GainBucket): GainBucket => ({
  profits: roundToTwo(bucket.profits),
  losses: roundToTwo(Math.abs(bucket.losses)),
});

export const calculateCapitalGains = (
  selectedAssets: Holding[],
  initialGains: CapitalGains,
): CapitalGains => {
  const updated: CapitalGains = {
    stcg: clampGainBucket(initialGains.stcg),
    ltcg: clampGainBucket(initialGains.ltcg),
  };

  for (const asset of selectedAssets) {
    if (asset.stcg.gain > 0) {
      updated.stcg.profits = roundToTwo(updated.stcg.profits + asset.stcg.gain);
    } else {
      updated.stcg.losses = roundToTwo(updated.stcg.losses + Math.abs(asset.stcg.gain));
    }

    if (asset.ltcg.gain > 0) {
      updated.ltcg.profits = roundToTwo(updated.ltcg.profits + asset.ltcg.gain);
    } else {
      updated.ltcg.losses = roundToTwo(updated.ltcg.losses + Math.abs(asset.ltcg.gain));
    }
  }

  return updated;
};

export const getGainSummary = (capitalGains: CapitalGains): GainSummary => {
  const stcgNet = roundToTwo(capitalGains.stcg.profits - capitalGains.stcg.losses);
  const ltcgNet = roundToTwo(capitalGains.ltcg.profits - capitalGains.ltcg.losses);

  return {
    stcg: {
      ...capitalGains.stcg,
      net: stcgNet,
    },
    ltcg: {
      ...capitalGains.ltcg,
      net: ltcgNet,
    },
    realized: roundToTwo(stcgNet + ltcgNet),
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatHoldingsAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 4,
  }).format(amount);
};

export const getGainType = (value: number): 'profit' | 'loss' | 'neutral' => {
  if (value > 0) {
    return 'profit';
  }

  if (value < 0) {
    return 'loss';
  }

  return 'neutral';
};
