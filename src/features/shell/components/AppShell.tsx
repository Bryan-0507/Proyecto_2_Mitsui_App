"use client";

import type { ReactNode } from "react";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { useAppShell } from "../hooks/useAppShell";
import copy from "@/i18n/es.json";

export function AppShell({ children }: { children: ReactNode }) {
  const { containerRef, activeItem, index, total, previous, next } = useAppShell();
  const step = copy.shell.step.replace("{n}", String(index + 1)).replace("{total}", String(total));

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
                    <BreadcrumbItem className="project-crumb">{activeItem.group}</BreadcrumbItem>
                    <BreadcrumbSeparator className="project-crumb" />
                    <BreadcrumbItem><BreadcrumbPage>{activeItem.label}</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="workspace-progress">
                <span>{step}</span>
                <ol aria-hidden="true">{Array.from({ length: total }, (_, i) => <li key={i} data-state={i < index ? "done" : i === index ? "current" : "todo"} />)}</ol>
              </div>
            </header>
            <div id="main-content" tabIndex={-1} className="workspace-content">
              {children}
              <nav className="workspace-pager" aria-label={copy.shell.pager}>
                {previous ? <Link href={previous.href} className="pager-link"><ArrowLeft aria-hidden="true" /><span><small>{copy.shell.previous}</small>{previous.label}</span></Link> : <span />}
                {next && <Link href={next.href} className="pager-link pager-next"><span><small>{copy.shell.next}</small>{next.label}</span><ArrowRight aria-hidden="true" /></Link>}
              </nav>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}


