import { handlePredictionRequest } from "@/features/prediction/server/prediction-handler";

// Child processes require Node.js, not the Edge runtime.
export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  return handlePredictionRequest(request);
}
