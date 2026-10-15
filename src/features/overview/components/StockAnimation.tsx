"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import copy from "@/i18n/es.json";
import { useStockAnimation } from "../hooks/useStockAnimation";

const t = copy.overview;

export function StockAnimation() {
  const { containerRef, isPlaying, isReady, hasError, reducedMotion, toggle } = useStockAnimation();
  const action = isPlaying ? t.animationPause : t.animationPlay;
  return <figure className="ov-visual" aria-label={t.animationLabel}>
    <div className="ov-animation-canvas" ref={containerRef} aria-hidden="true" />
    {hasError && <p className="ov-animation-error">{t.animationError}</p>}
    {isReady && !reducedMotion && !hasError && <Button className="ov-animation-control" variant="ghost" size="icon" onClick={toggle} aria-label={action} title={action}>
      {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
    </Button>}
  </figure>;
}
