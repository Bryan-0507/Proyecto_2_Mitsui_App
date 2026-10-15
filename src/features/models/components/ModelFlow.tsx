import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function ModelFlow({ label, steps, icons }: { label: string; steps: readonly { title: string; description: string }[]; icons: LucideIcon[] }) {
  return <ol className="models-flow" aria-label={label} style={{ "--steps": steps.length } as React.CSSProperties}>
    {steps.map((step, i) => {
      const Icon = icons[i];
      return <li key={step.title}>
        <div className="models-flow-head"><Icon aria-hidden="true" /><span>{i + 1}</span>{i < steps.length - 1 && <ArrowRight className="models-flow-arrow" aria-hidden="true" />}</div>
        <h4>{step.title}</h4><p>{step.description}</p>
      </li>;
    })}
  </ol>;
}
