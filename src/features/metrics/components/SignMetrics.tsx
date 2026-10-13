"use client";
import { Card,CardHeader,CardTitle,CardDescription,CardAction,CardContent } from "@/components/ui/card";
import copy from "@/i18n/es.json";
import type { SignFindingData } from "../types";
import { MetricHelp } from "./MetricHelp";

export function SignMetrics({selected}:{selected:SignFindingData}) {
  const t=copy.metrics.signFinding;
  const label=(model:string)=>model==="temporal" ? t.temporal[selected.target as keyof typeof t.temporal] : copy.metrics.models[model as keyof typeof copy.metrics.models];
  const pct=(value:number)=>(100*value).toFixed(2), x=(value:number)=>180+value*340;
  return <Card>
    <CardHeader><CardTitle><h2>{t.title}</h2></CardTitle><CardDescription>{t.subtitle}</CardDescription><CardAction><MetricHelp kind="direction"/></CardAction></CardHeader>
    <CardContent>
      <p className="r2-scope">n = {selected.n} · {t.coin} · {t.majority}: {pct(selected.majority)} %</p>
      <div className="metrics-plot" tabIndex={0} aria-label={copy.metrics.scroll}>
        <svg viewBox="0 0 620 280" role="img" aria-label={`${t.title}. ${t.coin}. ${t.majority}: ${pct(selected.majority)} %. ${selected.models.map(row=>`${label(row.model)}: ${pct(row.accuracy)} %`).join(". ")}`}>
          <title>{t.title}</title>
          {[0,.25,.5,.75,1].map(value=><g key={value}><line x1={x(value)} x2={x(value)} y1="18" y2="225" stroke="var(--border)"/><text x={x(value)} y="249" textAnchor="middle">{value*100}</text></g>)}
          <line x1={x(.5)} x2={x(.5)} y1="18" y2="225" stroke="var(--muted-foreground)" strokeDasharray="6 4"/>
          <line x1={x(selected.majority)} x2={x(selected.majority)} y1="18" y2="225" stroke="var(--foreground)" strokeDasharray="2 4"/>
          {selected.models.map((row,i)=>{const y=40+i*44;return <g key={row.model}><text x="166" textAnchor="end" y={y+5}>{label(row.model)}</text><circle cx={x(row.accuracy)} cy={y} r="6" fill={row.model==="media" ? "var(--muted-foreground)" : "var(--primary)"}/><text x="540" y={y+5}>{pct(row.accuracy)} %</text></g>;})}
          <text x="350" y="275" textAnchor="middle">{t.axis}</text>
        </svg>
      </div><p className="spearman-scroll-note">{copy.metrics.scroll}</p>
    </CardContent>
  </Card>;
}
