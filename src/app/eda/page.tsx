import { pageMetadata } from "@/features/shared/navigation";
import { EdaExplorer } from "@/features/eda/components/EdaExplorer";

export const metadata = pageMetadata("eda");

export default function Page() {
  return <EdaExplorer />;
}
