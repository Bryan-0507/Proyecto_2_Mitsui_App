import type { PredictionRequest, PredictionResponse } from "./prediction";

// Transport: one JSON object per line over stdin/stdout (JSON Lines).
// Diagnostic logs belong on stderr, never on the stdout message channel.
export interface PythonPredictionCommand {
  // Unique communication ID, unrelated to the dataset's dateId.
  id: string;
  type: "predict";
  payload: PredictionRequest;
}

export interface PythonReadyMessage {
  // The worker can accept commands; this does not certify model availability.
  type: "ready";
}

export interface PythonPredictionResult {
  // Echo the command ID so Next.js can resolve the correct pending request.
  id: string;
  type: "result";
  payload: PredictionResponse;
}

export type PythonErrorCode =
  | "invalid_request"
  | "model_unavailable"
  | "unavailable_data"
  | "inference_failed";

export interface PythonPredictionError {
  id: string;
  type: "error";
  code: PythonErrorCode;
}

export type PythonWorkerMessage =
  | PythonReadyMessage
  | PythonPredictionResult
  | PythonPredictionError;
