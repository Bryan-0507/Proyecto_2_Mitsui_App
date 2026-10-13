"use client";
import { Card,CardHeader,CardTitle,CardDescription,CardAction,CardContent,CardFooter } from "@/components/ui/card";
import { Select,SelectTrigger,SelectValue,SelectContent,SelectGroup,SelectItem } from "@/components/ui/select";
import { Field,FieldLabel } from "@/components/ui/field";
import { Table,TableHeader,TableRow,TableHead,TableBody,TableCell } from "@/components/ui/table";
import copy from "@/i18n/es.json";
import type { SpearmanStability } from "../types";
import { useSpearmanFinding } from "../hooks/useSpearmanFinding";
import { MetricHelp } from "./MetricHelp";

export function SpearmanFinding({data}:{data:SpearmanStability[]}) {
  const view=useSpearmanFinding(data), t=copy.metrics.spearmanFinding;
  const targets=copy.prediction.targets, feature=t.features[view.target as keyof typeof t.features];
  const labels=[t.training,...t.blocks], x=(rho:number)=>340+(rho+1)*230;
  const signed=(rho:number)=>`${rho>0 ? "+" : ""}${rho.toFixed(3)}`;
  return <Card className="r2-finding spearman-finding">
    <CardHeader><CardTitle><h2>{t.title}</h2></CardTitle><CardDescription>{t.subtitle}</CardDescription><CardAction><MetricHelp kind="spearman"/></CardAction></CardHeader>
    <CardContent className="r2-content">
      <p className="r2-explanation">{t.explanation}</p>
      <div className="spearman-toolbar"><Field className="spearman-control"><FieldLabel id="spearman-target-label">{copy.metrics.target}</FieldLabel><Select value={view.target} onValueChange={view.changeTarget}><SelectTrigger aria-labelledby="spearman-target-label"><SelectValue>{targets[view.target as keyof typeof targets].label}</SelectValue></SelectTrigger><SelectContent align="start" alignItemWithTrigger={false}><SelectGroup className="flex flex-col gap-1 p-1.5">{Object.entries(targets).map(([id,item])=><SelectItem key={id} value={id}>{item.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field><p className="spearman-feature">{feature.label}</p></div>
      <div className="spearman-chart" tabIndex={0} aria-label={t.scroll}>
        <svg viewBox="0 0 960 260" role="img" aria-label={`${feature.label}. ${view.selected.periods.map((p,i)=>`${labels[i]}: ${signed(p.rho)}, n=${p.n}`).join(". ")}`}>
          <title>{t.title}</title>
          {[-1,-.5,0,.5,1].map(rho=><g key={rho}><line x1={x(rho)} x2={x(rho)} y1="18" y2="210" stroke={rho===0 ? "var(--muted-foreground)" : "var(--border)"} strokeDasharray={rho===0 ? "4 4" : undefined}/><text x={x(rho)} y="231" textAnchor="middle" fontSize="13" fill="var(--muted-foreground)">{rho}</text></g>)}
          {view.selected.periods.map((p,i)=>{const y=40+i*48;return <g key={p.start}><text x="8" y={y} fontSize="15" fill="var(--foreground)">{labels[i]}</text><text x="8" y={y+18} fontSize="12" fill="var(--muted-foreground)">IDs {p.start} a {p.end} · n = {p.n}</text>{i===0 ? <path d={`M${x(p.rho)} ${y-7}l7 7-7 7-7-7Z`} fill="var(--primary)"/> : <circle cx={x(p.rho)} cy={y} r="5" fill="var(--muted-foreground)"/>}<text x="850" y={y+5} fontSize="15" fill="var(--foreground)">{signed(p.rho)}</text></g>;})}
          <text x="570" y="256" textAnchor="middle" fontSize="13" fill="var(--muted-foreground)">{t.axis}</text>
        </svg>
      </div><p className="spearman-scroll-note">{t.scroll}</p>
    </CardContent>
    <CardFooter className="r2-footer"><p>{t.conclusion}</p><div className="r2-meta"><p className="r2-scope">{t.scope}</p><details className="r2-detail"><summary>{t.detail}</summary><div className="flex flex-col gap-3 pt-3"><p>{t.meaning}</p><p>{feature.definition}</p><p>{t.selection.replace("{n}",String(view.selected.eligible))}</p><p>{t.limit}</p><p>{t.source} {view.selected.feature}</p><Table><TableHeader><TableRow><TableHead>{t.period}</TableHead><TableHead>IDs</TableHead><TableHead>n</TableHead><TableHead>{t.axis}</TableHead></TableRow></TableHeader><TableBody>{view.selected.periods.map((p,i)=><TableRow key={p.start}><TableCell>{labels[i]}</TableCell><TableCell>{p.start} a {p.end}</TableCell><TableCell>{p.n}</TableCell><TableCell>{p.rho.toFixed(6)}</TableCell></TableRow>)}</TableBody></Table></div></details></div></CardFooter>
  </Card>;
}
