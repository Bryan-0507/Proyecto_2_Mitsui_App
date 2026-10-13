import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { MetricData, MetricRow, R2Data, R2Point, FeatureSearch, SpearmanStability, SignFindingData } from "./types";

export async function getSignFinding(): Promise<SignFindingData[]> {
  const [predictions, allMetrics] = await Promise.all([rows("final-comparison/predictions.csv"), rows("final-comparison/metrics.csv")]);
  const saved=predictions.filter(r=>r.cohorte==="posterior_frontera").map(r=>({target:r.target,date_id:r.date_id,real:r.real,prediccion:r.prediccion,familia:r.modelo}));
  const metrics=allMetrics.filter(r=>r.cohorte==="posterior_frontera");
  return ["target_225","target_19","target_105","target_410"].map(target => {
    const baseline=saved.filter(r=>r.target===target && r.familia==="ols");
    const reference=new Map(baseline.map(r=>[numeric(r.date_id),numeric(r.real)]));
    if(reference.size!==baseline.length || !reference.size || [...reference.keys()].some(id=>!Number.isInteger(id)||id<1832||id>1960)) throw new Error("Invalid sign reference");
    const valid=[...reference.values()].filter(y=>y!==0);
    const positive=valid.filter(y=>y>0).length, negative=valid.length-positive;
    const models=["ols","lightgbm","temporal","lstm_externa","media"].map(model=>{
      const group=saved.filter(r=>r.target===target && r.familia===model);
      if(group.length!==reference.size || new Set(group.map(r=>r.date_id)).size!==reference.size || group.some(r=>reference.get(numeric(r.date_id))!==numeric(r.real))) throw new Error("Sign alignment mismatch");
      const correct=group.filter(r=>numeric(r.real)!==0 && Math.sign(numeric(r.real))===Math.sign(numeric(r.prediccion))).length;
      const accuracy=correct/valid.length;
      const metric=metrics.find(r=>r.target===target && r.modelo===model);
      if(!metric || numeric(metric.n)!==reference.size || !valid.length) throw new Error("Sign metric mismatch");
      return {model,correct,accuracy};
    });
    return {target,n:valid.length,positive,negative,majority:Math.max(positive,negative)/valid.length,models};
  });
}

export async function getSpearmanStability(): Promise<SpearmanStability[]> {
  const data:SpearmanStability[]=JSON.parse(await readFile(path.join(process.cwd(), "artifacts/evaluation/benchmark/spearman-stability.json"), "utf8"));
  const targets=["target_225","target_19","target_105","target_410"];
  if(data.length !== 4 || new Set(data.map(r=>r.target)).size !== 4 || targets.some(t=>!data.some(r=>r.target === t))) throw new Error("Invalid stability targets");
  for(const row of data) {
    if(!row.feature || !Number.isInteger(row.eligible) || row.eligible < 1 || row.periods.length !== 4) throw new Error("Invalid stability selection");
    row.periods.forEach((p,i)=>{
      if(!Number.isFinite(p.rho) || Math.abs(p.rho)>1 || !Number.isInteger(p.n) || p.n<20 || p.n>p.end-p.start+1 || !Number.isInteger(p.start) || !Number.isInteger(p.end) || p.end<p.start) throw new Error("Invalid stability period");
      if(i && (p.start !== [981,1177,1373][i-1] || p.end !== [1176,1372,1563][i-1])) throw new Error("Invalid stability window");
    });
  }
  return data;
}

