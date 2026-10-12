import type {
  PythonErrorCode,
  PythonPredictionError,
  PythonPredictionResult,
  PythonReadyMessage,
} from "../types/python-protocol";

// The payload stays untrusted until matched to a request and validated.
export type ParsedPythonMessage =
  | PythonReadyMessage
  | PythonPredictionError
  | (Omit<PythonPredictionResult, "payload"> & { payload: unknown });

export type PythonMessageParseError =
  | "invalid_json"
  | "invalid_message"
  | "invalid_id"
  | "invalid_payload"
  | "invalid_error_code";

export type PythonMessageParseResult =
  | { success: true; message: ParsedPythonMessage }
  | { success: false; error: PythonMessageParseError };

const errorCodes: Record<PythonErrorCode, true> = {
  invalid_request: true,
  model_unavailable: true,
  unavailable_data: true,
  inference_failed: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isErrorCode(value: unknown): value is PythonErrorCode {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(errorCodes, value)
  );
}

// Receives one complete line; stream framing belongs to the worker bridge.
export function parsePythonMessage(line: string): PythonMessageParseResult {
  let input: unknown;

  try {
    input = JSON.parse(line);
  } catch {
    return { success: false, error: "invalid_json" };
  }

  if (!isRecord(input)) {
    return { success: false, error: "invalid_message" };
  }

  const { type, id, payload, code } = input;

  if (type === "ready") {
    return { success: true, message: { type: "ready" } };
  }

  if (type !== "result" && type !== "error") {
    return { success: false, error: "invalid_message" };
  }

  if (typeof id !== "string" || id.trim().length === 0) {
    return { success: false, error: "invalid_id" };
  }

  if (type === "result") {
    if (!isRecord(payload)) {
      return { success: false, error: "invalid_payload" };
    }

    return { success: true, message: { id, type, payload } };
  }

  if (!isErrorCode(code)) {
    return { success: false, error: "invalid_error_code" };
  }

  return { success: true, message: { id, type, code } };
}
