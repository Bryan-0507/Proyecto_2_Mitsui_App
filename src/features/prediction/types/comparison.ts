import type { ModelFamily, PredictionResponse, TargetId } from "./prediction";

export const comparisonFamilies: readonly ModelFamily[] = [
  "linear", "temporal", "lightgbm", "external_lstm",
];

export interface ComparisonTarget {
  target: TargetId;
  lag: number;
  pair: string;
}

export interface ComparisonOptions {
  targets: ComparisonTarget[];
  minDateId: number;
  maxDateId: number;
}

export type ComparisonRow =
  | { family: ModelFamily; status: "idle" | "loading" }
  | { family: ModelFamily; status: "success"; result: PredictionResponse }
  | { family: ModelFamily; status: "error"; code: string };
