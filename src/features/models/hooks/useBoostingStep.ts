"use client";

import { useState } from "react";
import { boostingExample, treeCorrection } from "../data";

const total = boostingExample.trees.length;

export function useBoostingStep() {
  const [step, setStep] = useState(0);
  const prediction = boostingExample.trees.slice(0, step).reduce((sum, _, i) => sum + treeCorrection(i), boostingExample.start);
  return {
    step, total, prediction,
    actual: boostingExample.actual,
    remaining: boostingExample.actual - prediction,
    nextCorrection: step < total ? treeCorrection(step) : null,
    canPrevious: step > 0,
    canNext: step < total,
    previous: () => setStep((value) => Math.max(0, value - 1)),
    next: () => setStep((value) => Math.min(total, value + 1)),
  };
}
