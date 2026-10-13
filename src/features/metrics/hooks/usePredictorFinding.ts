"use client";
import { useState } from "react";
import type { FeatureSearch } from "../types";

export function usePredictorFinding(data:FeatureSearch[]) {
  const [target,setTarget]=useState("target_19");
  const search=data.find(row=>row.target === target)!;
  const candidates=search.candidates.filter(c=>c.clip).toSorted((a,b)=>a.k-b.k);
  const best=candidates.toSorted((a,b)=>a.rmse-b.rmse || a.k-b.k)[0];
  const all=search.candidates.map(c=>c.rmse), low=Math.min(...all), high=Math.max(...all);
  const pad=(high-low)*.2 || low*.01;
  const min=low-pad, max=high+pad;
  return {target,search,candidates,best,min,max,x:(value:number)=>200+(value-min)/(max-min)*540,
    changeTarget:(value:unknown)=> {if (typeof value === "string" && data.some(row=>row.target === value)) setTarget(value);},
  };
}
