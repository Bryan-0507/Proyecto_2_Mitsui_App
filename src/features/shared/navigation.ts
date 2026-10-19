import type { Metadata } from "next";
import copy from "@/i18n/es.json";
import type { PageId } from "@/features/shared/types/navigation";

export const navigationGroups: {
  label: string;
  items: { id: PageId; href: string; label: string }[];
}[] = [
  {
    label: copy.presentation.cover,
    items: [
      { id: "overview", href: "/", label: copy.navigation.overview },
    ],
  },
  {
    label: copy.presentation.navigation,
    items: [
      { id: "problem", href: "/problem", label: copy.presentation.problem.title },
      { id: "solution", href: "/solution", label: copy.presentation.solution.title },
      { id: "demo", href: "/demo", label: copy.presentation.demo.title },
      { id: "learnings", href: "/learnings", label: copy.presentation.learnings.title },
      { id: "conclusions", href: "/conclusions", label: copy.presentation.closing.title },
    ],
  },
];

export function pageMetadata(id: PageId): Metadata {
  if (id === "problem" || id === "solution" || id === "demo" || id === "learnings" || id === "conclusions") {
    const section = copy.presentation[id === "conclusions" ? "closing" : id];
    return { title: section.title, description: section.intro };
  }
  return {
    title: id === "overview"
      ? { absolute: `${copy.pages[id].title} | ${copy.brand.name}` }
      : copy.pages[id].title,
    description: copy.pages[id].description,
  };
}

