"use client";

import { Tabs } from "@base-ui/react/tabs";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import copy from "@/i18n/es.json";
import { useSolution } from "../hooks/useSolution";
import { PresentationHeading } from "./PresentationHeading";
import { ModelingArchitecture } from "./ModelingArchitecture";
import { ModelingDecision } from "./ModelingDecision";

export function SolutionScreen() {
  const t = copy.presentation.solution, view = useSolution();
  const items = Object.entries(t.families).map(([value, model]) => ({ value, label: model.name }));
  return <section className="eda-screen presentation-screen solution-screen">
    <PresentationHeading title={t.title} intro={t.intro} />
    <Tabs.Root value={view.tab} onValueChange={view.changeTab} className="eda-tabs">
      <Tabs.List className="eda-tab-list" aria-label={t.tabsLabel}>
        {Object.entries(t.tabs).map(([value, label]) => <Tabs.Tab value={value} key={value} className="eda-tab">{label}</Tabs.Tab>)}
      </Tabs.List>
      <Tabs.Panel value="architecture" className="solution-panel"><ModelingArchitecture /></Tabs.Panel>
      <Tabs.Panel value="models" className="solution-panel">
        <Field className="solution-model-selector"><FieldLabel htmlFor="solution-model">{t.modelLabel}</FieldLabel>
          <Select items={items} value={view.family} onValueChange={view.changeFamily}>
            <SelectTrigger id="solution-model"><SelectValue /></SelectTrigger>
            <SelectContent alignItemWithTrigger={false} side="bottom" align="start"><SelectGroup>
              {items.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
            </SelectGroup></SelectContent>
          </Select>
        </Field>
        <ModelingDecision family={view.family} />
      </Tabs.Panel>
    </Tabs.Root>
  </section>;
}
