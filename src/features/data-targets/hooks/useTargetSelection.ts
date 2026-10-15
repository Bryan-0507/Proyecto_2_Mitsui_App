"use client";

import { useState } from "react";
import type { TargetId } from "../data";

export function useTargetSelection(initial: TargetId) {
  const [selected, setSelected] = useState<TargetId>(initial);
  return { selected, select: setSelected };
}
