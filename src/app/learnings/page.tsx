import { pageMetadata } from "@/features/shared/navigation";
import { LearningsLoader } from "@/features/presentation/components/LearningsLoader";

export const metadata = pageMetadata("learnings");
export default function Page() { return <LearningsLoader />; }
