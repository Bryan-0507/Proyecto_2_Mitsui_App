import { pageMetadata } from "@/features/shared/navigation";
import { PredictionScreen } from "@/features/prediction/components/PredictionScreen";

export const metadata = pageMetadata("prediction");

export default function Page() {
  return <PredictionScreen />;
}
