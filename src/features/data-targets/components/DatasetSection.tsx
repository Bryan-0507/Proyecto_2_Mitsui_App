import { Database, FileText, Tag, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import copy from "@/i18n/es.json";

const t = copy.dataTargets.dataset;
const icons: Record<string, LucideIcon> = { predictors: Database, labels: Tag, metadata: FileText, kaggle: Trophy };

export function DatasetSection() {
  return <section className="dt-section" aria-labelledby="dt-dataset">
    <header><h2 id="dt-dataset">{t.title}</h2><p>{t.intro}</p></header>
    <Card className="dt-card"><CardContent>
      <Table className="dt-files"><TableCaption>{t.tableCaption}</TableCaption>
        <TableHeader><TableRow><TableHead>{t.columns.file}</TableHead><TableHead>{t.columns.kind}</TableHead><TableHead>{t.columns.content}</TableHead><TableHead>{t.columns.size}</TableHead></TableRow></TableHeader>
        <TableBody>{t.files.map((file) => {
          const Icon = icons[file.kind];
          return <TableRow key={file.name}>
            <TableCell className="dt-file">{file.name}</TableCell>
            <TableCell><Badge variant="outline" className="dt-kind"><Icon aria-hidden="true" />{t.kinds[file.kind as keyof typeof t.kinds]}</Badge></TableCell>
            <TableCell>{file.content}</TableCell>
            <TableCell>{file.size}</TableCell>
          </TableRow>;
        })}</TableBody></Table>
      <p className="dt-note">{t.idNote}</p>
    </CardContent></Card>
    <div className="dt-versions">
      <h3>{t.versionsTitle}</h3>
      <ol>{t.versions.map((version, i) => <li key={version.title}>
        <span className="dt-step">{i + 1}</span>
        <h4>{version.title}</h4>
        {version.figures.length > 0 && <dl>{version.figures.map(([value, label]) => <div key={label}><dd>{value}</dd><dt>{label}</dt></div>)}</dl>}
        <p>{version.description}</p>
      </li>)}</ol>
    </div>
  </section>;
}
