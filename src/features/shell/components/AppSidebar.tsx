"use client";

import Link from "next/link";
import {
  BarChart3, ChartNoAxesCombined, Database, Flag, FlaskConical, Layers3,
  LayoutDashboard, ListFilter, PanelLeftClose, ScanLine, Target, Workflow, Lightbulb, Play,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { navigationGroups } from "@/features/shared/navigation";
import type { PageId } from "@/features/shared/types/navigation";
import copy from "@/i18n/es.json";

const icons = {
  problem: Target, solution: Workflow, demo: Play, learnings: Lightbulb,
  overview: LayoutDashboard, dataTargets: Database, eda: ScanLine,
  preprocessing: ListFilter, models: Layers3, results: Target,
  metrics: BarChart3, prediction: FlaskConical, conclusions: Flag,
} satisfies Record<PageId, typeof Database>;

type Props = {
  activeId: PageId;
};

export function AppSidebar({ activeId }: Props) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar variant="sidebar" collapsible="icon" aria-label={copy.shell.navigation}
      mobileTitle={copy.shell.navigation} mobileDescription={copy.brand.subtitle}>
      <SidebarHeader>
        <Link href="/" className="brand-link" aria-label={copy.brand.name}
          onClick={() => setOpenMobile(false)}>
          <span className="brand-mark" aria-hidden="true"><ChartNoAxesCombined /></span>
          <span className="brand-copy">
            <span className="brand-name">{copy.brand.name}</span>
          </span>
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" aria-label={copy.shell.close}
            className="mobile-close" onClick={() => setOpenMobile(false)}>
            <PanelLeftClose data-icon="inline-start" />
          </Button>
        )}
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {navigationGroups.map((group, index) => (
          <SidebarGroup key={group.label}>
            {index > 0 && <SidebarSeparator className="group-divider" />}
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = icons[item.id];
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton size="lg" tooltip={item.label}
                        className="group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:px-[13px]!"
                        isActive={activeId === item.id}
                        render={<Link href={item.href} aria-label={item.label} aria-current={activeId === item.id ? "page" : undefined} />}
                        onClick={() => setOpenMobile(false)}>
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
