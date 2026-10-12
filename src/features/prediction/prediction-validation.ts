import type {
  ModelFamily,
  PredictionRequest,
  TargetId,
} from "./types/prediction";

const modelFamilies: Record<ModelFamily, true> = {
  linear: true,
  temporal: true,
  lightgbm: true,
  external_lstm: true,
};

const targetIds: Record<TargetId, true> = {
  target_225: true,
  target_19: true,
  target_105: true,
  target_410: true,
};

export type PredictionValidationError =
  | "invalid_body"
  | "invalid_family"
  | "invalid_target"
  | "invalid_date_id";

export type PredictionValidationResult =
  | { success: true; data: PredictionRequest }
  | { success: false; error: PredictionValidationError };

function isAllowedKey<Key extends string>(
  allowed: Record<Key, true>,
  value: unknown,
): value is Key {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(allowed, value)
  );
}

export function validatePredictionRequest(
  input: unknown,
): PredictionValidationResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { success: false, error: "invalid_body" };
  }

  const { family, target, dateId } = input as Record<string, unknown>;

  if (!isAllowedKey(modelFamilies, family)) {
    return { success: false, error: "invalid_family" };
  }

  if (!isAllowedKey(targetIds, target)) {
    return { success: false, error: "invalid_target" };
  }

  if (
    typeof dateId !== "number" ||
    !Number.isSafeInteger(dateId) ||
    dateId < 0
  ) {
    return { success: false, error: "invalid_date_id" };
  }

  return { success: true, data: { family, target, dateId } };
}