// These internally generated numeric CSVs contain no quoted fields. Reject format changes.
async function rows(file: string) {
  const text = await readFile(path.join(process.cwd(), "artifacts/evaluation", file), "utf8");
  const [header, ...lines] = text.trim().split(/\r?\n/);
  if (text.includes('"')) throw new Error("Unsupported metric CSV format");
  const keys = header.split(",");
  return lines.map(line => {
    const values = line.split(",");
    if (values.length !== keys.length) throw new Error("Invalid metric CSV row");
    return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
  });
}
const numeric = (value: string) => {
  if (value === "" || !Number.isFinite(Number(value))) throw new Error("Invalid metric value");
  return Number(value);
};
export async function getFeatureSearch(): Promise<FeatureSearch[]> {
  const data:FeatureSearch[] = JSON.parse(await readFile(path.join(process.cwd(), "artifacts/evaluation/benchmark/feature-search.json"), "utf8"));
  if (data.length !== 4 || new Set(data.map(r=>r.target)).size !== 4) throw new Error("Invalid feature search targets");
  for (const row of data) {
    if (row.candidates.length !== 6 || row.folds.length !== 3) throw new Error("Invalid feature search size");
    for (const clip of [false,true]) {
      const group=row.candidates.filter(c=>c.clip === clip);
      if (group.length !== 3 || [8,16,32].some(k=>!group.some(c=>c.k === k))) throw new Error("Missing feature candidate");
    }
    for (const candidate of row.candidates) {
      if (!Number.isFinite(candidate.rmse) || candidate.rmse <= 0 || candidate.foldRmse.length !== 3 || candidate.foldN.length !== 3 || candidate.foldN.some((n,i)=>n !== row.folds[i].n)) throw new Error("Invalid feature search metrics");
      if (Math.abs(candidate.foldRmse.reduce((a,b)=>a+b,0)/3-candidate.rmse) > 1e-12) throw new Error("Feature mean mismatch");
    }
    const winner=row.candidates.toSorted((a,b)=>a.rmse-b.rmse || a.k-b.k || Number(a.clip)-Number(b.clip))[0];
    if (winner.k !== row.selectedK || winner.clip !== row.selectedClip) throw new Error("Feature winner mismatch");
  }
  return data;
}
export async function getMetricData(): Promise<MetricData> {
  const [initial, final, totals] = await Promise.all([rows("benchmark/metrics.csv"), rows("final-comparison/metrics.csv"), rows("benchmark/training-totals.csv")]);
  const models = ["ols", "lightgbm", "temporal", "lstm_externa", "media", "cero"];
  const data: MetricData = {
    initial: initial.map(r => ({ target:r.target, model:r.familia, rmse:numeric(r.rmse), mae:numeric(r.mae), r2:numeric(r.r2), sign:numeric(r.acierto_signo), seconds:numeric(r.segundos_ajuste_final), n:numeric(r.n) })),
    final: final.filter(r => r.cohorte === "posterior_frontera" && models.includes(r.modelo)).map(r => ({ target:r.target, model:r.modelo, rmse:numeric(r.rmse), mae:numeric(r.mae), r2:numeric(r.r2), sign:null, seconds:null, n:numeric(r.n) })),
    totals: totals.map(r => ({ model:r.family, search:numeric(r.search_seconds), fit:numeric(r.final_fit_seconds), total:numeric(r.total_seconds) })),
  };
  for (const group of [data.initial, data.final]) for (const target of ["target_225", "target_19", "target_105", "target_410"]) {
    const sample: MetricRow[] = group.filter(r => r.target === target);
    if (!sample.length || sample.some(r => r.n !== sample[0].n)) throw new Error("Metric sample mismatch");
  }
  return data;
}

export async function getR2Data(): Promise<R2Data> {
  const saved = (await rows("final-comparison/predictions.csv")).filter(r => r.cohorte === "posterior_frontera" && r.target === "target_19" && ["temporal", "cero", "media"].includes(r.modelo));
  const maps = Object.fromEntries(["temporal", "cero", "media"].map(model => [model, new Map<number,{real:number; prediction:number}>()]));
  for (const r of saved) {
    const id = numeric(r.date_id);
    if (!Number.isInteger(id) || id < 1832 || id > 1960 || maps[r.modelo].has(id)) throw new Error("Invalid reference ID");
    maps[r.modelo].set(id, {real:numeric(r.real), prediction:numeric(r.prediccion)});
  }
  if (Object.values(maps).some(m => m.size !== 117)) throw new Error("Reference sample mismatch");
  const points:R2Point[] = Array.from({length:129}, (_,i) => {
    const id = 1832+i, a = maps.temporal.get(id), b = maps.cero.get(id), c = maps.media.get(id);
    if (!a && !b && !c) return {id, real:null, temporal:null, cero:null, media:null};
    if (!a || !b || !c || a.real !== b.real || a.real !== c.real || b.prediction !== 0) throw new Error("Reference alignment mismatch");
    return {id, real:a.real, temporal:a.prediction, cero:b.prediction, media:c.prediction};
  });
  return {points, n:117};
}
