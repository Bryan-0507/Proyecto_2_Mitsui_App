import { ListChecks, Scale, Sigma, Target } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import copy from "@/i18n/es.json";
import { signTone } from "@/features/shared/sign";
import { ModelFlow } from "./ModelFlow";
import { ModelLayout, MoreDetail } from "./ModelLayout";

const t = copy.models, l = t.linear;

export function LinearPanel() {
  return <ModelLayout name={l.name} why={<p>{l.why}</p>} how={<p>{l.how}</p>}
    config={<>
      <Table><TableCaption>{l.configCaption}</TableCaption>
        <TableHeader><TableRow><TableHead>{t.target}</TableHead><TableHead>{l.predictors}</TableHead></TableRow></TableHeader>
        <TableBody>{l.config.map(([target, count]) => <TableRow key={target}><TableCell>{target}</TableCell><TableCell>{count}</TableCell></TableRow>)}</TableBody></Table>
      <MoreDetail><p>{l.detail}</p></MoreDetail></>}
    visual={<>
      <ModelFlow label={l.flowLabel} steps={l.flow} icons={[ListChecks, Scale, Sigma, Target]} />
      <section className="models-example"><h4>{l.exampleTitle}</h4><p>{l.exampleNote}</p>
        <Table><TableCaption>{l.exampleCaption}</TableCaption>
          <TableHeader><TableRow><TableHead>Predictor</TableHead><TableHead>{t.valueLabel}</TableHead><TableHead>{t.weightLabel}</TableHead><TableHead>{t.contributionLabel}</TableHead></TableRow></TableHeader>
          <TableBody>
            {l.exampleRows.map((row) => <TableRow key={row[0]}>{row.map((cell, i) => <TableCell key={i} data-tone={signTone(cell)}>{cell}</TableCell>)}</TableRow>)}
            <TableRow><TableCell>{l.constant}</TableCell><TableCell>{t.notApplicable}</TableCell><TableCell>{t.notApplicable}</TableCell><TableCell>{l.constantContribution}</TableCell></TableRow>
            <TableRow className="models-total"><TableCell>{l.prediction}</TableCell><TableCell>{t.notApplicable}</TableCell><TableCell>{t.notApplicable}</TableCell><TableCell>{l.predictionValue}</TableCell></TableRow>
          </TableBody></Table></section></>} />;
}
