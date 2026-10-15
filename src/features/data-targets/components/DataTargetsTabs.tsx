"use client";

import type { ReactNode } from "react";
import { Tabs } from "@base-ui/react/tabs";
import copy from "@/i18n/es.json";

const t = copy.dataTargets;

export function DataTargetsTabs({ panels }: { panels: Record<keyof typeof t.tabs, ReactNode> }) {
  return <Tabs.Root defaultValue="data" className="eda-tabs">
    <Tabs.List className="eda-tab-list" aria-label={t.tabsLabel}>
      {Object.entries(t.tabs).map(([value, label]) => <Tabs.Tab key={value} value={value} className="eda-tab">{label}</Tabs.Tab>)}
    </Tabs.List>
    {Object.entries(panels).map(([value, panel]) => <Tabs.Panel key={value} value={value} className="eda-panel dt-panel">{panel}</Tabs.Panel>)}
  </Tabs.Root>;
}
