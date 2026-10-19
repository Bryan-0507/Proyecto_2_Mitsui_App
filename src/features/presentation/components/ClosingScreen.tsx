import { ArrowUpRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import copy from "@/i18n/es.json";
import { PresentationHeading } from "./PresentationHeading";

export function ClosingScreen() {
  const t = copy.presentation.closing;
  return <section className="eda-screen presentation-screen presentation-closing">
    <PresentationHeading title={t.title} intro={t.intro} />
    <section className="presentation-conclusion"><h2 className="presentation-label">{t.conclusionTitle}</h2><p>{t.conclusion}</p></section>
    <dl className="presentation-evidence" aria-label={t.evidenceTitle}>{t.evidence.map(item => <div key={item.value}>
      <dt>{item.label}</dt><dd className="presentation-evidence-value">{item.value}</dd><dd>{item.detail}</dd>
    </div>)}</dl>
    <Separator />
    <section><h2>{t.futureTitle}</h2><div className="presentation-future">{t.future.map(item => <article key={item.title}>
      <ArrowUpRight aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.text}</p></div>
    </article>)}</div><p className="presentation-source">{t.futureNote}</p></section>
  </section>;
}
