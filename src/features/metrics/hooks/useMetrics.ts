"use client";
import { useState } from "react";
import type { MetricData } from "../types";
export function useMetrics(data:MetricData) {
  const [target,setTarget]=useState("target_225");
  const order=["ols","lightgbm","temporal","lstm_externa","media","cero"];
  const rows=data.final.filter(r=>r.target===target).sort((a,b)=>order.indexOf(a.model)-order.indexOf(b.model));
  const timeRows=rows.filter(r=>r.model!=="lstm_externa").map(r=>({...r,seconds:data.initial.find(initial=>initial.target===target && initial.model===r.model)?.seconds ?? null}));
  return {target,rows,timeRows,changeTarget:(v:string|null)=>{if(v && ["target_225","target_19","target_105","target_410"].includes(v)) setTarget(v);}};
}
