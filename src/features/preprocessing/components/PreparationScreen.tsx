import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import copy from "@/i18n/es.json";
import "../preparation.css";
import { BaseSteps } from "./BaseSteps";
import { ModelRoutes } from "./ModelRoutes";

export function PreparationScreen() {
  const t = copy.preparation;
  return <section className="metrics-page preparation-page" aria-labelledby="preparation-title">
    <header className="preparation-heading"><h1 id="preparation-title">{t.title}</h1><p>{t.intro}</p></header>
    <Card className="pr-card">
      <CardHeader><CardTitle><h2>{t.commonTitle}</h2></CardTitle><CardDescription>{t.commonDescription}</CardDescription></CardHeader>
      <CardContent><BaseSteps /></CardContent>
    </Card>
    <section aria-labelledby="preparation-models" className="preparation-models">
      <header className="preparation-section-heading"><h2 id="preparation-models">{t.branchesTitle}</h2><p>{t.branchesDescription}</p></header>
      <ModelRoutes />
    </section>
  </section>;
}
