import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { TargetId } from "../types/prediction";

export interface TargetMetadata {
  target: TargetId;
  lag: number;
  pair: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseTargetMetadata(
  contract: unknown,
  target: TargetId,
): TargetMetadata {
  if (!isRecord(contract) || !isRecord(contract.targets)) {
    throw new Error("Invalid target metadata contract.");
  }

  if (!Object.prototype.hasOwnProperty.call(contract.targets, target)) {
    throw new Error("Target metadata is missing.");
  }

  const entry = contract.targets[target];

  if (!isRecord(entry)) {
    throw new Error("Invalid target metadata entry.");
  }

  const { lag, par } = entry;

  if (typeof lag !== "number" || !Number.isSafeInteger(lag) || lag < 1) {
    throw new Error("Invalid target horizon.");
  }

  if (typeof par !== "string" || par.trim().length === 0) {
    throw new Error("Invalid instrument pair.");
  }

  return { target, lag, pair: par };
}

// Server-only filesystem access; do not import this module into client components.
export async function getTargetMetadata(target: TargetId): Promise<TargetMetadata> {
  const contractPath = join(
    process.cwd(),
    "artifacts",
    "contracts",
    "benchmark.json",
  );
  const contents = await readFile(contractPath, "utf8");
  const contract: unknown = JSON.parse(contents);

  return parseTargetMetadata(contract, target);
}
