"use client";
import { useState } from "react";
import { useModelsTabs } from "@/features/models/hooks/useModelsTabs";

export function useSolution() {
  const [tab, setTab] = useState("architecture");
  const models = useModelsTabs();
  function changeTab(value: unknown) {
    if (value === "architecture" || value === "models") setTab(value);
  }
  return { tab, changeTab, ...models };
}
