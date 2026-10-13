"use client";
import { useMemo, useState } from "react";
import type { R2Data, ReferenceKey } from "../types";

export function useR2Finding(data:R2Data) {
  const [selected,setSelected] = useState<ReferenceKey>("temporal");
  const analysis = useMemo(() => {
    const valid = data.points.filter(p => p.real !== null);
    const mean = valid.reduce((s,p) => s+p.real!,0)/valid.length;
    const variance = valid.reduce((s,p) => s+(p.real!-mean)**2,0)/valid.length;
    const values = data.points.map(p => ({...p, prediction:p.real === null ? null : selected === "evaluationMean" ? mean : p[selected]}));
    const mse = values.filter(p => p.real !== null).reduce((s,p) => s+(p.real!-p.prediction!)**2,0)/valid.length;
    const limit = Math.max(...valid.map(p => Math.abs(p.real!)), ...data.points.flatMap(p => [p.temporal ?? 0,p.media ?? 0].map(Math.abs)),Math.abs(mean))*1.12;
    const x = (id:number) => 72+(id-1832)/128*888;
    const y = (v:number) => 99-v/limit*60;
    const makePath = (key:"real"|"prediction") => {
      let previous = false;
      return values.map(p => {const v=p[key]; if(v === null) {previous=false; return "";} const command=previous?"L":"M";previous=true;return `${command}${x(p.id).toFixed(2)},${y(v).toFixed(2)}`;}).join(" ");
    };
    return {values, mean, rmse:Math.sqrt(mse), r2:1-mse/variance, dispersion:Math.sqrt(variance), limit, x,y, realPath:makePath("real"), predictionPath:makePath("prediction")};
  },[data,selected]);
  function changeSelected(value:unknown) {
    if (value === "temporal" || value === "cero" || value === "media" || value === "evaluationMean") setSelected(value);
  }
  return {selected,changeSelected,...analysis};
}
