import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { randomUUID } from "node:crypto";
import { validatePredictionRequest } from "../prediction-validation";
import { validatePredictionResponse } from "../prediction-response-validation";
import type { PredictionRequest, PredictionResponse } from "../types/prediction";
import type { PythonPredictionCommand } from "../types/python-protocol";
import { parsePythonMessage } from "./python-message-parser";
import { getTargetMetadata } from "./target-metadata";

export interface PythonWorkerOptions {
  pythonExecutable: string;
  workerPath: string;
  cwd: string;
  startupTimeoutMs?: number;
  predictionTimeoutMs?: number;
  maxPendingRequests?: number;
  maxMessageBytes?: number;
}

export class PythonWorkerError extends Error {
  constructor(public readonly code: string) {
    super(`Python worker error: ${code}`);
    this.name = "PythonWorkerError";
  }
}

interface PendingPrediction {
  request: PredictionRequest;
  lag: number;
  timer: ReturnType<typeof setTimeout>;
  resolve: (result: PredictionResponse) => void;
  reject: (error: Error) => void;
}

function positiveInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`Invalid worker option: ${name}`);
  }
  return value;
}

// Server-side only. Create one instance and reuse it across requests.
// A failed/closed instance is terminal; its owner must explicitly replace it.
export class PythonWorker {
  private child?: ChildProcessWithoutNullStreams;
  private state: "idle" | "starting" | "ready" | "closed" = "idle";
  private startup?: Promise<void>;
  private resolveStartup?: () => void;
  private rejectStartup?: (error: Error) => void;
  private startupTimer?: ReturnType<typeof setTimeout>;
  private outputBuffer = "";
  private readonly pending = new Map<string, PendingPrediction>();
  private readonly startupTimeoutMs: number;
  private readonly predictionTimeoutMs: number;
  private readonly maxPendingRequests: number;
  private readonly maxMessageBytes: number;

  constructor(private readonly options: PythonWorkerOptions) {
    this.startupTimeoutMs = positiveInteger(options.startupTimeoutMs ?? 30_000, "startupTimeoutMs");
    this.predictionTimeoutMs = positiveInteger(options.predictionTimeoutMs ?? 60_000, "predictionTimeoutMs");
    this.maxPendingRequests = positiveInteger(options.maxPendingRequests ?? 16, "maxPendingRequests");
    this.maxMessageBytes = positiveInteger(options.maxMessageBytes ?? 65_536, "maxMessageBytes");
  }

  start(): Promise<void> {
    if (this.state === "closed") {
      return Promise.reject(new PythonWorkerError("worker_closed"));
    }
    if (this.startup) return this.startup;

    this.state = "starting";
    this.startup = new Promise<void>((resolve, reject) => {
      this.resolveStartup = resolve;
      this.rejectStartup = reject;
    });
    this.startupTimer = setTimeout(
      () => this.fail(new PythonWorkerError("startup_timeout")),
      this.startupTimeoutMs,
    );

    try {
      // No shell: paths are configuration, never supplied by the browser.
      this.child = spawn(this.options.pythonExecutable, ["-u", this.options.workerPath], {
        cwd: this.options.cwd,
        stdio: ["pipe", "pipe", "pipe"],
        shell: false,
      });
      this.child.stdout.setEncoding("utf8");
      this.child.stdout.on("data", (chunk: string) => this.readOutput(chunk));
      // Drain diagnostics so a full stderr pipe cannot block Python.
      this.child.stderr.resume();
      this.child.on("error", () => this.fail(new PythonWorkerError("process_error")));
      this.child.stdin.on("error", () => this.fail(new PythonWorkerError("write_failed")));
      this.child.on("close", () => this.fail(new PythonWorkerError("process_exited")));
    } catch {
      this.fail(new PythonWorkerError("startup_failed"));
    }

    return this.startup;
  }

  async predict(input: PredictionRequest): Promise<PredictionResponse> {
    const validation = validatePredictionRequest(input);
    if (!validation.success) throw new PythonWorkerError(validation.error);
    const request = validation.data;
    const metadata = await getTargetMetadata(request.target);
    await this.start();

    if (this.state !== "ready" || !this.child) {
      throw new PythonWorkerError("worker_closed");
    }
    if (this.pending.size >= this.maxPendingRequests) {
      throw new PythonWorkerError("worker_busy");
    }

    const id = randomUUID();
    const command: PythonPredictionCommand = { id, type: "predict", payload: request };
    const child = this.child;

    return new Promise<PredictionResponse>((resolve, reject) => {
      const timer = setTimeout(
        () => this.fail(new PythonWorkerError("prediction_timeout")),
        this.predictionTimeoutMs,
      );
      this.pending.set(id, { request, lag: metadata.lag, timer, resolve, reject });

      try {
        child.stdin.write(`${JSON.stringify(command)}\n`, (error) => {
          if (error) this.fail(new PythonWorkerError("write_failed"));
        });
      } catch {
        this.fail(new PythonWorkerError("write_failed"));
      }
    });
  }

  close(): void {
    this.fail(new PythonWorkerError("worker_closed"));
  }

  private readOutput(chunk: string): void {
    if (this.state === "closed") return;
    this.outputBuffer += chunk;

    let newline = this.outputBuffer.indexOf("\n");
    while (newline !== -1) {
      const line = this.outputBuffer.slice(0, newline);
      this.outputBuffer = this.outputBuffer.slice(newline + 1);
      if (Buffer.byteLength(line, "utf8") > this.maxMessageBytes) {
        this.fail(new PythonWorkerError("message_too_large"));
        return;
      }
      this.handleLine(line);
      if (this.isClosed()) return;
      newline = this.outputBuffer.indexOf("\n");
    }

    if (Buffer.byteLength(this.outputBuffer, "utf8") > this.maxMessageBytes) {
      this.fail(new PythonWorkerError("message_too_large"));
    }
  }

  isClosed(): boolean {
    return this.state === "closed";
  }

  private handleLine(line: string): void {
    const parsed = parsePythonMessage(line);
    if (!parsed.success) {
      this.fail(new PythonWorkerError(parsed.error));
      return;
    }
    const message = parsed.message;

    if (message.type === "ready") {
      if (this.state !== "starting") {
        this.fail(new PythonWorkerError("unexpected_ready"));
        return;
      }
      this.state = "ready";
      clearTimeout(this.startupTimer);
      this.resolveStartup?.();
      this.resolveStartup = undefined;
      this.rejectStartup = undefined;
      return;
    }

    const pending = this.pending.get(message.id);
    if (this.state !== "ready" || !pending) {
      this.fail(new PythonWorkerError("unexpected_response"));
      return;
    }

    clearTimeout(pending.timer);
    this.pending.delete(message.id);

    if (message.type === "error") {
      pending.reject(new PythonWorkerError(message.code));
      return;
    }

    const validation = validatePredictionResponse(message.payload, pending.request, pending.lag);
    if (!validation.success) {
      pending.reject(new PythonWorkerError(validation.error));
      this.fail(new PythonWorkerError("invalid_response"));
      return;
    }
    pending.resolve(validation.data);
  }

  private fail(error: Error): void {
    if (this.state === "closed") return;
    this.state = "closed";
    clearTimeout(this.startupTimer);
    this.rejectStartup?.(error);
    this.resolveStartup = undefined;
    this.rejectStartup = undefined;
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
    this.outputBuffer = "";
    this.child?.stdin.destroy();
    this.child?.kill("SIGKILL");
  }
}
