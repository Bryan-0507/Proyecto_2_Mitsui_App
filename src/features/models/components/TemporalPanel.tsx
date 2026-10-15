import { History, Layers, Target, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import copy from "@/i18n/es.json";
import { ModelFlow } from "./ModelFlow";
import { ModelLayout, MoreDetail } from "./ModelLayout";

const t = copy.models, m = t.temporal;

export function TemporalPanel() {
  return <ModelLayout name={m.name} why={<p>{m.why}</p>}
    how={<><p>{m.how}</p><dl className="models-parts">{m.parts.map((part) => <div key={part.name}><dt>{part.name}: {part.title}</dt><dd>{part.description}</dd></div>)}</dl>
      <p>{m.example}</p><p>{m.orderNote}</p></>}
    config={<>
      <Table><TableCaption>{m.configCaption}</TableCaption>
        <TableHeader><TableRow><TableHead>{t.target}</TableHead><TableHead>{m.modelColumn}</TableHead><TableHead>{m.meaningColumn}</TableHead></TableRow></TableHeader>
        <TableBody>{m.config.map(([target, model, meaning]) => <TableRow key={target}><TableCell>{target}</TableCell><TableCell>{model}</TableCell><TableCell>{meaning}</TableCell></TableRow>)}</TableBody></Table>
      <p className="models-note">{m.configNote}</p><MoreDetail><p>{m.detail}</p></MoreDetail></>}
    visual={<>
      <ModelFlow label={m.flowLabel} steps={m.flow} icons={[History, TrendingUp, Layers, Target]} />
      <section className="models-example"><h4>{m.sequenceTitle}</h4><p>{m.sequenceNote}</p>
        <div className="models-table-scroll" tabIndex={0} role="region" aria-label={m.sequenceCaption}>
          <Table><TableCaption>{m.sequenceCaption}</TableCaption>
            <TableHeader>
              <TableRow><TableHead /><TableHead colSpan={5}>{m.pastGroup}</TableHead><TableHead className="models-future">{m.futureGroup}</TableHead></TableRow>
              <TableRow><TableHead />{m.positions.map((p, i) => <TableHead key={p} className={i === 5 ? "models-future" : undefined}>{p}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableHead>{m.rowValue}</TableHead>{m.values.map((v, i) => <TableCell key={i}>{v}</TableCell>)}<TableCell className="models-future">{m.pending}</TableCell></TableRow>
              <TableRow><TableHead>{m.rowChange}</TableHead>{m.changes.map((v, i) => <TableCell key={i}>{v}</TableCell>)}<TableCell className="models-future">{m.pending}</TableCell></TableRow>
            </TableBody></Table></div></section></>} />;
}
