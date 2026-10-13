import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import copy from "@/i18n/es.json";

export function PreparationScreen() {
  const t = copy.preparation;
  return <section className="metrics-page preparation-page" aria-labelledby="preparation-title">
    <header className="preparation-heading"><h1 id="preparation-title">{t.title}</h1><p>{t.intro}</p></header>
    <Card>
      <CardHeader><CardTitle><h2>{t.commonTitle}</h2></CardTitle><CardDescription>{t.commonDescription}</CardDescription></CardHeader>
      <CardContent>
        <ol className="preparation-flow">{t.steps.map((step, i) => <li key={step.title}>
          <div className="preparation-step-marker"><span>{String(i + 1).padStart(2, "0")}</span>{i < t.steps.length - 1 && <ArrowRight aria-hidden="true" />}</div>
          <h3>{step.title}</h3><p>{step.description}</p>
        </li>)}</ol>
      </CardContent>
    </Card>
    <section aria-labelledby="preparation-models" className="preparation-models">
      <header className="preparation-section-heading"><h2 id="preparation-models">{t.branchesTitle}</h2><p>{t.branchesDescription}</p></header>
      <div className="preparation-branches">{t.branches.map(branch => <Card key={branch.title}>
        <CardHeader><CardTitle><h3>{branch.title}</h3></CardTitle><CardDescription>{branch.description}</CardDescription></CardHeader>
        <CardContent><ol className="preparation-route">{branch.steps.map(step => <li key={step}>{step}</li>)}</ol><p className="preparation-reason">{branch.reason}</p></CardContent>
      </Card>)}</div>
    </section>
    <Card>
      <CardHeader><CardTitle><h2>{t.externalTitle}</h2></CardTitle><CardDescription>{t.externalDescription}</CardDescription></CardHeader>
      <CardContent><ol className="preparation-external">{t.externalSteps.map((step, i) => <li key={step}><span>{step}</span>{i < t.externalSteps.length - 1 && <ArrowRight aria-hidden="true" />}</li>)}</ol><p className="preparation-reason">{t.externalNote}</p></CardContent>
    </Card>
  </section>;
}
