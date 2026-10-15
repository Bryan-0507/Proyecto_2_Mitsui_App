import { ArrowDown, ArrowUp, CircleCheck, Equal, Flag, Hourglass, LogIn, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { signTone } from "@/features/shared/sign";
import copy from "@/i18n/es.json";

const t = copy.dataTargets.reading;
const readIcons = [ArrowUp, ArrowDown, Equal];
const readTones = ["positive", "negative", "neutral"] as const;

export function ReadingPanel() {
  const last = t.ids.length - 1;
  return <div className="dt-stack-lg">
    <div className="dt-two">
      <Card className="dt-card"><CardContent className="dt-stack">
        <h2>{t.meaningTitle}</h2>
        <div className="dt-equation" role="img" aria-label={`${t.equation.a} ${t.equation.minus} ${t.equation.b} ${t.equation.equals} ${t.equation.result}`}>
          <span>{t.equation.a}</span><Minus aria-hidden="true" /><span>{t.equation.b}</span><Equal aria-hidden="true" /><span className="dt-equation-result">{t.equation.result}</span>
        </div>
        <p className="dt-muted">{t.equationNote}</p>
        <ul className="dt-reads">{t.reads.map((read, i) => { const Icon = readIcons[i]; return <li key={read.title} data-tone={readTones[i]}><Icon aria-hidden="true" /><div><h4>{read.title}</h4><p>{read.description}</p></div></li>; })}</ul>
        <div className="dt-not"><h4>{t.notTitle}</h4><p>{t.not}</p></div>
      </CardContent></Card>
      <Card className="dt-card"><CardContent className="dt-stack">
        <h2>{t.exampleTitle}</h2>
        <Table><TableCaption>{t.exampleCaption}</TableCaption>
          <TableHeader><TableRow>{Object.values(t.exampleColumns).map((label) => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader>
          <TableBody>{t.exampleRows.map((row) => <TableRow key={row[0]}>{row.map((cell, i) => <TableCell key={i} data-tone={signTone(cell)}>{cell}</TableCell>)}</TableRow>)}</TableBody></Table>
        <p>{t.exampleNote}</p>
        <p className="dt-muted">{t.modelNote}</p>
        <details className="dt-details"><summary>{t.detailSummary}</summary><p>{t.detail}</p></details>
      </CardContent></Card>
    </div>
    <Card className="dt-card"><CardContent className="dt-lag">
      <div className="dt-stack">
        <h2>{t.lagTitle}</h2>
        <p>{t.lagIntro}</p>
        <p>{t.lagKnown}</p>
      </div>
      <div className="dt-stack">
        <ol className="dt-timeline" aria-label={t.timelineLabel}>{t.ids.map((id, i) => {
          const Icon = i === 0 ? LogIn : i === 1 ? Flag : i === last ? CircleCheck : Hourglass;
          return <li key={id} data-kind={i === 0 ? "entry" : i === 1 || i === last ? "edge" : "wait"}>
            <Icon aria-hidden="true" /><span className="dt-id">{t.rowLabel} {id}</span><span>{t.stages[i]}</span>
          </li>;
        })}</ol>
        <p className="dt-muted">{t.timelineNote}</p>
      </div>
    </CardContent></Card>
  </div>;
}
