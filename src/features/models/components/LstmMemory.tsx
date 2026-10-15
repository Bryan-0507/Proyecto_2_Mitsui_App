"use client";

import { ArrowDown, ArrowRight, Brain, ChevronLeft, ChevronRight, Filter, Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import copy from "@/i18n/es.json";
import { useLstmMemory } from "../hooks/useLstmMemory";

const t = copy.models.externalSection.memory;

export function LstmMemory() {
  const view = useLstmMemory();
  return <section className="lstm-walkthrough" aria-label={t.label}>
    <p className="models-note">{t.intro}</p>
    <div className="models-stepper">
      <Button variant="outline" onClick={view.previous} disabled={!view.canPrevious}><ChevronLeft aria-hidden="true" />{t.previous}</Button>
      <p>{view.step + 1} / {view.total}</p>
      <Button onClick={view.next} disabled={!view.canNext}>{t.next}<ChevronRight aria-hidden="true" /></Button>
    </div>
    <div className="lstm-memory-rail" aria-hidden="true"><span>{t.memoryRail}</span><ArrowRight /></div>
    <ol className="lstm-observations" aria-label={t.sequenceLabel}>
      {t.positions.map((position, i) => <li key={position} data-active={view.step === i} aria-current={view.step === i ? "step" : undefined}>
        <span className="lstm-position">{position}</span>
        <ArrowDown className="lstm-input-arrow" aria-hidden="true" />
        <div className="lstm-cell"><Brain aria-hidden="true" /><span>{t.cell}</span></div>
        {i < t.positions.length - 1 && <ArrowRight className="lstm-between" aria-hidden="true" />}
      </li>)}
    </ol>
    <div className="lstm-gates">
      <div data-active={view.step === 1}><Filter aria-hidden="true" /><span>{t.keep}</span></div>
      <div data-active={view.step === 1}><Plus aria-hidden="true" /><span>{t.update}</span></div>
    </div>
    <div className="lstm-output" data-active={view.step === 2}><Target aria-hidden="true" /><h4>{t.output}</h4></div>
    <div className="lstm-explanation" aria-live="polite" aria-atomic="true"><h4>{view.current.title}</h4><p>{view.current.description}</p></div>
    <p className="models-note">{t.scope}</p>
  </section>;
}
