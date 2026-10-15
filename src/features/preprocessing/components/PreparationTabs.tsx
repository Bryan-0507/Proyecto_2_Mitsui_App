"use client";

import type { ReactNode } from "react";
import { Tabs } from "@base-ui/react/tabs";
import copy from "@/i18n/es.json";

const t = copy.preparation;

export function PreparationTabs({ general, specific }: { general: ReactNode; specific: ReactNode }) {
  return <Tabs.Root defaultValue="general" className="eda-tabs">
    <Tabs.List className="eda-tab-list" aria-label={t.tabsLabel}>
      <Tabs.Tab value="general" className="eda-tab">{t.tabs.general}</Tabs.Tab>
      <Tabs.Tab value="specific" className="eda-tab">{t.tabs.specific}</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="general" keepMounted className="eda-panel">{general}</Tabs.Panel>
    <Tabs.Panel value="specific" keepMounted className="eda-panel">{specific}</Tabs.Panel>
  </Tabs.Root>;
}
