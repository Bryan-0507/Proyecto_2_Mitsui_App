import { pageMetadata } from "@/features/shared/navigation";
import { PredictionScreen } from "@/features/prediction/components/PredictionScreen";
import { hasArtifacts } from "@/features/shared/server/artifacts";
import { MissingArtifacts } from "@/features/shared/components/MissingArtifacts";
import copy from "@/i18n/es.json";

export const metadata = pageMetadata("prediction");

const required = ["models/external_lstm/config.json", "contracts/external-lstm.json", "contracts/benchmark.json", "contracts/target-pairs.csv"];

export default async function Page() {
  if (!(await hasArtifacts(required))) return <MissingArtifacts title={copy.pages.prediction.title} />;
  return <PredictionScreen />;
}
