import { hasArtifacts } from "@/features/shared/server/artifacts";
import { MissingArtifacts } from "@/features/shared/components/MissingArtifacts";
import { getR2Data, getFeatureSearch, getSpearmanStability } from "@/features/metrics/metrics-data";
import copy from "@/i18n/es.json";
import { LearningsScreen } from "./LearningsScreen";

export async function LearningsLoader() {
  if (!(await hasArtifacts([
    "evaluation/final-comparison/predictions.csv",
    "evaluation/benchmark/feature-search.json",
    "evaluation/benchmark/spearman-stability.json",
  ]))) {
    return <MissingArtifacts title={copy.presentation.learnings.title} />;
  }
  const [data, featureSearch, stability] = await Promise.all([
    getR2Data(), getFeatureSearch(), getSpearmanStability(),
  ]);
  return <LearningsScreen data={data} featureSearch={featureSearch} stability={stability} />;
}
