"use client";
import { Field,FieldLabel } from "@/components/ui/field";
import { Select,SelectTrigger,SelectValue,SelectContent,SelectGroup,SelectItem } from "@/components/ui/select";
import copy from "@/i18n/es.json";
import type { ModelInputCatalog,ModelInputEntry } from "../types/model-inputs";
import { useModelInputs } from "../hooks/useModelInputs";

const t=copy.preparation.modelInputs;
function featureLabel(name:string) {
  if (name.startsWith("hist_target_desfase_")) return t.historyFeature.replace("{offset}",name.split("_").at(-1)!);
  const match=name.match(/^(US_Stock|JPX|LME|FX)_(.*)$/);
  if (!match) return name;
  const [,market,rest]=match;
  const suffix=Object.keys(t.measures).find(key=>rest.endsWith(key));
  const instrument=suffix ? rest.slice(0,-suffix.length) : rest;
  return `${t.markets[market as keyof typeof t.markets]} · ${instrument.replaceAll("_"," ")}${suffix ? ` · ${t.measures[suffix as keyof typeof t.measures]}` : ""}`;
}

export function ModelInputs({catalog,family}:{catalog:ModelInputCatalog;family:ModelInputEntry["family"] | "external_lstm"}) {
  const view=useModelInputs(catalog,family), targets=copy.prediction.targets;
  const selected=view.selected;
  return <details className="pr-input-details">
    <summary>{t.title}</summary>
    <div className="pr-input-detail-content">
      {family === "external_lstm" ? <>
        <p>{t.external.replace("{engineered}",String(catalog.external.engineeredCount)).replace("{components}",String(catalog.external.componentCount)).replace("{window}",String(catalog.external.window))}</p>
        <p>{t.externalShared}</p>
      </> : selected && <>
        <Field className="pr-input-target"><FieldLabel htmlFor={`inputs-${family}`}>{copy.metrics.target}</FieldLabel><Select value={view.target} onValueChange={view.changeTarget}><SelectTrigger id={`inputs-${family}`}><SelectValue>{targets[view.target as keyof typeof targets].label}</SelectValue></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectGroup className="flex flex-col gap-1 p-1.5">{Object.entries(targets).map(([id,item])=><SelectItem key={id} value={id} className="min-h-10 py-2 pl-2.5">{item.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
        {family === "temporal" ? <>
          <p>{t.temporal.replace("{model}",copy.metrics.signFinding.temporal[view.target as keyof typeof copy.metrics.signFinding.temporal]).replace("{lag}",String(selected.lag))}</p>
          <dl className="pr-temporal-inputs">{selected.order!.map((value,i)=><div key={i}><dt>{t.temporalTerms[i]}</dt><dd>{value}</dd></div>)}</dl>
          <p>{t.temporalNote}</p>
        </> : <>
          <p aria-live="polite">{t.selected.replace("{n}",String(selected.features.length))}</p>
          <ol className="pr-input-list">{selected.features.map(name=><li key={name}><span>{featureLabel(name)}</span><small translate="no">{name}</small></li>)}</ol>
          {selected.features.some(name=>name.startsWith("hist_target_")) && <p>{t.historyNote.replace("{lag}",String(selected.lag))}</p>}
          <p>{selected.indicators.length ? t.indicators.replace("{n}",String(selected.indicators.length)) : t.noIndicators}</p>
          {selected.indicators.length>0 && <ul className="pr-indicator-list">{selected.indicators.map(name=><li key={name} translate="no">{name}</li>)}</ul>}
        </>}
      </>}
      <p className="pr-input-provenance">{family === "external_lstm" ? t.externalSource : t.source}</p>
    </div>
  </details>;
}
