import { validatePredictionRequest } from "../prediction-validation";
import { getPredictionWorker } from "./prediction-runtime";
import { PythonWorkerError } from "./python-worker";

function errorResponse(code: string, status: number): Response {
  return Response.json(
    { error: { code } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function handlePredictionRequest(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return errorResponse("unsupported_media_type", 415);
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return errorResponse("invalid_json", 400);
  }

  const validation = validatePredictionRequest(input);
  if (!validation.success) return errorResponse(validation.error, 400);

  try {
    const result = await getPredictionWorker().predict(validation.data);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (!(error instanceof PythonWorkerError)) {
      return errorResponse("internal_error", 500);
    }

    switch (error.code) {
      case "invalid_request":
        return errorResponse("invalid_request", 400);
      case "unavailable_data":
        return errorResponse("unavailable_data", 422);
      case "model_unavailable":
        return errorResponse("model_unavailable", 503);
      case "worker_busy":
        return errorResponse("worker_busy", 503);
      case "startup_timeout":
      case "prediction_timeout":
        return errorResponse("prediction_timeout", 504);
      case "invalid_python_configuration":
      case "startup_failed":
      case "process_error":
      case "process_exited":
      case "worker_closed":
      case "write_failed":
        return errorResponse("inference_unavailable", 503);
      default:
        // Do not expose interpreter paths, tracebacks or internal protocol details.
        return errorResponse("inference_failed", 502);
    }
  }
}
