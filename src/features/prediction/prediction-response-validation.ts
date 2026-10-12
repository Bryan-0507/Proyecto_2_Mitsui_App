import type {
  PredictionRequest,
  PredictionResponse,
  PredictionSign,
} from "./types/prediction";

export type PredictionResponseError =
  | "invalid_body"
  | "request_mismatch"
  | "invalid_lag"
  | "invalid_value"
  | "invalid_sign";

export type PredictionResponseValidationResult =
  | { success: true; data: PredictionResponse }
  | { success: false; error: PredictionResponseError };

// expectedLag must come from the target metadata, not the browser request.
export function validatePredictionResponse(
  input: unknown,
  request: PredictionRequest,
  expectedLag: number,
): PredictionResponseValidationResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { success: false, error: "invalid_body" };
  }

  const { family, target, dateId, lag, value, sign } = input as Record<
    string,
    unknown
  >;

  if (
    family !== request.family ||
    target !== request.target ||
    dateId !== request.dateId
  ) {
    return { success: false, error: "request_mismatch" };
  }

  if (
    !Number.isSafeInteger(expectedLag) ||
    expectedLag < 1 ||
    lag !== expectedLag
  ) {
    return { success: false, error: "invalid_lag" };
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { success: false, error: "invalid_value" };
  }

  const expectedSign: PredictionSign =
    value > 0 ? "positive" : value < 0 ? "negative" : "zero";

  if (sign !== expectedSign) {
    return { success: false, error: "invalid_sign" };
  }

  return {
    success: true,
    data: { ...request, lag: expectedLag, value, sign: expectedSign },
  };
}
