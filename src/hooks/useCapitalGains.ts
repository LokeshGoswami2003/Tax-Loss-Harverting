import { useCallback } from 'react';
import type { CapitalGainsResponse } from '../types';

const MOCK_CAPITAL_GAINS: CapitalGainsResponse = {
  capitalGains: {
    stcg: {
      profits: 142540.42,
      losses: 74610.11,
    },
    ltcg: {
      profits: 218700.28,
      losses: 91320.75,
    },
  },
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useCapitalGains = () => {
  const fetchCapitalGains = useCallback(async (): Promise<CapitalGainsResponse> => {
    await delay(500);
    return MOCK_CAPITAL_GAINS;
  }, []);

  return { fetchCapitalGains };
};
