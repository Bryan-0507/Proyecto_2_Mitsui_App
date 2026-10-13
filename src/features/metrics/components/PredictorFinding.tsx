"use client";
import { Card,CardHeader,CardTitle,CardDescription,CardAction,CardContent,CardFooter } from "@/components/ui/card";
import { Select,SelectTrigger,SelectValue,SelectContent,SelectGroup,SelectItem } from "@/components/ui/select";
import { Field,FieldLabel } from "@/components/ui/field";
import { Table,TableHeader,TableRow,TableHead,TableBody,TableCell } from "@/components/ui/table";
import copy from "@/i18n/es.json";
import type { FeatureSearch } from "../types";
import { usePredictorFinding } from "../hooks/usePredictorFinding";
import { MetricHelp } from "./MetricHelp";
import { formatMetric } from "./MetricBars";

export function PredictorFinding({data}:{data:FeatureSearch[]}) {
  const view=usePredictorFinding(data), t=copy.metrics.predictorFinding, targets=copy.prediction.targets;
  return <Card className="r2-finding predictor-finding">
    <CardHeader><CardTitle><h2>{t.title}</h2></CardTitle><CardDescription>{t.subtitle}</CardDescription><CardAction><MetricHelp kind="predictors"/></CardAction></CardHeader>
    <CardContent className="r2-content">
      <p className="r2-explanation">{t.explanation}</p>
      <div className="predictor-controls">
        <Field><FieldLabel id="predictor-target-label">{copy.metrics.target}</FieldLabel><Select value={view.target} onValueChange={view.changeTarget}><SelectTrigger aria-labelledby="predictor-target-label"><SelectValue>{targets[view.target as keyof typeof targets].label}</SelectValue></SelectTrigger><SelectContent alignItemWithTrigger={false}><SelectGroup className="flex flex-col gap-1 p-1.5">{Object.entries(targets).map(([id,item])=><SelectItem className="min-h-10 py-2 pl-2.5" key={id} value={id}>{item.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
      </div>
      <div className="r2-chart" tabIndex={0} aria-label={copy.metrics.r2Finding.scroll}>
        <svg viewBox="0 0 1000 210" role="img" aria-label={`${targets[view.target as keyof typeof targets].label}. ${t.axis}. ${view.best.k} ${t.predictors}: ${formatMetric(view.best.rmse)}. ${t.zoom}`}>
          <title>{t.title}</title>
          {[0,.5,1].map(f=>{const value=view.min+(view.max-view.min)*f;return <g key={f}><line x1={view.x(value)} x2={view.x(value)} y1="20" y2="170" stroke="var(--border)"/><text x={view.x(value)} y="187" textAnchor="middle" fontSize="13" fill="var(--muted-foreground)">{formatMetric(value)}</text></g>;})}
          {view.candidates.map((c,i)=>{const y=45+i*55, winner=c.k === view.best.k; return <g key={c.k}><text x="20" y={y+5} fontSize="15" fill="var(--foreground)">{c.k} {t.predictors}</text>{winner ? <path d={`M${view.x(c.rmse)} ${y-7}l7 7-7 7-7-7Z`} fill="var(--primary)"/> : <circle cx={view.x(c.rmse)} cy={y} r="5" fill="var(--muted-foreground)"/>}<text x="785" y={y+5} fontSize="15" fill="var(--foreground)">{formatMetric(c.rmse)}</text>{winner && <text x="885" y={y+5} fontSize="13" fill="var(--primary)">{t.best}</text>}</g>;})}
          <text x="470" y="208" textAnchor="middle" fontSize="13" fill="var(--muted-foreground)">{t.axis}</text>
        </svg>
      </div>
      <p className="r2-scroll-note">{copy.metrics.r2Finding.scroll}</p>
    </CardContent>
    <CardFooter className="r2-footer">
      <p aria-live="polite">{t.result.replace("{k}",String(view.best.k)).replace("{rmse}",formatMetric(view.best.rmse))}</p>
      <div className="r2-meta"><p className="r2-scope">{t.scope}</p>
        <details className="r2-detail"><summary>{t.detail}</summary><div className="flex flex-col gap-3 pt-3">
          <p>{t.countNote}</p><p>{t.clipNote}</p><p>{t.limits}</p><p>{t.source}</p>
          <Table><TableHeader><TableRow><TableHead>{copy.metrics.target}</TableHead><TableHead>{t.selected}</TableHead><TableHead>{t.clip}</TableHead></TableRow></TableHeader><TableBody>{data.map(row=><TableRow key={row.target}><TableCell>{targets[row.target as keyof typeof targets].label} · {row.target}</TableCell><TableCell>{row.selectedK}</TableCell><TableCell>{row.selectedClip ? t.withClip : t.withoutClip}</TableCell></TableRow>)}</TableBody></Table>
          <Table><TableHeader><TableRow><TableHead>{t.predictors}</TableHead><TableHead>{t.clip}</TableHead><TableHead>{t.axis}</TableHead>{view.search.folds.map(f=><TableHead key={f.start}>{f.start} a {f.end}<br/>n = {f.n}</TableHead>)}</TableRow></TableHeader><TableBody>{view.search.candidates.map(c=><TableRow key={`${c.k}-${c.clip}`}><TableCell>{c.k}</TableCell><TableCell>{c.clip ? t.withClip : t.withoutClip}</TableCell><TableCell>{formatMetric(c.rmse)}</TableCell>{c.foldRmse.map((value,i)=><TableCell key={i}>{formatMetric(value)}</TableCell>)}</TableRow>)}</TableBody></Table>
        </div></details>
      </div>
    </CardFooter>
  </Card>;
}
