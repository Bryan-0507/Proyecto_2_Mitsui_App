import { ListChecks, Scale, Sigma, Target } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import copy from "@/i18n/es.json";
import { ModelFlow } from "./ModelFlow";
import { ModelLayout } from "./ModelLayout";

const t = copy.models, l = t.linear;

export function LinearPanel() {
  return <ModelLayout name={l.name} why={<p>{l.why}</p>} how={<p>{l.how}</p>}
    config={<>
      <Table><TableCaption>{l.configCaption}</TableCaption>
        <TableHeader><TableRow><TableHead>{t.target}</TableHead><TableHead>{l.predictors}</TableHead></TableRow></TableHeader>
        <TableBody>{l.config.map(([target, count]) => <TableRow key={target}><TableCell>{target}</TableCell><TableCell>{count}</TableCell></TableRow>)}</TableBody></Table>
      <p className="models-note">{l.detail}</p></>}
    visual={<ModelFlow label={l.flowLabel} steps={l.flow} icons={[ListChecks, Scale, Sigma, Target]} />} />;
}
