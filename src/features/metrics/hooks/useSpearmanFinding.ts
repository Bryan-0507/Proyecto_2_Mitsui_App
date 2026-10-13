"use client";
import { useState } from "react";
import type { SpearmanStability } from "../types";
export function useSpearmanFinding(data:SpearmanStability[]) {
  const [target,setTarget]=useState("target_410");
  const selected=data.find(r=>r.target === target)!;
  return {target,selected,changeTarget:(value:unknown)=>{
    if(typeof value === "string" && data.some(r=>r.target === value)) setTarget(value);
  }};
}
