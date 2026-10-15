import copy from "@/i18n/es.json";
import "../data-targets.css";
import { DatasetSection } from "./DatasetSection";
import { LagSection } from "./LagSection";
import { MeaningSection } from "./MeaningSection";
import { ObjectivesSection } from "./ObjectivesSection";
import { TargetsSection } from "./TargetsSection";

const t = copy.dataTargets;

export function DataTargetsScreen() {
  return <section className="eda-screen dt-screen" aria-labelledby="dt-title">
    <header className="eda-heading"><h1 id="dt-title">{t.title}</h1><p>{t.intro}</p></header>
    <DatasetSection />
    <TargetsSection />
    <MeaningSection />
    <LagSection />
    <ObjectivesSection />
  </section>;
}
