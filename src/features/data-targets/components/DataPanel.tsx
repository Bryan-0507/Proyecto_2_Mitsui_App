import { Info } from "lucide-react";
import copy from "@/i18n/es.json";

const t = copy.dataTargets.data;
const scope = copy.overview;

export function DataPanel() {
  return <div className="dt-data-layout">
    <section className="dt-block" aria-labelledby="dt-files">
      <h2 id="dt-files">{t.filesTitle}</h2>
      <ul className="dt-file-list">{t.files.map((file) => <li key={file.name}>
        <div><h3>{file.name}</h3><p className="dt-muted">{file.role}</p></div>
        <p>{file.content}</p>
        <p className="dt-file-size">{file.stat}<span>{file.statLabel}</span></p>
      </li>)}</ul>
      <p className="dt-info"><Info aria-hidden="true" />{t.idNote}</p>
    </section>
    <section className="dt-block dt-scope" aria-labelledby="dt-scope">
      <h2 id="dt-scope">{scope.scopeTitle}</h2>
      <p>{scope.scopeText}</p>
      <ul className="dt-market-list">{scope.markets.map((market) => <li key={market.name}>{market.name}</li>)}</ul>
      <p className="dt-muted">{scope.scopeNote}</p>
    </section>
  </div>;
}
