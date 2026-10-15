import { Card, CardContent } from "@/components/ui/card";
import copy from "@/i18n/es.json";

const t = copy.dataTargets.objectives;

export function ObjectivesSection() {
  return <section className="dt-section" aria-labelledby="dt-objectives">
    <header><h2 id="dt-objectives">{t.title}</h2></header>
    <div className="dt-objectives">
      <Card className="dt-card"><CardContent className="dt-stack"><h3>{t.generalTitle}</h3><p className="dt-general">{t.general}</p></CardContent></Card>
      <Card className="dt-card"><CardContent className="dt-stack"><h3>{t.specificTitle}</h3>
        <ol>{t.specific.map((item, i) => <li key={item}><span className="dt-step">{i + 1}</span><span>{item}</span></li>)}</ol>
      </CardContent></Card>
    </div>
  </section>;
}
