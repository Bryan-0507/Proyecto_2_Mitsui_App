import type { MetricData, MetricRow } from "../types";
import { formatMetric } from "./MetricBars";
import copy from "@/i18n/es.json";
const names=copy.metrics.models;
export function MetricTime({ rows }: { rows:MetricRow[] }) {
  const temporalName=copy.metrics.signFinding.temporal[rows[0].target as keyof typeof copy.metrics.signFinding.temporal];
  const models=rows.filter(r=>r.model !== "media" && r.model !== "cero");
  const maxTime=Math.max(...models.map(r=>r.seconds ?? 0))*1.4;
  const low=Math.min(...rows.map(r=>r.rmse))*.97, high=Math.max(...rows.map(r=>r.rmse))*1.04;
  const x=(v:number)=>85+v/maxTime*420, y=(v:number)=>235-(v-low)/(high-low)*195;
  const ref=rows.find(r=>r.model === "media")!;
  return <><div className="metrics-plot" tabIndex={0} aria-label={copy.metrics.scroll}><svg viewBox="0 0 620 310" role="img" aria-label={copy.metrics.labels.time}><title>{copy.metrics.labels.time}</title>
    {[0,1,2,3,4].map(i=><g key={i}><line x1={85} x2={505} y1={40+i*195/4} y2={40+i*195/4} stroke="var(--border)"/><text x={76} y={44+i*195/4} textAnchor="end">{formatMetric(high-i*(high-low)/4)}</text><text x={x(i*maxTime/4)} y={258} textAnchor="middle">{formatMetric(i*maxTime/4)}</text></g>)}
    <line x1={85} x2={505} y1={y(ref.rmse)} y2={y(ref.rmse)} stroke="var(--muted-foreground)" strokeDasharray="5 5"/><text x={505} y={y(ref.rmse)-6} textAnchor="end">{names.media}</text>
    {models.map((r,i)=><g key={r.model}><circle cx={x(r.seconds ?? 0)} cy={y(r.rmse)} r={6} fill="var(--primary)"/><text x={x(r.seconds ?? 0)} y={y(r.rmse)-12} textAnchor="middle">{i+1}</text></g>)}<text x={85} y={20}>RMSE</text><text x={300} y={290} textAnchor="middle">{copy.metrics.fit} ({copy.metrics.seconds.toLowerCase()})</text>
  </svg></div><ol className="metrics-legend">{models.map(r=><li key={r.model}>{r.model === "temporal" ? temporalName : names[r.model as keyof typeof names]}: {formatMetric(r.seconds ?? 0)} s · RMSE {formatMetric(r.rmse)}</li>)}</ol></>;
}
export function MetricTotals({ totals }: { totals:MetricData["totals"] }) {
  const max=Math.max(...totals.map(r=>r.total))*1.2;
  const step=210/totals.length;
  return <div className="metrics-plot" tabIndex={0} aria-label={copy.metrics.scroll}><svg viewBox="0 0 620 310" role="img" aria-label={copy.metrics.labels.totals}><title>{copy.metrics.labels.totals}</title>
    {[0,1,2,3,4].map(i=><g key={i}><line x1={180+340*i/4} x2={180+340*i/4} y1={25} y2={240} stroke="var(--border)"/><text x={180+340*i/4} y={265} textAnchor="middle">{formatMetric(max*i/4)}</text></g>)}
    {totals.map((r,i)=><g key={r.model}><text x={166} y={30+step*(i+.5)+5} textAnchor="end">{names[r.model as keyof typeof names]}</text><rect x={180} y={30+step*(i+.5)-16} width={r.total/max*340} height={32} fill="var(--primary)"/><text x={188+r.total/max*340} y={30+step*(i+.5)+5}>{formatMetric(r.total)}</text></g>)}<text x={350} y={295} textAnchor="middle">{copy.metrics.seconds}</text></svg></div>;
}
