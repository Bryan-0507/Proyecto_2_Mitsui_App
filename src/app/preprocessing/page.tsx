import { pageMetadata } from "@/features/shared/navigation";
import { PreparationScreen } from "@/features/preprocessing/components/PreparationScreen";

export const metadata = pageMetadata("preprocessing");

export default function Page() {
  return <PreparationScreen />;
}
