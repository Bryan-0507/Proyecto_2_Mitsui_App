import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import copy from "@/i18n/es.json";

const t = copy.models;

export function ModelLayout({ name, why, how, config, visual, children }: { name: string; why: ReactNode; how: ReactNode; config: ReactNode; visual: ReactNode; children?: ReactNode }) {
  return <div className="models-grid">
    <Card className="models-card"><CardHeader><CardTitle><h2>{name}</h2></CardTitle></CardHeader>
      <CardContent className="models-text">
        <section><h3>{t.whyTitle}</h3>{why}</section>
        <section><h3>{t.howTitle}</h3>{how}</section>
        {children}
        <section><h3>{t.configTitle}</h3>{config}</section>
      </CardContent></Card>
    <Card className="models-card models-visual"><CardHeader><CardTitle><h3>{t.visualTitle}</h3></CardTitle></CardHeader>
      <CardContent className="models-visual-content">{visual}</CardContent></Card>
  </div>;
}

export function MoreDetail({ children }: { children: ReactNode }) {
  return <details className="models-details"><summary>{t.moreDetail}</summary><div>{children}</div></details>;
}
