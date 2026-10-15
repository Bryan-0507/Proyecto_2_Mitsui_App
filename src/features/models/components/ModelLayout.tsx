import type { ReactNode } from "react";
import copy from "@/i18n/es.json";

const t = copy.models;

export function ModelLayout({ name, why, how, config, visual, children, configLabel = t.configTitle }: { name: string; why: ReactNode; how: ReactNode; config: ReactNode; visual: ReactNode; children?: ReactNode; configLabel?: string }) {
  return <div className="models-grid">
    <section className="models-narrative"><h2>{name}</h2>
      <div className="models-text">
        <section><h3>{t.whyTitle}</h3>{why}</section>
        <section><h3>{t.howTitle}</h3>{how}</section>
        {children}
        <details className="models-details models-configuration"><summary>{configLabel}</summary><div>{config}</div></details>
      </div></section>
    <section className="models-demonstration"><h3>{t.visualTitle}</h3>
      <div className="models-visual-content">{visual}</div></section>
  </div>;
}

export function MoreDetail({ children, label = t.moreDetail }: { children: ReactNode; label?: string }) {
  return <details className="models-details"><summary>{label}</summary><div>{children}</div></details>;
}
