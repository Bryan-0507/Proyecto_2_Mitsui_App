"use client";
import { useState } from "react";
export function useResultsTabs() {
  const [tab,setTab]=useState<"findings"|"metrics">("findings");
  const [finding,setFinding]=useState<"r2"|"predictors"|"spearman">("r2");
  return { tab, finding, changeFinding:(value:unknown)=> {
    if (value === "r2" || value === "predictors" || value === "spearman") setFinding(value);
  }, changeTab:(value:unknown)=> {
    if (value === "findings" || value === "metrics") setTab(value);
  }};
}
