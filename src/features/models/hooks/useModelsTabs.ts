"use client";

import { useState } from "react";

export type ModelFamily = "linear" | "temporal" | "boosting" | "external";

export function useModelsTabs() {
  const [family, setFamily] = useState<ModelFamily>("linear");
  return {
    family,
    changeFamily: (value: unknown) => {
      if (value === "linear" || value === "temporal" || value === "boosting" || value === "external") setFamily(value);
    },
  };
}
