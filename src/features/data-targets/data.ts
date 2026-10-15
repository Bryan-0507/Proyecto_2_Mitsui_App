// Verified against target_pairs.csv in the EDA repository (target, lag, pair).
export const targetPairs = {
  target_225: { lag: 3, pair: "US_Stock_XOM_adj_close - JPX_Gold_Standard_Futures_Close" },
  target_19: { lag: 1, pair: "JPX_Gold_Standard_Futures_Close - FX_USDJPY" },
  target_105: { lag: 1, pair: "US_Stock_IAU_adj_close - LME_CA_Close" },
  target_410: { lag: 4, pair: "FX_EURUSD - LME_AH_Close" },
} as const;

export type TargetId = keyof typeof targetPairs;
