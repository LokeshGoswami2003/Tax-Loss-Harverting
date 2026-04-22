export type GainType = 'profit' | 'loss';

export interface GainBucket {
  profits: number;
  losses: number;
}

export interface CapitalGains {
  stcg: GainBucket;
  ltcg: GainBucket;
}

export interface CapitalGainsResponse {
  capitalGains: CapitalGains;
}

export interface AssetGain {
  gain: number;
  balance: number;
}

export interface Holding {
  id: string;
  name: string;
  symbol: string;
  logoColor: string;
  holdingsAmount: number;
  avgBuyPrice: number;
  currentPrice: number;
  stcg: AssetGain;
  ltcg: AssetGain;
}

export interface GainSummary {
  stcg: GainBucket & { net: number };
  ltcg: GainBucket & { net: number };
  realized: number;
}
