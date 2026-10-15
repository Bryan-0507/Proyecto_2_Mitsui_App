"use client";

import { Tabs } from "@base-ui/react/tabs";
import { Ban, Merge, Rows3, ShieldCheck, SquareSplitHorizontal } from "lucide-react";
import copy from "@/i18n/es.json";

const t = copy.preparation;
const icons = [Rows3, Ban, ShieldCheck, Merge, SquareSplitHorizontal];

export function BaseSteps() {
  return <Tabs.Root defaultValue="0" className="pr-steps">
    <Tabs.List className="pr-step-list" aria-label={t.stepsLabel}>
      {t.steps.map((step, i) => {
        const Icon = icons[i];
        return <Tabs.Tab key={step.title} value={String(i)} className="pr-step-tab">
          <span className="pr-step-icon"><Icon aria-hidden="true" /></span>
          <span className="pr-step-text"><small>{t.stepLabel} {i + 1}</small>{step.title}</span>
        </Tabs.Tab>;
      })}
    </Tabs.List>
    {t.steps.map((step, i) => {
      const Icon = icons[i];
      return <Tabs.Panel key={step.title} value={String(i)} className="pr-step-panel">
        <span className="pr-step-panel-icon"><Icon aria-hidden="true" /></span>
        <div>
          <p className="pr-kicker">{t.stepOf.replace("{n}", String(i + 1)).replace("{total}", String(t.steps.length))}</p>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>
      </Tabs.Panel>;
    })}
  </Tabs.Root>;
}
