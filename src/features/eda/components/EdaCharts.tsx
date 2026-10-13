"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import copy from "@/i18n/es.json";
import type snapshot from "../data/eda-snapshot.json";

type Market = typeof snapshot.markets[number];
type Relation = typeof snapshot.relations[number];
const text = copy.eda;
const left = 64, right = 588, top = 30, bottom = 250;
export const numeric = (value: number) => new Intl.NumberFormat("es-GT", { maximumFractionDigits: Math.abs(value) < 1 ? 4 : 2 }).format(value);
const ticks = (min: number, max: number) => Array.from({ length: 5 }, (_, i) => min + (max - min) * i / 4);
const scale = (value: number, min: number, max: number, a: number, b: number) => a + (value - min) / (max - min || 1) * (b - a);

function Plot({ title, xDomain, yDomain, xLabel, yLabel, children, compact = false }: {
  title: string; xDomain: [number, number]; yDomain: [number, number]; xLabel: string; yLabel: string; children: ReactNode; compact?: boolean;
}) {
  const id = useId();
  const right = compact ? 968 : 588, bottom = compact ? 170 : 250;
  return <div><p className="eda-scroll-hint">{text.scrollChart}</p><div className="eda-plot-scroll" tabIndex={0} aria-label={text.scrollChart}><svg viewBox={compact ? "0 0 1000 220" : "0 0 620 300"} className={compact ? "eda-plot eda-coverage-plot" : "eda-plot"} role="img" aria-labelledby={id}>
    <title id={id}>{title}</title>
    {(compact ? [0,5,10,15,20,25] : ticks(...yDomain)).map((value) => {
      const y = scale(value, ...yDomain, bottom, top);
      return <g key={value}><line x1={left} x2={right} y1={y} y2={y} className="eda-gridline" />
        <text x={left - 10} y={y + 4} textAnchor="end">{numeric(value)}</text></g>;
    })}
    {ticks(...xDomain).map((value) => <text key={value} x={scale(value, ...xDomain, left, right)} y={bottom + 20} textAnchor="middle">{numeric(value)}</text>)}
    <text x={(left + right) / 2} y={bottom + 40} textAnchor="middle">{xLabel}</text>
    <text x={left} y={16}>{yLabel}</text>
    {children}
  </svg></div></div>;
}

export function Histogram({ market }: { market: Market }) {
  const max = Math.ceil(Math.max(...market.histogram.map((b) => b.count))/4)*4;
  const minValue = market.box.min, maxValue = market.box.max;
  return <Plot title={text.histogram} xDomain={[minValue, maxValue]} yDomain={[0, max]}
    xLabel={text.originalValue} yLabel={text.frequency}>
    {market.histogram.map((bin, index) => {
      const x = scale(bin.start, minValue, maxValue, left, right);
      const next = scale(bin.end, minValue, maxValue, left, right);
      const y = scale(bin.count, 0, max, bottom, top);
      return <rect key={index} x={x} y={y} width={Math.max(0,next-x-1)} height={bottom-y} className="eda-primary-mark">
        <title>{`${numeric(bin.start)}–${numeric(bin.end)}: ${bin.count}`}</title>
      </rect>;
    })}
  </Plot>;
}

export function BoxPlot({ market }: { market: Market }) {
  const id = useId(), box = market.box;
  const x = (value: number) => scale(value,box.min,box.max,left,right);
  return <div><p className="eda-scroll-hint">{text.scrollChart}</p><div className="eda-plot-scroll" tabIndex={0} aria-label={text.scrollChart}><svg viewBox="0 0 620 170" className="eda-box" role="img" aria-labelledby={id}>
    <title id={id}>{`${text.box}: ${text.median} ${numeric(box.median)}`}</title>
    <line x1={x(box.low)} x2={x(box.high)} y1={68} y2={68} className="eda-box-line" />
    {[box.low,box.high].map((v,i) => <line key={i} x1={x(v)} x2={x(v)} y1={50} y2={86} className="eda-box-line" />)}
    <rect x={x(box.q1)} y={44} width={x(box.q3)-x(box.q1)} height={48} className="eda-box-fill" />
    <line x1={x(box.median)} x2={x(box.median)} y1={44} y2={92} className="eda-box-line" />
    {box.outside.map((v,i) => <circle key={i} cx={x(v)} cy={68} r={3} className="eda-primary-mark"><title>{numeric(v)}</title></circle>)}
    {[{v:box.q1,l:"Q1"},{v:box.median,l:text.median},{v:box.q3,l:"Q3"}].map(({v,l}) => <text key={l} x={x(v)} y={30} textAnchor="middle">{l}</text>)}
    {ticks(box.min,box.max).map((v) => <text key={v} x={x(v)} y={125} textAnchor="middle">{numeric(v)}</text>)}
    <text x={(left+right)/2} y={155} textAnchor="middle">{text.originalValue}</text>
  </svg></div></div>;
}

