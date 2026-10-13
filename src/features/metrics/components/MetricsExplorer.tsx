"use client";
import { Card,CardHeader,CardTitle,CardDescription,CardAction,CardContent } from "@/components/ui/card";
import { Select,SelectGroup,SelectTrigger,SelectValue,SelectContent,SelectItem } from "@/components/ui/select";
import copy from "@/i18n/es.json";
import type { MetricData, SignFindingData } from "../types";
import { useMetrics } from "../hooks/useMetrics";
import { MetricBars } from "./MetricBars";
import { MetricTime,MetricTotals } from "./MetricTime";
import { MetricHelp } from "./MetricHelp";
import { SignMetrics } from "./SignMetrics";
export function MetricsExplorer({ data, signs }: { data:MetricData; signs:SignFindingData[] }) {
  const view=useMetrics(data), t=copy.metrics, targets=copy.prediction.targets;
  return <div className="flex flex-col gap-6">
    <div className="metrics-controls"><div><label id="metric-target">{t.target}</label><Select value={view.target} onValueChange={view.changeTarget}><SelectTrigger aria-labelledby="metric-target"><SelectValue>{targets[view.target as keyof typeof targets].label}</SelectValue></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectGroup className="flex flex-col gap-1 p-1.5">{Object.entries(targets).map(([id,target])=><SelectItem className="min-h-10 py-2 pl-2.5" key={id} value={id}>{target.label}</SelectItem>)}</SelectGroup></SelectContent></Select></div></div>
    <div className="metrics-scope"><p>{t.finalScope}</p><p>{view.target} · {view.rows[0].n} {t.sample}</p><p className="metrics-scroll-note">{t.scroll}</p></div>
    <div className="metrics-grid">{(["rmse","mae","r2"] as const).map(metric=><Card key={metric}><CardHeader><CardTitle>{t.labels[metric]}</CardTitle><CardDescription>{metric === "r2" ? t.r2Note : t.errorNote}</CardDescription><CardAction><MetricHelp kind={metric === "r2" ? "r2" : "errors"}/></CardAction></CardHeader><CardContent><MetricBars rows={view.rows} metric={metric}/></CardContent></Card>)}<SignMetrics selected={signs.find(row=>row.target===view.target)!}/></div>
    <div className="metrics-grid metrics-time-grid"><Card><CardHeader><CardTitle>{t.labels.time}</CardTitle><CardDescription>{t.timeNote}</CardDescription><CardAction><MetricHelp kind="time"/></CardAction></CardHeader><CardContent><MetricTime rows={view.timeRows}/></CardContent></Card><Card><CardHeader><CardTitle>{t.labels.totals}</CardTitle><CardDescription>{t.totalsNote}</CardDescription><CardAction><MetricHelp kind="totals"/></CardAction></CardHeader><CardContent><MetricTotals totals={data.totals}/></CardContent></Card></div>
    <p className="metrics-source">{t.source}</p>
  </div>;
}
