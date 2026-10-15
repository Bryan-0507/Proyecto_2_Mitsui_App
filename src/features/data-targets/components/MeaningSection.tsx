import { ArrowDown, ArrowRight, ArrowUp, Equal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import copy from "@/i18n/es.json";

const t = copy.dataTargets.meaning;
const readIcons = [ArrowUp, ArrowDown, Equal];

export function MeaningSection() {
  return <section className="dt-section" aria-labelledby="dt-meaning">
    <header><h2 id="dt-meaning">{t.title}</h2><p>{t.intro}</p></header>
    <div className="dt-two">
      <Card className="dt-card"><CardContent className="dt-stack">
        <ol className="dt-flow" aria-label={t.stepsLabel}>{t.steps.map((step, i) => <li key={step.title}>
          <div><span className="dt-step">{i + 1}</span>{i < t.steps.length - 1 && <ArrowRight className="dt-arrow" aria-hidden="true" />}</div>
          <h4>{step.title}</h4><p>{step.description}</p>
        </li>)}</ol>
        <div><h3>{t.readTitle}</h3>
          <ul className="dt-reads">{t.reads.map((read, i) => { const Icon = readIcons[i]; return <li key={read.title}><Icon aria-hidden="true" /><div><h4>{read.title}</h4><p>{read.description}</p></div></li>; })}</ul></div>
        <div className="dt-not"><h3>{t.notTitle}</h3><p>{t.not}</p></div>
      </CardContent></Card>
      <Card className="dt-card"><CardContent className="dt-stack">
        <h3>{t.exampleTitle}</h3>
        <Table><TableCaption>{t.exampleCaption}</TableCaption>
          <TableHeader><TableRow>{Object.values(t.exampleColumns).map((label) => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader>
          <TableBody>{t.exampleRows.map((row) => <TableRow key={row[0]}>{row.map((cell, i) => <TableCell key={i}>{cell}</TableCell>)}</TableRow>)}</TableBody></Table>
        <p>{t.exampleNote}</p>
        <p className="dt-note">{t.modelNote}</p>
        <details className="dt-details"><summary>{t.detailSummary}</summary><p>{t.detail}</p></details>
      </CardContent></Card>
    </div>
  </section>;
}
