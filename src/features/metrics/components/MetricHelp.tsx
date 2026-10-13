"use client";
import { Popover } from "@base-ui/react/popover";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import copy from "@/i18n/es.json";
export function MetricHelp({ kind }: { kind:keyof typeof copy.metrics.help | "reference" | "predictors" | "spearman" | "direction" }) {
  const t=copy.metrics;
  const explanation=kind === "reference" ? t.r2Finding.help : kind === "predictors" ? t.predictorFinding.help : kind === "spearman" ? t.spearmanFinding.help : kind === "direction" ? t.signFinding.help : t.help[kind];
  return <Popover.Root><Popover.Trigger openOnHover delay={200} render={<Button variant="ghost" size="icon" />} aria-label={t.why}><Info /></Popover.Trigger><Popover.Portal><Popover.Positioner side="bottom" align="end" sideOffset={8}><Popover.Popup className="chart-help"><div className="chart-help-heading"><Popover.Title>{t.why}</Popover.Title><Popover.Close render={<Button variant="ghost" size="icon-sm" />} aria-label={t.close}><X /></Popover.Close></div><Popover.Description render={<div />}><p>{explanation}</p><small>{t.basis}</small></Popover.Description></Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>;
}
