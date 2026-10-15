import { pageMetadata } from "@/features/shared/navigation";
import { ResultsExplorer } from "@/features/metrics/components/ResultsExplorer";
import { hasArtifacts } from "@/features/shared/server/artifacts";
import { MissingArtifacts } from "@/features/shared/components/MissingArtifacts";
import copy from "@/i18n/es.json";
import { getMetricData, getR2Data, getFeatureSearch, getSpearmanStability, getSignFinding } from "@/features/metrics/metrics-data";
export const metadata = pageMetadata("results");
const required = ["benchmark/metrics.csv", "benchmark/training-totals.csv", "benchmark/spearman-stability.json", "benchmark/feature-search.json", "final-comparison/metrics.csv", "final-comparison/predictions.csv"].map((file) => `evaluation/${file}`);
export default async function Page() {
  if (!(await hasArtifacts(required))) return <MissingArtifacts title={copy.pages.results.title} />;
  return <ResultsExplorer data={await getMetricData()} referenceData={await getR2Data()} featureSearch={await getFeatureSearch()} stability={await getSpearmanStability()} signs={await getSignFinding()} />;
}
