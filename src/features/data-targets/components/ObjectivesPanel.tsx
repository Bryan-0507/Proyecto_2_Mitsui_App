import copy from "@/i18n/es.json";
import { ObjectiveArt } from "./ObjectiveArt";

const t = copy.dataTargets.objectives;

export function ObjectivesPanel() {
  return <div className="dt-stack-lg">
    <section className="dt-general" aria-labelledby="dt-general">
      <div><h2 id="dt-general">{t.generalTitle}</h2><p>{t.general}</p></div>
      <ObjectiveArt kind="overview" />
    </section>
    <section className="dt-block" aria-labelledby="dt-specific">
      <h2 id="dt-specific">{t.specificTitle}</h2>
      <ol className="dt-specific">{t.specific.map((item, i) => <li key={item} className="dt-specific-item">
        <span className="dt-number" aria-hidden="true">{i + 1}</span><p>{item}</p>
        <ObjectiveArt kind={(["research", "data", "models", "app"] as const)[i]} />
      </li>)}</ol>
    </section>
  </div>;
}
