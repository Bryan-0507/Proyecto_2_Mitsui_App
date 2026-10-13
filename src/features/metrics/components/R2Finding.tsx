"use client";
import { Card,CardHeader,CardTitle,CardDescription,CardContent,CardAction,CardFooter } from "@/components/ui/card";
import { Select,SelectTrigger,SelectValue,SelectContent,SelectGroup,SelectItem } from "@/components/ui/select";
import { Field,FieldLabel } from "@/components/ui/field";
import { Table,TableHeader,TableBody,TableRow,TableHead,TableCell } from "@/components/ui/table";
import copy from "@/i18n/es.json";
import type { R2Data } from "../types";
import { useR2Finding } from "../hooks/useR2Finding";
import { formatMetric } from "./MetricBars";
import { MetricHelp } from "./MetricHelp";

const formatAxis = new Intl.NumberFormat("es-GT", { maximumFractionDigits:3 });

export function R2Finding({data}:{data:R2Data}) {
  const view=useR2Finding(data), t=copy.metrics.r2Finding;
  return <Card className="r2-finding">
    <CardHeader>
      <CardTitle><h2>{t.title}</h2></CardTitle>
      <CardDescription>{t.subtitle}</CardDescription>
      <CardAction><MetricHelp kind="reference"/></CardAction>
    </CardHeader>
    <CardContent className="r2-content">
      <p className="r2-explanation">{t.explanation}</p>
      <div className="r2-toolbar">
        <Field className="r2-control">
          <FieldLabel id="r2-reference-label">{t.control}</FieldLabel>
          <Select value={view.selected} onValueChange={view.changeSelected}>
            <SelectTrigger aria-labelledby="r2-reference-label"><SelectValue>{t.options[view.selected]}</SelectValue></SelectTrigger>
            <SelectContent alignItemWithTrigger={false}><SelectGroup className="flex flex-col gap-1 p-1.5">{Object.entries(t.options).map(([id,label])=><SelectItem key={id} value={id} className="min-h-10 py-2 pl-2.5">{label}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
        </Field>
        <div className="r2-legend">
          <span><svg viewBox="0 0 32 12" aria-hidden="true"><path d="M0 6H32" stroke="var(--muted-foreground)" strokeWidth="2"/><circle cx="16" cy="6" r="3" fill="var(--muted-foreground)"/></svg>{t.real}</span>
          <span><svg viewBox="0 0 32 12" aria-hidden="true"><path d="M0 6H32" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="6 4"/></svg>{t.options[view.selected]}</span>
        </div>
      </div>
      {view.selected === "evaluationMean" && <p className="r2-reference-note" role="status">{t.meanWarning}</p>}
      <div className="r2-chart" tabIndex={0} aria-label={t.scroll}>
        <svg viewBox="0 0 1000 210" role="img" aria-label={`${t.subtitle}. ${t.options[view.selected]}: RMSE ${formatMetric(view.rmse)}, R^2 ${formatMetric(view.r2)}`}>
          <title>{t.title}</title><text x="72" y="20" fill="var(--muted-foreground)" fontSize="13">{t.yAxis}</text>
          {[-1,-.5,0,.5,1].map(k => <g key={k}><line x1="72" x2="960" y1={view.y(k*view.limit)} y2={view.y(k*view.limit)} stroke={k === 0 ? "var(--muted-foreground)" : "var(--border)"}/><text x="62" y={view.y(k*view.limit)+4} textAnchor="end" fontSize="13" fill="var(--muted-foreground)">{formatAxis.format(k*view.limit)}</text></g>)}
          <path d={view.realPath} fill="none" stroke="var(--muted-foreground)" strokeWidth="1.6"/>
          <path d={view.predictionPath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="7 4"/>
          {view.values.filter(p=>p.real !== null).map(p=><circle key={p.id} cx={view.x(p.id)} cy={view.y(p.real!)} r="2" fill="var(--muted-foreground)"/>)}
          {[1832,1864,1896,1928,1960].map(id=><text key={id} x={view.x(id)} y="181" textAnchor="middle" fontSize="13" fill="var(--muted-foreground)">{id}</text>)}
          <text x="516" y="205" textAnchor="middle" fontSize="13" fill="var(--muted-foreground)">{t.xAxis}</text>
        </svg>
      </div>
      <p className="r2-scroll-note">{t.scroll}</p>
    </CardContent>
    <CardFooter className="r2-footer">
      <dl className="r2-metrics" aria-live="polite">{[[t.rmse,view.rmse],[t.r2,view.r2],[t.dispersion,view.dispersion]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{formatMetric(value as number)}</dd></div>)}</dl>
      <div className="r2-meta"><p className="r2-scope">{t.scope}</p>
      <details className="r2-detail"><summary>{t.detail}</summary><div className="flex flex-col gap-3 pt-3"><p>{t.scaleNote}</p><p>{t.formula}</p><p>{t.dispersionNote}</p><p>{t.source}</p><Table><TableHeader><TableRow><TableHead>{t.id}</TableHead><TableHead>{t.real}</TableHead><TableHead>{t.options[view.selected]}</TableHead></TableRow></TableHeader><TableBody>{view.values.map(p=><TableRow key={p.id}><TableCell>{p.id}</TableCell><TableCell>{p.real === null ? "-" : formatMetric(p.real)}</TableCell><TableCell>{p.prediction === null ? "-" : formatMetric(p.prediction)}</TableCell></TableRow>)}</TableBody></Table></div></details>
      </div>
    </CardFooter>
  </Card>;
}
