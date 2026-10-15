"use client";

import { Tabs } from "@base-ui/react/tabs";
import { ArrowRight, BrainCircuit, Cpu, Database, FileSpreadsheet, GitBranch, History, Info, TrendingUp } from "lucide-react";
import copy from "@/i18n/es.json";
import { ModelInputs } from "./ModelInputs";
import type { ModelInputCatalog } from "../types/model-inputs";

const t = copy.preparation;
const routes = [
  ...t.branches.map((branch, i) => ({ ...branch, icon: [TrendingUp, GitBranch, History][i], base: t.baseNode, baseIcon: Database })),
  { title: t.externalTab, description: t.externalDescription, steps: t.externalSteps, reason: t.externalNote, icon: BrainCircuit, base: t.externalBase, baseIcon: FileSpreadsheet },
];

export function ModelRoutes({catalog}:{catalog:ModelInputCatalog}) {
  return <Tabs.Root defaultValue="0" className="pr-routes">
    <Tabs.List className="eda-tab-list" aria-label={t.routesLabel}>
      {routes.map((route, i) => <Tabs.Tab key={route.title} value={String(i)} className="eda-tab pr-route-tab">
        <route.icon aria-hidden="true" />{route.title}
      </Tabs.Tab>)}
    </Tabs.List>
    {routes.map((route, i) => <Tabs.Panel key={route.title} value={String(i)} className="pr-route">
      <div className="pr-route-head">
        <h3>{route.title}</h3>
        <p>{route.description}</p>
        <p className="pr-input-summary">{t.inputSummaries[i]}</p>
      </div>
      <ol className="pr-pipeline" aria-label={t.pipelineLabel.replace("{model}", route.title)}>
        <li data-kind="base"><route.baseIcon aria-hidden="true" /><span>{route.base}</span><ArrowRight className="pr-arrow" aria-hidden="true" /></li>
        {route.steps.map((step, n) => <li key={step} data-kind="step"><span className="pr-node-number">{n + 1}</span><span>{step}</span><ArrowRight className="pr-arrow" aria-hidden="true" /></li>)}
        <li data-kind="input"><Cpu aria-hidden="true" /><span>{t.inputNode}</span></li>
      </ol>
      <div className="pr-why"><Info aria-hidden="true" /><div><h4>{t.whyLabel}</h4><p>{route.reason}</p></div></div>
      <ModelInputs catalog={catalog} family={(["linear","lightgbm","temporal","external_lstm"] as const)[i]} />
    </Tabs.Panel>)}
  </Tabs.Root>;
}
