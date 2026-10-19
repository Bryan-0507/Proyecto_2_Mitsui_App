"use client";
import { useResultsTabs } from "@/features/metrics/hooks/useResultsTabs";

export function useLearnings() {
  const { finding, changeFinding } = useResultsTabs();
  return { finding, changeFinding };
}
