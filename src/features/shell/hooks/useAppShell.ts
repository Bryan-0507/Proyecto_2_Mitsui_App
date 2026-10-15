"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { navigationGroups } from "@/features/shared/navigation";

gsap.registerPlugin(useGSAP);

export function useAppShell() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const steps = navigationGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })));
  const index = Math.max(0, steps.findIndex((item) => item.href === pathname));
  const activeItem = steps[index];

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo("[data-shell-motion]", { opacity: 0.75, y: 6 }, {
        opacity: 1, y: 0, duration: 0.28, ease: "power2.out", clearProps: "opacity,transform",
      });
    });
    return () => media.revert();
  }, { scope: containerRef, dependencies: [pathname], revertOnUpdate: true });

  return { containerRef, activeItem, index, total: steps.length, previous: steps[index - 1], next: steps[index + 1] };
}

