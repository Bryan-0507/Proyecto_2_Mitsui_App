import { ObjectivesPanel } from "@/features/data-targets/components/ObjectivesPanel";
import "@/features/data-targets/data-targets.css";
import copy from "@/i18n/es.json";
import { PresentationHeading } from "./PresentationHeading";

export function ProblemScreen() {
  const t = copy.presentation.problem;
  return <section className="eda-screen presentation-screen presentation-objectives">
    <PresentationHeading title={t.title} intro={t.intro} />
    <ObjectivesPanel />
  </section>;
}
