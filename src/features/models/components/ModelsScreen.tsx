"use client";

import { Tabs } from "@base-ui/react/tabs";
import copy from "@/i18n/es.json";
import { useModelsTabs } from "../hooks/useModelsTabs";
import { BoostingPanel } from "./BoostingPanel";
import { ExternalModel } from "./ExternalModel";
import { LinearPanel } from "./LinearPanel";
import { TemporalPanel } from "./TemporalPanel";

const t = copy.models;

export function ModelsScreen() {
  const view = useModelsTabs();
  return <section className="eda-screen models-screen" aria-labelledby="models-title">
    <header className="eda-heading"><h1 id="models-title">{t.title}</h1><p>{t.intro}</p></header>
    <Tabs.Root value={view.family} onValueChange={view.changeFamily} className="eda-tabs">
      <Tabs.List className="eda-tab-list" aria-label={t.tabsLabel}>
        {Object.entries(t.tabs).map(([value, label]) => <Tabs.Tab key={value} value={value} className="eda-tab">{label}</Tabs.Tab>)}
      </Tabs.List>
      <Tabs.Panel value="linear" className="eda-panel"><LinearPanel /></Tabs.Panel>
      <Tabs.Panel value="temporal" className="eda-panel"><TemporalPanel /></Tabs.Panel>
      <Tabs.Panel value="boosting" className="eda-panel"><BoostingPanel /></Tabs.Panel>
      <Tabs.Panel value="external" className="eda-panel"><ExternalModel /></Tabs.Panel>
    </Tabs.Root>
  </section>;
}
