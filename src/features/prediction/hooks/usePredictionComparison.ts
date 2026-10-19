"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ApiError } from "@/lib/api/apiClient";
import copy from "@/i18n/es.json";
import { predict } from "../prediction-api";
import { fillCopy } from "../comparison-formatting";
import { comparisonFamilies, type ComparisonOptions, type ComparisonRow } from "../types/comparison";
import type { TargetId } from "../types/prediction";

gsap.registerPlugin(useGSAP);

function emptyRows(status: "idle" | "loading"): ComparisonRow[] {
  return comparisonFamilies.map((family) => ({ family, status }));
}

export function usePredictionComparison(options: ComparisonOptions, onTargetChange?: (target: TargetId) => void) {
  const containerRef = useRef<HTMLElement>(null);
  const dateTriggerRef = useRef<HTMLButtonElement>(null);
  const active = useRef<{ id: number; controller?: AbortController }>({ id: 0 });
  const [target, setTarget] = useState<TargetId>(options.targets[0].target);
  const [dateId, setDateId] = useState(String(Math.min(options.maxDateId, Math.max(options.minDateId, 1900))));
  const [dateError, setDateError] = useState<string>();
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [dateSearch, setDateSearch] = useState("");
  const dateOptions = useMemo(() => Array.from(
    { length: options.maxDateId - options.minDateId + 1 }, (_, index) => String(options.minDateId + index),
  ), [options.minDateId, options.maxDateId]);
  const filteredDates = useMemo(() => dateOptions.filter((id) => id.includes(dateSearch.trim())), [dateOptions, dateSearch]);
  const [rows, setRows] = useState<ComparisonRow[]>(emptyRows("idle"));
  const [isLoading, setIsLoading] = useState(false);
  const selectedTarget = options.targets.find((entry) => entry.target === target)!;
  const hasComparison = rows.some((row) => row.status !== "idle");

  useEffect(() => () => {
    active.current.id++;
    active.current.controller?.abort();
  }, []);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo("[data-comparison-intro]", { opacity: 0.7, y: 6 }, {
        opacity: 1, y: 0, duration: 0.25, ease: "power2.out", clearProps: "opacity,transform",
      });
    });
    return () => media.revert();
  }, { scope: containerRef });

  useGSAP(() => {
    if (isLoading || !hasComparison) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo("[data-comparison-results]", { opacity: 0.75, y: 4 }, {
        opacity: 1, y: 0, duration: 0.22, ease: "power2.out", clearProps: "opacity,transform",
      });
    });
    return () => media.revert();
  }, { scope: containerRef, dependencies: [isLoading, hasComparison], revertOnUpdate: true });

  function invalidate() {
    active.current.id++;
    active.current.controller?.abort();
    setRows(emptyRows("idle"));
    setIsLoading(false);
    setDateError(undefined);
  }

  function changeTarget(value: string | null) {
    const entry = options.targets.find((item) => item.target === value);
    if (!entry) return;
    invalidate();
    setTarget(entry.target);
    onTargetChange?.(entry.target);
  }

  function changeDateId(value: string | null) {
    if (value === null || !dateOptions.includes(value)) return;
    if (value !== dateId) invalidate();
    setDateId(value);
    setDateMenuOpen(false);
    setDateSearch("");
  }

  function changeDateMenuOpen(open: boolean) {
    setDateMenuOpen(open);
    setDateSearch("");
  }

  async function compare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    const parsedDate = Number(dateId);
    if (!/^\d+$/.test(dateId.trim()) || !Number.isSafeInteger(parsedDate)
      || parsedDate < options.minDateId || parsedDate > options.maxDateId) {
      setDateError(fillCopy(copy.prediction.rangeError, { min: options.minDateId, max: options.maxDateId }));
      dateTriggerRef.current?.focus();
      return;
    }

    const id = ++active.current.id;
    const controller = new AbortController();
    active.current.controller?.abort();
    active.current.controller = controller;
    setDateError(undefined);
    setRows(emptyRows("loading"));
    setIsLoading(true);

    await Promise.all(comparisonFamilies.map(async (family) => {
      let row: ComparisonRow;
      try {
        const result = await predict({ family, target, dateId: parsedDate }, selectedTarget.lag, controller.signal);
        row = { family, status: "success", result };
      } catch (error) {
        row = { family, status: "error", code: error instanceof ApiError ? error.code : "network_error" };
      }
      if (active.current.id !== id || controller.signal.aborted) return;
      setRows((previous) => previous.map((item) => item.family === family ? row : item));
    }));
    if (active.current.id === id && !controller.signal.aborted) setIsLoading(false);
  }

  return {
    containerRef, dateTriggerRef, target, dateId, dateError, selectedTarget, rows,
    dateOptions, filteredDates, dateMenuOpen, dateSearch, changeDateMenuOpen, changeDateSearch: setDateSearch,
    isLoading, changeTarget, changeDateId, compare,
    hasComparison,
    completedCount: rows.filter((row) => row.status === "success" || row.status === "error").length,
  };
}
