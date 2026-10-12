export type ModelFamily =
  | "linear"
  | "temporal"
  | "lightgbm"
  | "external_lstm";

export type TargetId =
  | "target_225"
  | "target_19"
  | "target_105"
  | "target_410";

export type PredictionSign = "positive" | "negative" | "zero";

export interface PredictionRequest {
  family: ModelFamily;
  target: TargetId;
  // Observation identifier, not a calendar date.
  dateId: number;
}

export interface PredictionResponse extends PredictionRequest {
  // Target horizon in observation steps, not days or input window length.
  lag: number;
  // Predicted difference of log returns, not a price or an exact percentage.
  value: number;
  // Direction of value; it does not describe either instrument in isolation.
  sign: PredictionSign;
}
