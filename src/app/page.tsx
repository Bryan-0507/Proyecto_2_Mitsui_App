import { pageMetadata } from "@/features/shared/navigation";
import { OverviewScreen } from "@/features/overview/components/OverviewScreen";

export const metadata = pageMetadata("overview");

export default function OverviewPage() {
  return <OverviewScreen />;
}
