import { ChartNoAxesCombined, GitBranch, History } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import copy from "@/i18n/es.json";

const t = copy.conclusions;
const branchIcons = [ChartNoAxesCombined, History, GitBranch];

function ConclusionVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="conclusions-visual conclusions-branches" role="group" aria-label={t.visuals.selection.label}>
        <div className="conclusions-branch-line" aria-hidden="true" />
        {t.visuals.selection.branches.map((branch, i) => {
          const Icon = branchIcons[i];
          return (
            <div className="conclusions-branch" key={branch.name}>
              <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
              <span>{branch.name}</span>
              <small>{branch.role}</small>
            </div>
          );
        })}
      </div>
    );
  }

  if (index === 1) {
    return (
      <ol className="conclusions-visual conclusions-flow" aria-label={t.visuals.preparation.label}>
        {t.visuals.preparation.steps.map((step, i) => (
          <li key={step.name}>
            <span className="conclusions-flow-node" aria-hidden="true">{i + 1}</span>
            <div><span>{step.name}</span><small>{step.detail}</small></div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <figure className="conclusions-visual conclusions-performance">
      <div className="conclusions-signs" role="img" aria-label={t.visuals.performance.label}>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className={i === 11 ? "conclusions-sign-positive" : undefined} aria-hidden="true">
            {i === 11 ? "+" : "−"}
          </span>
        ))}
      </div>
      <figcaption>
        <span>{t.visuals.performance.caption}</span>
        <small>{t.visuals.performance.exception}</small>
        <small>{t.visuals.performance.value}</small>
      </figcaption>
    </figure>
  );
}

export function ConclusionsScreen() {
  return (
    <section className="eda-screen conclusions-screen" aria-labelledby="conclusions-title">
      <header className="eda-heading">
        <h1 id="conclusions-title">{t.title}</h1>
      </header>
      <section className="conclusions-general" aria-labelledby="conclusions-general-title">
        <h2 id="conclusions-general-title">{t.generalTitle}</h2>
        <p>{t.general}</p>
      </section>
      <Separator />
      <section aria-labelledby="conclusions-specific-title">
        <h2 id="conclusions-specific-title" className="sr-only">{t.specificTitle}</h2>
        <ol className="conclusions-specific">
          {t.specific.map((item, index) => (
            <li key={item.title}>
              <span className="conclusions-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <ConclusionVisual index={index} />
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
