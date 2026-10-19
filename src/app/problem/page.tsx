import { pageMetadata } from "@/features/shared/navigation";
import { ProblemScreen } from "@/features/presentation/components/ProblemScreen";

export const metadata = pageMetadata("problem");
export default function Page() { return <ProblemScreen />; }
