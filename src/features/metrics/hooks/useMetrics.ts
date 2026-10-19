"use client";
import { useState } from "react";
import type { MetricData } from "../types";
export function useMetrics(data:MetricData, initialTarget = "target_225") {
  const [target,setTarget]=useState(initialTarget);
  const [model,setModel]=useState("all");
  const [showCharts,setShowCharts]=useState(true);
  const order=["ols","lightgbm","temporal","lstm_externa","media","cero"];
  const rows=data.final.filter(r=>r.target===target && (model === "all" || [model,"media","cero"].includes(r.model))).sort((a,b)=>order.indexOf(a.model)-order.indexOf(b.model));
  const timeRows=rows.filter(r=>r.model!=="lstm_externa").map(r=>({...r,seconds:data.initial.find(initial=>initial.target===target && initial.model===r.model)?.seconds ?? null}));
  const totals=data.totals.filter(r=>model === "all" || r.model === model);
  return {target,model,showCharts,rows,timeRows,totals,toggleCharts:()=>setShowCharts(value=>!value),changeModel:(v:string|null)=>{if(v && ["all","ols","lightgbm","temporal","lstm_externa"].includes(v)) setModel(v);},changeTarget:(v:string|null)=>{if(v && ["target_225","target_19","target_105","target_410"].includes(v)) setTarget(v);}};
}
