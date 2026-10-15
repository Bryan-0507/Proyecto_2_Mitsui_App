import { pageMetadata } from "@/features/shared/navigation";
import { DataTargetsScreen } from "@/features/data-targets/components/DataTargetsScreen";

export const metadata = pageMetadata("dataTargets");

export default function Page() {
  return <DataTargetsScreen />;
}
