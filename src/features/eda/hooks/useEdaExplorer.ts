"use client";

import { useState } from "react";
import snapshot from "../data/eda-snapshot.json";

export type EdaMarket = "stocks" | "jpx" | "lme" | "fx";
export type EdaSection = "distributions" | "quality" | "relationships";

export function useEdaExplorer() {
  const [section, setSection] = useState<EdaSection>("distributions");
  const [market, setMarket] = useState<EdaMarket>("stocks");
  const [pairIndex, setPairIndex] = useState("0");
  const selected = snapshot.markets.find((entry) => entry.key === market)!;
  return {
    section, market, pairIndex, selected,
    relation: snapshot.relations[Number(pairIndex)],
    provenance: snapshot.provenance,
    changeSection: (value: unknown) => {
      if (value === "distributions" || value === "quality" || value === "relationships") setSection(value);
    },
    changeMarket: (value: string | null) => {
      if (value === "stocks" || value === "jpx" || value === "lme" || value === "fx") setMarket(value);
    },
    changePair: (value: string | null) => {
      if (value !== null && /^[0-4]$/.test(value)) setPairIndex(value);
    },
  };
}
