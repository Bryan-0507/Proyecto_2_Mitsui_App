"use client";

import { useState } from "react";
import copy from "@/i18n/es.json";

const steps = copy.models.externalSection.memory.steps;

export function useLstmMemory() {
  const [step, setStep] = useState(0);
  return {
    step,
    current: steps[step],
    total: steps.length,
    canPrevious: step > 0,
    canNext: step < steps.length - 1,
    previous: () => setStep((value) => Math.max(0, value - 1)),
    next: () => setStep((value) => Math.min(steps.length - 1, value + 1)),
  };
}
