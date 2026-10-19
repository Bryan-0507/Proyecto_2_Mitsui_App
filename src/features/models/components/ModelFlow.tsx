import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function ModelFlow({ label, steps, icons, headingLevel = 4 }: { label: string; steps: readonly { title: string; description: string }[]; icons: LucideIcon[]; headingLevel?:3|4 }) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  return <ol className="models-flow" aria-label={label} style={{ "--steps": steps.length } as React.CSSProperties}>
    {steps.map((step, i) => {
      const Icon = icons[i];
      return <li key={step.title}>
        <div className="models-flow-head"><Icon aria-hidden="true" /><span>{i + 1}</span>{i < steps.length - 1 && <ArrowRight className="models-flow-arrow" aria-hidden="true" />}</div>
        <Heading>{step.title}</Heading><p>{step.description}</p>
      </li>;
    })}
  </ol>;
}
