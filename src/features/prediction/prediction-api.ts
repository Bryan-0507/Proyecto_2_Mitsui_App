import { apiClient, ApiError } from "@/lib/api/apiClient";
import { validatePredictionResponse } from "./prediction-response-validation";
import type { PredictionRequest, PredictionResponse } from "./types/prediction";

export async function predict(
  request: PredictionRequest,
  expectedLag: number,
  signal?: AbortSignal,
): Promise<PredictionResponse> {
  const payload = await apiClient.post("/api/prediction", request, signal);
  const validation = validatePredictionResponse(payload, request, expectedLag);
  if (!validation.success) throw new ApiError("invalid_response", 502);
  return validation.data;
}
