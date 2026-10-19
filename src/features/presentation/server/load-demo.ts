import "server-only";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { getComparisonOptions } from "@/features/prediction/server/comparison-options";
import { getMetricData, getSignFinding } from "@/features/metrics/metrics-data";

export async function loadDemo() {
  const [options, metrics, signs, hasBackup] = await Promise.all([
    getComparisonOptions(), getMetricData(), getSignFinding(),
    access(join(process.cwd(), "public/presentation/demo.mp4")).then(() => true, () => false),
  ]);
  return { options, metrics, signs, hasBackup };
}
