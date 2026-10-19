import { pageMetadata } from "@/features/shared/navigation";
import { DemoLoader } from "@/features/presentation/components/DemoLoader";

export const metadata = pageMetadata("demo");
export default function Page() { return <DemoLoader />; }
