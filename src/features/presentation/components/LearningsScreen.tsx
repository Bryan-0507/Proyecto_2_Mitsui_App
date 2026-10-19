"use client";

import { Tabs } from "@base-ui/react/tabs";
import copy from "@/i18n/es.json";
import type { R2Data, FeatureSearch, SpearmanStability } from "@/features/metrics/types";
import { R2Finding } from "@/features/metrics/components/R2Finding";
import { PredictorFinding } from "@/features/metrics/components/PredictorFinding";
import { SpearmanFinding } from "@/features/metrics/components/SpearmanFinding";
import { useLearnings } from "../hooks/useLearnings";
import { PresentationHeading } from "./PresentationHeading";

export function LearningsScreen({ data, featureSearch, stability }: {
  data: R2Data; featureSearch: FeatureSearch[]; stability: SpearmanStability[];
}) {
  const t = copy.presentation.learnings, view = useLearnings();
  return <section className="eda-screen presentation-screen presentation-learnings">
    <PresentationHeading title={t.title} intro={t.intro} />
    <div className="presentation-decisions">{t.items.map((item, index) => <article key={item.title}>
      <span className="presentation-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <h2>{item.title}</h2><p className="presentation-resolution">{item.response}</p>
    </article>)}</div>
    <Tabs.Root value={view.finding} onValueChange={view.changeFinding} className="eda-tabs presentation-findings">
      <Tabs.List className="eda-tab-list" aria-label={t.tabsLabel}>
        {Object.entries(t.tabs).map(([value, label]) => <Tabs.Tab key={value} value={value} className="eda-tab">{label}</Tabs.Tab>)}
      </Tabs.List>
      <Tabs.Panel value="r2" keepMounted className="presentation-finding-panel"><R2Finding data={data} compact /></Tabs.Panel>
      <Tabs.Panel value="predictors" keepMounted className="presentation-finding-panel"><PredictorFinding data={featureSearch} /></Tabs.Panel>
      <Tabs.Panel value="spearman" keepMounted className="presentation-finding-panel"><SpearmanFinding data={stability} /></Tabs.Panel>
    </Tabs.Root>
  </section>;
}
