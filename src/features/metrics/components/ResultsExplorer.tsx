"use client";
import { Tabs } from "@base-ui/react/tabs";
import copy from "@/i18n/es.json";
import type { MetricData, R2Data, FeatureSearch, SpearmanStability, SignFindingData } from "../types";
import { Select,SelectTrigger,SelectValue,SelectContent,SelectGroup,SelectItem } from "@/components/ui/select";
import { Field,FieldLabel } from "@/components/ui/field";
import { useResultsTabs } from "../hooks/useResultsTabs";
import { MetricsExplorer } from "./MetricsExplorer";
import { R2Finding } from "./R2Finding";
import { PredictorFinding } from "./PredictorFinding";
import { SpearmanFinding } from "./SpearmanFinding";

export function ResultsExplorer({ data, referenceData, featureSearch, stability, signs }: { data:MetricData; referenceData:R2Data; featureSearch:FeatureSearch[]; stability:SpearmanStability[]; signs:SignFindingData[] }) {
  const view=useResultsTabs(), t=copy.metrics.presentation;
  return <section className="metrics-page results-page" aria-labelledby="results-title">
    <header className="eda-heading"><h1 id="results-title">{t.title}</h1></header>
    <Tabs.Root value={view.tab} onValueChange={view.changeTab} className="eda-tabs">
      <div className="results-navigation"><Tabs.List className="eda-tab-list" aria-label={t.tabsLabel}>
        <Tabs.Tab value="findings" className="eda-tab">{t.findings}</Tabs.Tab>
        <Tabs.Tab value="metrics" className="eda-tab">{t.metrics}</Tabs.Tab>
      </Tabs.List>
      </div>
      <Tabs.Panel value="findings" keepMounted className="eda-panel">
        <div className="findings-introduction">
          <div className="eda-narrative"><p>{t.mainFinding}</p></div>
          <Field className="finding-selector"><FieldLabel id="finding-label">{t.findingLabel}</FieldLabel><Select value={view.finding} onValueChange={view.changeFinding}><SelectTrigger aria-labelledby="finding-label"><SelectValue>{t.findingOptions[view.finding]}</SelectValue></SelectTrigger><SelectContent align="end" alignItemWithTrigger={false} className="finding-select-menu"><SelectGroup className="flex flex-col gap-1 p-1.5">{Object.entries(t.findingOptions).map(([id,label])=><SelectItem className="min-h-11 py-2 pl-2.5" key={id} value={id}>{label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
        </div>
        <div className="finding-panel" hidden={view.finding !== "r2"}><R2Finding data={referenceData}/></div>
        <div className="finding-panel" hidden={view.finding !== "predictors"}><PredictorFinding data={featureSearch}/></div>
        <div className="finding-panel" hidden={view.finding !== "spearman"}><SpearmanFinding data={stability}/></div>
      </Tabs.Panel>
      <Tabs.Panel value="metrics" keepMounted className="eda-panel">
        <MetricsExplorer data={data} signs={signs}/>
      </Tabs.Panel>
    </Tabs.Root>
  </section>;
}
