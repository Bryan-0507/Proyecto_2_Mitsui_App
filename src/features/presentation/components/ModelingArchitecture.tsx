import { Archive, ChartNoAxesCombined, Database, ListChecks, SearchCheck, SlidersHorizontal } from "lucide-react";
import copy from "@/i18n/es.json";
import { ModelFlow } from "@/features/models/components/ModelFlow";

const t = copy.presentation.solution;

export function ModelingArchitecture() {
  return <>
    <section className="solution-flow"><h2>{t.flowTitle}</h2>
      <ModelFlow headingLevel={3} label={t.flowLabel} steps={t.flow} icons={[Database, ListChecks, SlidersHorizontal, SearchCheck, ChartNoAxesCombined, Archive]} />
      <p className="presentation-source">{t.externalRoute}</p>
    </section>
    <div className="solution-architecture-grid">
      <section><h2>{t.baseTitle}</h2><ol className="solution-common">{t.common.map((step, i) => <li key={step.title}>
        <span className="presentation-number" aria-hidden="true">{i + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div>
      </li>)}</ol></section>
      <section className="solution-temporal-design"><h2>{t.timeTitle}</h2>
        <ol className="solution-time-strip" aria-label={t.timeLabel}>{t.timeSteps.map(step => <li key={step.title}><h3>{step.title}</h3><p>{step.detail}</p></li>)}</ol>
        <p className="solution-time-reason">{t.timeReason}</p>
        <p className="solution-evaluation">{t.evaluation}</p>
      </section>
    </div>
    <p className="presentation-source">{t.scope}</p>
  </>;
}
