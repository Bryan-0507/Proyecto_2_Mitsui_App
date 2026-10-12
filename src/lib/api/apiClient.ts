export class ApiError extends Error {
  constructor(public readonly code: string, public readonly status: number) {
    super(code);
    this.name = "ApiError";
  }
}

export const apiClient = {
  async post(path: string, body: unknown, signal?: AbortSignal): Promise<unknown> {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
      cache: "no-store",
    });
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new ApiError("invalid_response", response.status);
    }
    if (!response.ok) {
      const payload = data as { error?: { code?: unknown } } | null;
      const code = payload && typeof payload.error?.code === "string"
        ? payload.error.code : "inference_failed";
      throw new ApiError(code, response.status);
    }
    return data;
  },
};
