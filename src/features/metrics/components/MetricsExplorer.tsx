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
import { Button } from "@/components/ui/button";
import type { TargetId } from "@/features/prediction/types/prediction";
export function MetricsExplorer({ data, signs, fixedTarget, timingsCollapsible = false }: {
  data:MetricData; signs:SignFindingData[]; fixedTarget?: TargetId; timingsCollapsible?: boolean;
}) {
  const view=useMetrics(data, fixedTarget), t=copy.metrics, targets=copy.prediction.targets;
  const sign=signs.find(row=>row.target===view.target)!;
  const selectedSign={...sign,models:sign.models.filter(row=>view.model === "all" || row.model === view.model || row.model === "media")};
  return <div className="flex flex-col gap-6">
    <div className="metrics-controls">{!fixedTarget && <div><label id="metric-target" htmlFor="metric-target-trigger">{t.target}</label><Select value={view.target} onValueChange={view.changeTarget}><SelectTrigger id="metric-target-trigger" aria-labelledby="metric-target"><SelectValue>{targets[view.target as keyof typeof targets].label}</SelectValue></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectGroup className="flex flex-col gap-1 p-1.5">{Object.entries(targets).map(([id,target])=><SelectItem className="min-h-10 py-2 pl-2.5" key={id} value={id}>{target.label}</SelectItem>)}</SelectGroup></SelectContent></Select></div>}
      <div><label id="metric-model" htmlFor="metric-model-trigger">{t.algorithmLabel}</label><Select value={view.model} onValueChange={view.changeModel}><SelectTrigger id="metric-model-trigger" aria-labelledby="metric-model"><SelectValue>{view.model === "all" ? t.allAlgorithms : view.model === "temporal" ? t.signFinding.temporal[view.target as keyof typeof t.signFinding.temporal] : t.models[view.model as keyof typeof t.models]}</SelectValue></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectGroup className="flex flex-col gap-1 p-1.5">{["all","ols","lightgbm","temporal","lstm_externa"].map(id=><SelectItem key={id} value={id} className="min-h-10 py-2 pl-2.5">{id === "all" ? t.allAlgorithms : id === "temporal" ? t.signFinding.temporal[view.target as keyof typeof t.signFinding.temporal] : t.models[id as keyof typeof t.models]}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
      <Button variant="outline" aria-expanded={view.showCharts} aria-controls="performance-charts" onClick={view.toggleCharts}>{view.showCharts ? t.hideCharts : t.showCharts}</Button>
    </div>
    <div className="metrics-scope"><p>{t.finalScope}</p><p>{view.target} · {view.rows[0].n} {t.sample}</p><p className="metrics-scroll-note">{t.scroll}</p></div>
    <div id="performance-charts" hidden={!view.showCharts} className="performance-charts">
      <div className="metrics-grid">{(["rmse","mae","r2"] as const).map(metric=><Card key={metric}><CardHeader><CardTitle>{t.labels[metric]}</CardTitle><CardDescription>{metric === "r2" ? t.r2Note : t.errorNote}</CardDescription><CardAction><MetricHelp kind={metric === "r2" ? "r2" : "errors"}/></CardAction></CardHeader><CardContent><MetricBars rows={view.rows} metric={metric}/></CardContent></Card>)}<SignMetrics selected={selectedSign}/></div>
      <details open={timingsCollapsible ? undefined : true} className={timingsCollapsible ? "presentation-timings" : "metrics-timings"}>
        {timingsCollapsible && <summary>{copy.presentation.demo.timings}</summary>}
        {view.model !== "lstm_externa" ? <div className="metrics-grid metrics-time-grid"><Card><CardHeader><CardTitle>{t.labels.time}</CardTitle><CardDescription>{t.timeNote}</CardDescription><CardAction><MetricHelp kind="time"/></CardAction></CardHeader><CardContent><MetricTime rows={view.timeRows}/></CardContent></Card><Card><CardHeader><CardTitle>{t.labels.totals}</CardTitle><CardDescription>{t.totalsNote}</CardDescription><CardAction><MetricHelp kind="totals"/></CardAction></CardHeader><CardContent><MetricTotals totals={view.totals}/></CardContent></Card></div> : <p className="metrics-scope">{t.externalTimeUnavailable}</p>}
      </details>
      <p className="metrics-source">{t.source}</p>
    </div>
  </div>;
}
