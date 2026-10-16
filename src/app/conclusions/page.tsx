import { pageMetadata } from "@/features/shared/navigation";
import { ConclusionsScreen } from "@/features/conclusions/components/ConclusionsScreen";

export const metadata = pageMetadata("conclusions");

export default function Page() {
  return <ConclusionsScreen />;
}