export function MissingCoverage({ market }: { market: Market }) {
  const blocks = market.coverage.blocks;
  const end = blocks[blocks.length-1].end;
  const right = 968, bottom = 170;
  if (market.coverage.missing === 0) return <p className="eda-selection" role="status">{text.noMissing}</p>;
  return <Plot compact title={text.coverage} xDomain={[blocks[0].start,end]} yDomain={[0,25]} xLabel={text.dateId} yLabel={text.missing}>
    {blocks.map((block) => {
      const x = scale(block.start,blocks[0].start,end,left,right);
      const next = scale(Math.min(end,block.end+1),blocks[0].start,end,left,right);
      const y = scale(block.percentage,0,25,bottom,top);
      return <rect key={block.start} x={x} y={y} width={Math.max(0,next-x-1)} height={bottom-y} className="eda-primary-mark">
        <title>{`${block.start}–${block.end}: ${numeric(block.percentage)} % (${block.missing}/${block.cells})`}</title>
      </rect>;
    })}
  </Plot>;
}

export function OutlierPlot({ market, ids }: { market: Market; ids: number[] }) {
  const points = market.quality.points;
  const values = points.map((p) => p.value);
  const min = Math.min(...values), max = Math.max(...values);
  const yMin = min >= 0 ? Math.max(0,min-(max-min)*.03) : min-(max-min)*.03;
  const yMax = max + (max-min)*.03;
  return <Plot title={text.outliers} xDomain={[ids[0],ids[1]]} yDomain={[yMin,yMax]} xLabel={text.dateId} yLabel={text.originalValue}>
    {points.filter((p) => !p.outlier).map((p) => <circle key={p.id} cx={scale(p.id,ids[0],ids[1],left,right)} cy={scale(p.value,yMin,yMax,bottom,top)} r={1.7} className="eda-context-mark" />)}
    {points.filter((p) => p.outlier).map((p) => {
      const x = scale(p.id,ids[0],ids[1],left,right), y = scale(p.value,yMin,yMax,bottom,top);
      return <path key={p.id} d={`M ${x} ${y-3} l 3 3 l -3 3 l -3 -3 Z`} className="eda-primary-mark"><title>{`${p.id}: ${numeric(p.value)}`}</title></path>;
    })}
  </Plot>;
}

export function RelationshipPlot({ relation }: { relation: Relation }) {
  const xs=relation.points.map((p)=>p.x), ys=relation.points.map((p)=>p.y);
  const xMin=Math.min(...xs),xMax=Math.max(...xs), yMin=Math.min(...ys),yMax=Math.max(...ys);
  return <Plot title={text.relationsTitle} xDomain={[xMin,xMax]} yDomain={[yMin,yMax]} xLabel={text.predictor} yLabel={text.target}>
    <line x1={left} x2={right} y1={scale(0,yMin,yMax,bottom,top)} y2={scale(0,yMin,yMax,bottom,top)} className="eda-zero" />
    {relation.points.map((p,i)=><circle key={i} cx={scale(p.x,xMin,xMax,left,right)} cy={scale(p.y,yMin,yMax,bottom,top)} r={2} className="eda-relation-mark" />)}
  </Plot>;
}

export function ChartData({ headers, rows, name }: { headers: string[]; rows: (string|number)[][]; name: string }) {
  const csv = [headers,...rows].map((row)=>row.map((v)=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  return <details className="eda-data"><summary>{text.table}</summary>
    <Button variant="outline" size="sm" nativeButton={false} render={<a download={`${name}.csv`} href={`data:text/csv;charset=utf-8,${encodeURIComponent("\uFEFF"+csv)}`} />}>{text.download}</Button>
    <div className="eda-data-scroll"><Table><TableHeader><TableRow>{headers.map((h)=><TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
      <TableBody>{rows.map((row,i)=><TableRow key={i}>{row.map((v,j)=><TableCell key={j}>{typeof v==="number"?numeric(v):v}</TableCell>)}</TableRow>)}</TableBody>
    </Table></div>
  </details>;
}
