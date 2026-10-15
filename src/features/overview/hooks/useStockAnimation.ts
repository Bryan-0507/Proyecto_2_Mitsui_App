"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";

export function useStockAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const pausedRef = useRef(false);
  const syncRef = useRef<(() => void) | null>(null);
  const [isPlaying, setPlaying] = useState(false);
  const [isReady, setReady] = useState(false);
  const [hasError, setError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    let ready = false;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      const animation = animationRef.current;
      if (!ready || !animation) return;
      setReducedMotion(media.matches);
      if (media.matches) {
        animation.goToAndStop(210, true);
        setPlaying(false);
      } else if (pausedRef.current || document.hidden) {
        animation.pause();
        setPlaying(false);
      } else {
        animation.play();
        setPlaying(true);
      }
    };
    syncRef.current = syncPlayback;
    media.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);

    void import("lottie-web").then(({ default: lottie }) => {
      if (disposed) return;
      const animation = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: true,
        autoplay: false,
        path: "/animations/stock-market.json",
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      animationRef.current = animation;
      animation.addEventListener("DOMLoaded", () => {
        if (disposed) return;
        ready = true;
        setReady(true);
        syncPlayback();
      });
      animation.addEventListener("data_failed", () => {
        if (!disposed) setError(true);
      });
    }).catch(() => {
      if (!disposed) setError(true);
    });

    return () => {
      disposed = true;
      media.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      syncRef.current = null;
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, []);

  return {
    containerRef, isPlaying, isReady, hasError, reducedMotion,
    toggle: () => {
      pausedRef.current = !pausedRef.current;
      syncRef.current?.();
    },
  };
}
