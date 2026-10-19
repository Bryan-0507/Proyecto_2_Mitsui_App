"use client";
import { useState } from "react";
import type { TargetId } from "@/features/prediction/types/prediction";

export function useDemo() {
  const [tab, setTab] = useState("prediction");
  const [target, setTarget] = useState<TargetId>("target_225");
  function changeTab(value: unknown) {
    if (value === "prediction" || value === "metrics") setTab(value);
  }
  return { tab, target, changeTab, changeTarget: setTarget };
}
