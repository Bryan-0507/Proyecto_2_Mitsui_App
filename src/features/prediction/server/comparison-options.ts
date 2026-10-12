import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getTargetMetadata } from "./target-metadata";
import type { ComparisonOptions } from "../types/comparison";
import type { TargetId } from "../types/prediction";

function integer(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error("Invalid comparison availability metadata.");
  }
  return value;
}

export async function getComparisonOptions(): Promise<ComparisonOptions> {
  const root = join(process.cwd(), "artifacts");
  const [configText, externalText, benchmarkText, pairsText] = await Promise.all([
    readFile(join(root, "models/external_lstm/config.json"), "utf8"),
    readFile(join(root, "contracts/external-lstm.json"), "utf8"),
    readFile(join(root, "contracts/benchmark.json"), "utf8"),
    readFile(join(root, "contracts/target-pairs.csv"), "utf8"),
  ]);
  const config = JSON.parse(configText);
  const external = JSON.parse(externalText);
  const benchmark = JSON.parse(benchmarkText);
  // Read all horizons: the external model was selected jointly for 424 targets.
  const horizons = [...pairsText.matchAll(/^target_\d+,(\d+),/gm)].map((match) => Number(match[1]));
  if (!horizons.length) throw new Error("Missing target horizons.");
  const maxLag = Math.max(...horizons.map(integer));
  const validationEnd = Math.max(...benchmark.validaciones.map((block: unknown[]) => integer(block[1])));
  const minDateId = Math.max(
    integer(config.VAL_END) + maxLag + 1,
    validationEnd + maxLag + 2,
  );
  const maxDateId = Math.min(integer(external.pca[0]) - 1, integer(benchmark.prueba[1]));
  if (minDateId > maxDateId) throw new Error("No common comparison period.");
  const ids: TargetId[] = ["target_225", "target_19", "target_105", "target_410"];
  const targets = await Promise.all(ids.map(getTargetMetadata));
  return { targets, minDateId, maxDateId };
}
