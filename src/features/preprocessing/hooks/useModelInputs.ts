"use client";
import { useState } from "react";
import type { ModelInputCatalog, ModelInputEntry } from "../types/model-inputs";

export function useModelInputs(catalog:ModelInputCatalog, family:ModelInputEntry["family"] | "external_lstm") {
  const [target,setTarget]=useState("target_225");
  const selected=catalog.entries.find(row=>row.family===family && row.target===target);
  return {target,selected,changeTarget:(value:string|null)=>{
    if (value && catalog.entries.some(row=>row.target===value)) setTarget(value);
  }};
}
