import { CircleCheck, Flag, Hourglass, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import copy from "@/i18n/es.json";
import { targetPairs } from "../data";

const t = copy.dataTargets.lag;

export function LagSection() {
  const last = t.ids.length - 1;
  return <section className="dt-section" aria-labelledby="dt-lag">
    <header><h2 id="dt-lag">{t.title}</h2><p>{t.intro}</p></header>
    <div className="dt-two">
      <div className="dt-copy"><p>{t.single}</p><p>{t.known}</p>
        <h3>{t.ours}</h3>
        <ul className="dt-lags">{Object.entries(targetPairs).map(([id, { lag }]) => <li key={id}><span>{id}</span><span>{copy.dataTargets.targets.lag} {lag}</span></li>)}</ul></div>
      <Card className="dt-card"><CardContent className="dt-stack">
        <h3>{t.timelineTitle}</h3>
        <ol className="dt-timeline" aria-label={t.timelineLabel}>{t.ids.map((id, i) => {
          const Icon = i === 0 ? LogIn : i === 1 ? Flag : i === last ? CircleCheck : Hourglass;
          return <li key={id} data-kind={i === 0 ? "entry" : i === 1 || i === last ? "edge" : "wait"}>
            <Icon aria-hidden="true" /><span className="dt-id">{t.rowLabel} {id}</span><span>{t.stages[i]}</span>
          </li>;
        })}</ol>
        <p className="dt-note">{t.timelineNote}</p>
      </CardContent></Card>
    </div>
  </section>;
}
