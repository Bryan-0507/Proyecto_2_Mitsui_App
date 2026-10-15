import { ExternalLink } from "lucide-react";
import copy from "@/i18n/es.json";
import { LstmMemory } from "./LstmMemory";
import { ModelLayout } from "./ModelLayout";

const x = copy.models.externalSection;

export function ExternalModel() {
  return <ModelLayout name={x.model} configLabel={x.detailsTitle}
    why={<><p>{x.why}</p><p className="models-note">{x.provenance}</p></>}
    how={<p>{x.how}</p>}
    config={<><p>{x.ensemble}</p><p><a href={x.sourceHref} target="_blank" rel="noopener noreferrer">{x.sourceLabel}<ExternalLink aria-hidden="true" /><span className="sr-only"> (se abre en una pestaña nueva)</span></a></p>
      <p>{x.referencesNote}</p><ul className="models-links">{x.references.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label}<ExternalLink aria-hidden="true" /><span className="sr-only"> (se abre en una pestaña nueva)</span></a></li>)}</ul>
      <p className="models-note">{x.attribution}</p></>}
    visual={<LstmMemory />} />;
}
