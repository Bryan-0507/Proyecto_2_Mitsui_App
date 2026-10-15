import copy from "@/i18n/es.json";
import "../data-targets.css";
import { DataPanel } from "./DataPanel";
import { DataTargetsTabs } from "./DataTargetsTabs";
import { ObjectivesPanel } from "./ObjectivesPanel";
import { ReadingPanel } from "./ReadingPanel";
import { TargetExplorer } from "./TargetExplorer";

const t = copy.dataTargets;

export function DataTargetsScreen() {
  return <section className="eda-screen dt-screen" aria-labelledby="dt-title">
    <header className="eda-heading"><h1 id="dt-title">{t.title}</h1><p>{t.intro}</p></header>
    <DataTargetsTabs panels={{
      data: <DataPanel />,
      targets: <div className="dt-stack"><p className="dt-lead">{t.targets.intro}</p><TargetExplorer /><p className="dt-muted">{t.targets.notes}</p></div>,
      reading: <ReadingPanel />,
      objectives: <ObjectivesPanel />,
    }} />
  </section>;
}
