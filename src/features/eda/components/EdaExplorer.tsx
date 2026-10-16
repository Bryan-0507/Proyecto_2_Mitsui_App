"use client";

import type { ReactNode } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { ChartHelp } from "./ChartHelp";
import { Histogram, BoxPlot, MissingCoverage, RelationshipPlot, ChartData, numeric } from "./EdaCharts";
import { CoverageSummary } from "./CoverageSummary";
import { useEdaExplorer } from "../hooks/useEdaExplorer";
import copy from "@/i18n/es.json";

const text=copy.eda;
const fill=(template:string, values:Record<string,string|number>)=>template.replace(/\{(\w+)\}/g,(_,key)=>String(values[key]??""));

function ChartPanel({ title, description, kind, source, children }: {
  title:string; description:string; kind:keyof typeof text.help; source:string; children:ReactNode;
}) {
  return <Card className="eda-chart-card"><CardHeader><CardTitle><h3>{title}</h3></CardTitle>
    <CardDescription>{description}</CardDescription><CardAction><ChartHelp kind={kind}/></CardAction></CardHeader>
    <CardContent>{children}</CardContent><CardFooter><p>{source}</p></CardFooter></Card>;
}

export function EdaExplorer() {
  const view=useEdaExplorer(), market=view.selected, example=text.examples[view.market];
  const marketItems=Object.entries(text.markets).map(([value,label])=>({value,label}));
  const pairItems=text.relationNames.map((label,i)=>({value:String(i),label}));
  const source=fill(text.source,{start:view.provenance.ids[0],end:view.provenance.ids[1],n:market.n,variable:market.variable});
  return <section className="eda-screen" aria-labelledby="eda-title">
    <header className="eda-heading"><h1 id="eda-title">{text.title}</h1><p>{text.intro}</p></header>
    <Tabs.Root value={view.section} onValueChange={view.changeSection} className="eda-tabs">
      <Tabs.List className="eda-tab-list" aria-label={text.tabsLabel}>
        {Object.entries(text.tabs).map(([value,label])=><Tabs.Tab key={value} value={value} className="eda-tab">{label}</Tabs.Tab>)}
      </Tabs.List>
      {view.section!=="relationships" && <Field className="eda-market-field"><FieldLabel htmlFor="eda-market">{text.marketLabel}</FieldLabel>
        <Select items={marketItems} value={view.market} onValueChange={view.changeMarket}><SelectTrigger id="eda-market"><SelectValue/></SelectTrigger>
          <SelectContent alignItemWithTrigger={false} side="bottom" align="start"><SelectGroup>{marketItems.map((item)=><SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent>
        </Select></Field>}
      <Tabs.Panel value="distributions" className="eda-panel">
        <p className="eda-market-context">{text.marketDescriptions[view.market]}</p>
        <div className="eda-narrative"><div><h2>{example.name}</h2><p>{example.finding}</p></div><p className="eda-scope">{text.scope}</p></div>
        <div className="eda-distribution-grid">
          <ChartPanel title={text.histogram} description={text.histogramDescription} kind="histogram" source={source}>
            <Histogram market={market}/><ChartData name={`${view.market}-histogram`} headers={[text.interval,text.count]}
              rows={market.histogram.map((b)=>[`${numeric(b.start)}–${numeric(b.end)}`,b.count])}/>
          </ChartPanel>
          <ChartPanel title={text.box} description={text.boxDescription} kind="box" source={source}>
            <BoxPlot market={market}/>
            <dl className="eda-summary">{[[text.valid,market.n],[text.median,market.box.median],[text.q1,market.box.q1],[text.q3,market.box.q3],[text.skew,market.skew]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{numeric(Number(value))}</dd></div>)}</dl>
            <p className="eda-selection">{text.selection}</p>
          </ChartPanel>
        </div>
      </Tabs.Panel>
      <Tabs.Panel value="quality" className="eda-panel">
        <div className="eda-narrative"><div><h2>{text.markets[view.market]}</h2><p>{text.qualityFinding}</p></div></div>
        <ChartPanel title={text.coverage} description={text.coverageDescription} kind="coverage" source={`${fill(text.source,{start:view.provenance.ids[0],end:view.provenance.ids[1],n:view.provenance.rows,variable:text.markets[view.market]})} · ${fill(text.coverageSummary,{
          missing:numeric(market.coverage.missing),cells:numeric(market.coverage.cells),columns:market.coverage.columns,percentage:numeric(100*market.coverage.missing/market.coverage.cells)})}`}>
          <CoverageSummary cells={market.coverage.cells} missing={market.coverage.missing}/>
          <MissingCoverage market={market}/>
          <ChartData name={`${view.market}-missing`} headers={[text.start,text.end,text.absent,text.cells,text.missing]}
            rows={market.coverage.blocks.map((b)=>[b.start,b.end,b.missing,b.cells,b.percentage])}/>
        </ChartPanel>
        {view.market === "stocks" && <section className="eda-gold-case" aria-labelledby="eda-gold-title">
          <h3 id="eda-gold-title">{text.coverageVisual.goldTitle}</h3>
          <p>{text.coverageVisual.goldDescription}</p>
          <CoverageSummary cells={view.provenance.rows} missing={view.provenance.goldMissing}/>
          <p className="eda-selection">{text.coverageVisual.goldSource}</p>
        </section>}
      </Tabs.Panel>
      <Tabs.Panel value="relationships" className="eda-panel">
        <div className="eda-narrative"><div><h2>{text.relationsTitle}</h2><p>{text.relationsIntro}</p></div></div>
        <Field className="eda-pair-field"><FieldLabel htmlFor="eda-pair">{text.pairLabel}</FieldLabel>
          <Select items={pairItems} value={view.pairIndex} onValueChange={view.changePair}><SelectTrigger id="eda-pair"><SelectValue/></SelectTrigger>
            <SelectContent alignItemWithTrigger={false} side="bottom" align="start"><SelectGroup>{pairItems.map((item)=><SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent>
          </Select></Field>
        <ChartPanel title={text.relationNames[Number(view.pairIndex)]} description={`${text.rho}: ${numeric(view.relation.rho)} · ${text.pairN}: ${view.relation.n}`} kind="relationships"
          source={fill(text.relationSource,{n:view.relation.n,predictor:view.relation.predictor,target:view.relation.target})}>
          <p className="eda-relation-reading">{text.relationReading}</p>
          <RelationshipPlot relation={view.relation}/><p className="eda-selection">{text.relationFinding}</p>
          <ChartData name={`relationship-${view.pairIndex}`} headers={[view.relation.predictor,view.relation.target]} rows={view.relation.points.map((p)=>[p.x,p.y])}/>
        </ChartPanel>
      </Tabs.Panel>
    </Tabs.Root>
  </section>;
}
