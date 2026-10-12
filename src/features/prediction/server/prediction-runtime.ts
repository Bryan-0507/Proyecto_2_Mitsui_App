import { join, resolve } from "node:path";
import { PythonWorker, PythonWorkerError } from "./python-worker";

interface PredictionRuntime {
  worker?: PythonWorker;
  cleanupRegistered: boolean;
}

// Keep the instance across development module reloads, within this Node process.
const serverGlobal = globalThis as typeof globalThis & {
  marketLensPredictionRuntime?: PredictionRuntime;
};

function getRuntime(): PredictionRuntime {
  if (!serverGlobal.marketLensPredictionRuntime) {
    serverGlobal.marketLensPredictionRuntime = { cleanupRegistered: false };
  }
  return serverGlobal.marketLensPredictionRuntime;
}

// Server-side configuration only; never accept interpreter paths from requests.
export function getPredictionWorker(): PythonWorker {
  const runtime = getRuntime();
  if (runtime.worker && !runtime.worker.isClosed()) return runtime.worker;

  const cwd = process.cwd();
  const configuredPython = process.env.PYTHON_EXECUTABLE ?? join(".venv", "bin", "python");
  if (configuredPython.trim().length === 0 || configuredPython.includes("\0")) {
    throw new PythonWorkerError("invalid_python_configuration");
  }
  // Resolve relative paths from the application root; absolute paths still work.
  const pythonExecutable = resolve(cwd, configuredPython);

  runtime.worker = new PythonWorker({
    pythonExecutable,
    workerPath: join(cwd, "python", "worker.py"),
    cwd,
  });

  if (!runtime.cleanupRegistered) {
    process.once("exit", closePredictionWorker);
    runtime.cleanupRegistered = true;
  }
  return runtime.worker;
}

// Explicit cleanup; the next request can create a fresh instance.
export function closePredictionWorker(): void {
  const runtime = getRuntime();
  runtime.worker?.close();
  runtime.worker = undefined;
}
