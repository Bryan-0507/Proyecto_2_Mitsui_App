"use client";

import type { ReactNode } from "react";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./AppSidebar";
import { useAppShell } from "../hooks/useAppShell";
import copy from "@/i18n/es.json";

export function AppShell({ children }: { children: ReactNode }) {
  const { containerRef, activeItem } = useAppShell();

  return (
    <div ref={containerRef} className="app-shell">
      <a className="skip-link" href="#main-content">{copy.shell.skip}</a>
      <TooltipProvider delay={150}>
        <SidebarProvider className="shell-provider">
          <AppSidebar activeId={activeItem.id} />
          <SidebarInset className="shell-inset">
            <header className="workspace-header">
              <div className="workspace-location" data-shell-motion>
                <SidebarTrigger aria-label={copy.shell.toggle} />
                <Breadcrumb aria-label={copy.shell.navigation}>
                  <BreadcrumbList>
                    <BreadcrumbItem className="project-crumb">{copy.brand.name}</BreadcrumbItem>
                    <BreadcrumbSeparator className="project-crumb" />
                    <BreadcrumbItem><BreadcrumbPage>{activeItem.label}</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div id="main-content" tabIndex={-1} className="workspace-content">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}


