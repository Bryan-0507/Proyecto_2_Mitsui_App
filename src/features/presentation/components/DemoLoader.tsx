import { hasArtifacts } from "@/features/shared/server/artifacts";
import { MissingArtifacts } from "@/features/shared/components/MissingArtifacts";
import copy from "@/i18n/es.json";
import { loadDemo } from "../server/load-demo";
import { DemoScreen } from "./DemoScreen";

const required = [
  "models/external_lstm/config.json", "contracts/external-lstm.json",
  "contracts/benchmark.json", "contracts/target-pairs.csv",
  "evaluation/benchmark/metrics.csv", "evaluation/benchmark/training-totals.csv",
  "evaluation/final-comparison/metrics.csv", "evaluation/final-comparison/predictions.csv",
];

export async function DemoLoader() {
  if (!(await hasArtifacts(required))) return <MissingArtifacts title={copy.presentation.demo.title} />;
  return <DemoScreen {...await loadDemo()} />;
}
