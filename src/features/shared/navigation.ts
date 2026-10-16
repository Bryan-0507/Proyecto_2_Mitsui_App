import type { Metadata } from "next";
import copy from "@/i18n/es.json";
import type { PageId } from "@/features/shared/types/navigation";

export const navigationGroups: {
  label: string;
  items: { id: PageId; href: string; label: string }[];
}[] = [
  {
    label: copy.navigation.research,
    items: [
      { id: "overview", href: "/", label: copy.navigation.overview },
      { id: "dataTargets", href: "/data-targets", label: copy.navigation.dataTargets },
      { id: "eda", href: "/eda", label: copy.navigation.eda },
      { id: "preprocessing", href: "/preprocessing", label: copy.navigation.preprocessing },
      { id: "models", href: "/models", label: copy.navigation.models },
    ],
  },
  {
    label: copy.navigation.evaluation,
    items: [
      { id: "metrics", href: "/metrics", label: copy.navigation.results },
    ],
  },
  {
    label: copy.navigation.laboratory,
    items: [{ id: "prediction", href: "/prediction", label: copy.navigation.prediction }],
  },
  {
    label: copy.navigation.closing,
    items: [{ id: "conclusions", href: "/conclusions", label: copy.navigation.conclusions }],
  },
];

export function pageMetadata(id: PageId): Metadata {
  return {
    title: id === "overview"
      ? { absolute: `${copy.pages[id].title} | ${copy.brand.name}` }
      : copy.pages[id].title,
    description: copy.pages[id].description,
  };
}

