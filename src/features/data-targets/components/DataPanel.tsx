import { ArrowRight, Database, FileText, Info, Tag, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import copy from "@/i18n/es.json";

const t = copy.dataTargets.data;
const icons: Record<string, LucideIcon> = { predictors: Database, labels: Tag, metadata: FileText, kaggle: Trophy };

export function DataPanel() {
  return <div className="dt-two">
    <section className="dt-block" aria-labelledby="dt-files">
      <h2 id="dt-files">{t.filesTitle}</h2>
      <ul className="dt-files">{t.files.map((file) => {
        const Icon = icons[file.kind];
        return <li key={file.name} data-kind={file.kind}><Card className="dt-card"><CardContent className="dt-file">
          <div className="dt-file-head"><span className="dt-icon"><Icon aria-hidden="true" /></span><div><p className="dt-mono">{file.name}</p><p className="dt-role">{file.role}</p></div></div>
          <p>{file.content}</p>
          <p className="dt-stat"><strong>{file.stat}</strong><span>{file.statLabel}</span></p>
        </CardContent></Card></li>;
      })}</ul>
      <p className="dt-info"><Info aria-hidden="true" />{t.idNote}</p>
    </section>
    <section className="dt-block" aria-labelledby="dt-funnel">
      <h2 id="dt-funnel">{t.funnelTitle}</h2>
      <Card className="dt-card dt-fill"><CardContent className="dt-stack">
        <ol className="dt-funnel">{t.stages.map((stage, i) => <li key={stage.value}>
          <strong>{stage.value}</strong><span>{stage.label}</span>
          {i < t.stages.length - 1 && <ArrowRight className="dt-funnel-arrow" aria-hidden="true" />}
        </li>)}</ol>
        <p className="dt-muted">{t.stageNote}</p>
        <h3>{t.familiesTitle}</h3>
        <dl className="dt-families">{t.families.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
      </CardContent></Card>
    </section>
  </div>;
}
