import { getComparisonOptions } from "../server/comparison-options";
import { PredictionComparison } from "./PredictionComparison";

export async function PredictionScreen() {
  const options = await getComparisonOptions();
  return <PredictionComparison options={options} />;
}
