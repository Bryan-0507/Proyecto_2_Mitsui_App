import { Brain, Filter, ListOrdered, Network, Target } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import copy from "@/i18n/es.json";
import { ModelFlow } from "./ModelFlow";

const x = copy.models.externalSection, t = copy.models;

export function ExternalModel() {
  return <section className="models-external" aria-labelledby="models-external-title">
    <header><h2 id="models-external-title">{x.title}</h2></header>
    <div className="models-grid">
      <Card className="models-card models-card-external"><CardHeader><CardTitle><h3>{x.model}</h3></CardTitle></CardHeader>
        <CardContent className="models-text">
          <p className="models-provenance">{x.provenance}</p>
          <section><h3>{t.whyTitle}</h3><p>{x.why}</p></section>
          <section><h3>{t.howTitle}</h3><p>{x.how}</p><p>{x.ensemble}</p></section>
          <p><a href={x.sourceHref} target="_blank" rel="noopener noreferrer">{x.sourceLabel}<ExternalLink aria-hidden="true" /><span className="sr-only"> (se abre en una pestaña nueva)</span></a></p>
          <p className="models-note">{x.attribution}</p>
        </CardContent></Card>
      <Card className="models-card models-card-external models-visual"><CardHeader><CardTitle><h3>{t.visualTitle}</h3></CardTitle></CardHeader>
        <CardContent className="models-visual-content"><ModelFlow label={x.flowLabel} steps={x.flow} icons={[ListOrdered, Brain, Filter, Network, Target]} /></CardContent></Card>
    </div>
  </section>;
}
