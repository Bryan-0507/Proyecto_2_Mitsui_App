import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ModelInputCatalog } from "../types/model-inputs";

export async function getModelInputs(): Promise<ModelInputCatalog> {
  const catalog: ModelInputCatalog = JSON.parse(await readFile(join(process.cwd(), "artifacts/evaluation/preparation/model-inputs.json"), "utf8"));
  const targets=["target_225","target_19","target_105","target_410"];
  if (catalog.entries.length !== 12) throw new Error("Incomplete input catalog");
  for (const family of ["linear","lightgbm","temporal"]) for (const target of targets) {
    const matches=catalog.entries.filter(row=>row.family===family && row.target===target);
    if (matches.length !== 1) throw new Error("Invalid model input identity");
    const row=matches[0];
    if (!Number.isSafeInteger(row.lag) || row.lag<1 || !Array.isArray(row.features) || !Array.isArray(row.indicators) || row.features.some(name=>typeof name!=="string" || !name) || new Set(row.features).size!==row.features.length || row.indicators.some(name=>!row.features.includes(name))) throw new Error("Invalid model input metadata");
    if (family==="temporal" ? !row.order || row.order.length!==3 || row.order.some(n=>!Number.isSafeInteger(n) || n<0) : row.features.length<1) throw new Error("Missing model inputs");
  }
  const external=catalog.external;
  if (external.componentCount!==100 || external.window!==20 || external.engineeredCount!==2064) throw new Error("Invalid external input shape");
  return catalog;
}
