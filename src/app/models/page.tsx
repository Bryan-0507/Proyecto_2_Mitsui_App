import { pageMetadata } from "@/features/shared/navigation";
import { ModelsScreen } from "@/features/models/components/ModelsScreen";

export const metadata = pageMetadata("models");

export default function Page() {
  return <ModelsScreen />;
}
