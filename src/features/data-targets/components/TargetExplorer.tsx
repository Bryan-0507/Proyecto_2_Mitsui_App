"use client";

import { ArrowLeftRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import copy from "@/i18n/es.json";
import { targetPairs, type TargetId } from "../data";
import { useTargetSelection } from "../hooks/useTargetSelection";

const t = copy.dataTargets.targets;
type Instrument = { name: string; kind: string; description: string };

function InstrumentBlock({ label, item }: { label: string; item: Instrument }) {
  return <div className="dt-instrument">
    <p className="dt-muted">{label}</p>
    <h4>{item.name}</h4>
    <p className="dt-role">{item.kind}</p>
    <p>{item.description}</p>
  </div>;
}

export function TargetExplorer() {
  const view = useTargetSelection("target_225");
  const card = t.cards.find((item) => item.id === view.selected)!;
  const meta = targetPairs[view.selected];
  return <div className="dt-explorer">
    <div className="dt-target-list" role="radiogroup" aria-label={t.listLabel}>
      {t.cards.map((item) => {
        const active = item.id === view.selected;
        return <button key={item.id} type="button" role="radio" aria-checked={active} className="dt-target-option"
          onClick={() => view.select(item.id as TargetId)}>
          <span className="dt-mono">{item.id}</span>
          <span className="dt-option-title">{item.title}</span>
          <span className="dt-muted">{t.lag} {targetPairs[item.id as TargetId].lag}, {item.market}</span>
        </button>;
      })}
    </div>
    <Card className="dt-card dt-fill" aria-live="polite"><CardContent className="dt-stack">
      <div>
        <p className="dt-mono dt-muted">{card.id}</p>
        <h3 className="dt-detail-title">{card.title}</h3>
      </div>
      <div className="dt-pair">
        <InstrumentBlock label={t.a} item={card.a} />
        <span className="dt-versus"><ArrowLeftRight aria-hidden="true" /><span className="sr-only">{t.against}</span></span>
        <InstrumentBlock label={t.b} item={card.b} />
      </div>
      <dl className="dt-facts">
        <div><dt>{t.lag}</dt><dd>{meta.lag}</dd></div>
        <div><dt>{t.market}</dt><dd>{card.market}</dd></div>
        <div className="dt-fact-wide"><dt>{t.datasetName}</dt><dd className="dt-mono">{meta.pair}</dd></div>
      </dl>
    </CardContent></Card>
  </div>;
}
