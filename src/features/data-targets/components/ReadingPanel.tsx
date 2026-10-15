import { ArrowDown, ArrowUp, Equal, Minus } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { signTone } from "@/features/shared/sign";
import copy from "@/i18n/es.json";

const t = copy.dataTargets.reading;
const readIcons = [ArrowUp, ArrowDown, Equal];
const readTones = ["positive", "negative", "neutral"] as const;

export function ReadingPanel() {
  return <div className="dt-reading-layout">
      <section className="dt-stack dt-reading-meaning">
        <h2>{t.meaningTitle}</h2>
        <div className="dt-equation" role="img" aria-label={`${t.equation.a} ${t.equation.minus} ${t.equation.b} ${t.equation.equals} ${t.equation.result}`}>
          <span>{t.equation.a}</span><Minus aria-hidden="true" /><span>{t.equation.b}</span><Equal aria-hidden="true" /><span className="dt-equation-result">{t.equation.result}</span>
        </div>
        <p className="dt-muted">{t.equationNote}</p>
        <ul className="dt-reads">{t.reads.map((read, i) => { const Icon = readIcons[i]; return <li key={read.title} data-tone={readTones[i]}><Icon aria-hidden="true" /><div><h3>{read.title}</h3><p>{read.description}</p></div></li>; })}</ul>
      </section>
      <section className="dt-stack dt-reading-example">
        <h2>{t.exampleTitle}</h2>
        <p className="dt-table-scroll-hint">{t.tableHint}</p>
        <Table><TableCaption>{t.exampleCaption}</TableCaption>
          <TableHeader><TableRow>{Object.values(t.exampleColumns).map((label) => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader>
          <TableBody>{t.exampleRows.map((row) => <TableRow key={row[0]}>{row.map((cell, i) => <TableCell key={i} data-tone={signTone(cell)}>{cell}</TableCell>)}</TableRow>)}</TableBody></Table>
        <p>{t.exampleNote}</p>
      </section>
  </div>;
}
