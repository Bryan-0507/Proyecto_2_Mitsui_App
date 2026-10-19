"use client";
import { Tabs } from "@base-ui/react/tabs";
import copy from "@/i18n/es.json";
import type { ComparisonOptions } from "@/features/prediction/types/comparison";
import type { MetricData, SignFindingData } from "@/features/metrics/types";
import { PredictionComparison } from "@/features/prediction/components/PredictionComparison";
import { MetricsExplorer } from "@/features/metrics/components/MetricsExplorer";
import { useDemo } from "../hooks/useDemo";
import { PresentationHeading } from "./PresentationHeading";

export function DemoScreen({ options, metrics, signs, hasBackup }: {
  options: ComparisonOptions; metrics: MetricData; signs: SignFindingData[]; hasBackup: boolean;
}) {
  const t = copy.presentation.demo, view = useDemo();
  return <section className="eda-screen presentation-screen presentation-demo">
    <PresentationHeading title={t.title} intro={t.intro} />
    <Tabs.Root value={view.tab} onValueChange={view.changeTab} className="eda-tabs">
      <Tabs.List className="eda-tab-list" aria-label={t.tabsLabel}>
        <Tabs.Tab value="prediction" className="eda-tab">{t.predictionTab}</Tabs.Tab>
        <Tabs.Tab value="metrics" className="eda-tab">{t.metricsTab}</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="prediction" keepMounted className="presentation-demo-panel">
        <PredictionComparison options={options} embedded onTargetChange={view.changeTarget} />
      </Tabs.Panel>
      <Tabs.Panel value="metrics" keepMounted className="presentation-demo-panel">
        <header className="presentation-metric-context"><h2>{copy.prediction.targets[view.target].label}</h2><p>{t.scope}</p></header>
        <MetricsExplorer key={view.target} data={metrics} signs={signs} fixedTarget={view.target} timingsCollapsible />
      </Tabs.Panel>
    </Tabs.Root>
    {hasBackup && <details className="presentation-backup"><summary>{t.backupTitle}</summary><p>{t.backupDescription}</p>
      <video controls preload="none" aria-label={t.backupTitle}><source src="/presentation/demo.mp4" type="video/mp4" />{t.videoFallback}</video>
    </details>}
  </section>;
}
