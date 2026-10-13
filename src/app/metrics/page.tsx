import { pageMetadata } from "@/features/shared/navigation";
import { ResultsExplorer } from "@/features/metrics/components/ResultsExplorer";
import { getMetricData, getR2Data, getFeatureSearch, getSpearmanStability, getSignFinding } from "@/features/metrics/metrics-data";
export const metadata = pageMetadata("results");
export default async function Page() { return <ResultsExplorer data={await getMetricData()} referenceData={await getR2Data()} featureSearch={await getFeatureSearch()} stability={await getSpearmanStability()} signs={await getSignFinding()} />; }
