import type { MetricRow } from "../types";
import copy from "@/i18n/es.json";
export const formatMetric = (v:number) => new Intl.NumberFormat("es-GT", { maximumFractionDigits:6 }).format(v);
export function MetricBars({ rows, metric }: { rows:MetricRow[]; metric:"rmse"|"mae"|"r2"|"sign" }) {
  const values = rows.map(r => metric === "sign" ? (r.sign ?? 0)*100 : r[metric]);
  const min = Math.min(0,...values)*1.15;
  const max = metric === "sign" ? 100 : Math.max(0,...values)*1.2 || .01;
  const x = (v:number) => 180+(v-min)/(max-min)*340;
  const name = (model:string) => model === "temporal" ? copy.metrics.signFinding.temporal[rows[0].target as keyof typeof copy.metrics.signFinding.temporal] : copy.metrics.models[model as keyof typeof copy.metrics.models];
  return <div className="metrics-plot" tabIndex={0} aria-label={copy.metrics.scroll}>
    <svg viewBox={`0 0 620 ${rows.length*44+60}`} role="img" aria-label={`${copy.metrics.labels[metric]}: ${rows.map((r,i)=>`${name(r.model)} ${formatMetric(values[i])}`).join(", ")}`}>
      <title>{copy.metrics.labels[metric]}</title>
      {[0,1,2,3,4].map(i => { const v=min+(max-min)*i/4; return <g key={i}><line x1={x(v)} x2={x(v)} y1={20} y2={rows.length*44+20} stroke="var(--border)"/><text x={x(v)} y={rows.length*44+44} textAnchor="middle">{formatMetric(v)}</text></g>; })}
      <line x1={x(0)} x2={x(0)} y1={20} y2={rows.length*44+20} stroke="var(--foreground)"/>
      {rows.map((r,i)=><g key={r.model}><text x={166} y={i*44+40} textAnchor="end">{name(r.model)}</text><rect x={Math.min(x(0),x(values[i]))} y={i*44+24} width={Math.abs(x(values[i])-x(0))} height={22} rx={2} fill={r.model === "media" || r.model === "cero" ? "var(--muted-foreground)" : "var(--primary)"}/><text x={Math.max(x(0),x(values[i]))+8} y={i*44+40}>{formatMetric(values[i])}{metric === "sign" ? "%" : ""}</text></g>)}
    </svg>
  </div>;
}
