import { BookOpen, Brain, ChartNoAxesCombined, GitBranch, History, Layers3, ListChecks, RefreshCw, Scale, Sigma, Target } from "lucide-react";
import copy from "@/i18n/es.json";
import { ModelFlow } from "@/features/models/components/ModelFlow";
import type { ModelFamily } from "@/features/models/hooks/useModelsTabs";

const t = copy.presentation.solution;

function Representation({ family }: { family: ModelFamily }) {
  if (family === "temporal") return <>
    <dl className="solution-temporal-parts" aria-label={t.temporalPartsTitle}>{copy.models.temporal.parts.map(part => <div key={part.name}>
      <dt>{part.name}</dt><dd>{part.title}</dd>
    </div>)}</dl>
    <h3 className="solution-selected-title">{t.selectedTitle}</h3>
    <dl className="solution-temporal-selected">{copy.models.temporal.config.map(([target, model]) => <div key={target}>
      <dt>{copy.prediction.targets[target as keyof typeof copy.prediction.targets].label}</dt><dd>{model.split("(")[0]}</dd>
    </div>)}</dl><p className="presentation-source">{t.temporalScope}</p>
  </>;
  if (family === "linear") return <ModelFlow headingLevel={3} label={copy.models.linear.flowLabel} steps={copy.models.linear.flow} icons={[ListChecks, Scale, Sigma, Target]} />;
  if (family === "boosting") return <ModelFlow headingLevel={3} label={t.families.boosting.name} steps={t.boostingFlow} icons={[Target, GitBranch, RefreshCw, GitBranch]} />;
  return <ModelFlow headingLevel={3} label={copy.models.externalSection.flowLabel} steps={t.externalFlow} icons={[History, Brain, Layers3, ChartNoAxesCombined]} />;
}

export function ModelingDecision({ family }: { family: ModelFamily }) {
  const model = t.families[family];
  return <div className="solution-model-grid">
    <div className="solution-model-narrative">
      <section className="solution-why"><h2>{t.whyTitle}</h2><p>{model.why}</p></section>
      <dl className="solution-model-details">{[[t.inputTitle, model.input], [t.preparationTitle, model.preparation], [t.howTitle, model.how]].map(([label, description]) => <div key={label}>
        <dt>{label}</dt><dd>{description}</dd>
      </div>)}</dl>
    </div>
    <section className="solution-representation"><h2>{t.representationTitle}</h2><Representation family={family} />
      {family !== "temporal" && <p className="presentation-source">{t.schematic}</p>}
      {family === "boosting" && <nav className="solution-sources" aria-label={t.boostingSourcesLabel}>{copy.models.boosting.sources.map(source => <a href={source.href} key={source.href} target="_blank" rel="noopener noreferrer"><BookOpen aria-hidden="true" />{source.label}</a>)}</nav>}
      {family === "external" && <a className="solution-external-source" href={copy.models.externalSection.sourceHref} target="_blank" rel="noopener noreferrer">{t.externalSourceLabel}</a>}
    </section>
  </div>;
}
