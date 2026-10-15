import { ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import copy from "@/i18n/es.json";
import { targetPairs, type TargetId } from "../data";

const t = copy.dataTargets.targets;

function Instrument({ label, item }: { label: string; item: { name: string; kind: string; description: string } }) {
  return <div className="dt-instrument">
    <p className="dt-instrument-label">{label}</p>
    <h4>{item.name}</h4>
    <Badge variant="secondary">{item.kind}</Badge>
    <p>{item.description}</p>
  </div>;
}

export function TargetsSection() {
  return <section className="dt-section" aria-labelledby="dt-targets">
    <header><h2 id="dt-targets">{t.title}</h2><p>{t.intro}</p></header>
    <ul className="dt-targets">{t.cards.map((card) => {
      const meta = targetPairs[card.id as TargetId];
      return <li key={card.id}><Card className="dt-card">
        <CardHeader>
          <div className="dt-target-head"><Badge>{card.id}</Badge><Badge variant="outline">{t.lag} {meta.lag}</Badge></div>
          <CardTitle><h3>{card.title}</h3></CardTitle>
          <p className="dt-market">{t.market}: {card.market}</p>
        </CardHeader>
        <CardContent>
          <div className="dt-pair">
            <Instrument label={t.a} item={card.a} />
            <span className="dt-versus"><ArrowLeftRight aria-hidden="true" /><span className="sr-only">{t.against}</span></span>
            <Instrument label={t.b} item={card.b} />
          </div>
          <p className="dt-code"><span>{t.datasetName}</span> {meta.pair}</p>
        </CardContent>
      </Card></li>;
    })}</ul>
    <p className="dt-note">{t.crossNote}</p>
  </section>;
}
