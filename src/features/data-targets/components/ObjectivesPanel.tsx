import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import copy from "@/i18n/es.json";

const t = copy.dataTargets.objectives;

export function ObjectivesPanel() {
  return <div className="dt-stack-lg">
    <Card className="dt-card dt-general"><CardContent className="dt-general-content">
      <span className="dt-icon dt-icon-lg"><Target aria-hidden="true" /></span>
      <div><h2>{t.generalTitle}</h2><p>{t.general}</p></div>
    </CardContent></Card>
    <section className="dt-block" aria-labelledby="dt-specific">
      <h2 id="dt-specific">{t.specificTitle}</h2>
      <ol className="dt-specific">{t.specific.map((item, i) => <li key={item}><Card className="dt-card dt-fill"><CardContent className="dt-specific-item">
        <span className="dt-number">{i + 1}</span><p>{item}</p>
      </CardContent></Card></li>)}</ol>
    </section>
  </div>;
}
