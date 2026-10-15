import { History, Layers, Target, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import copy from "@/i18n/es.json";
import { ModelFlow } from "./ModelFlow";
import { ModelLayout, MoreDetail } from "./ModelLayout";

const t = copy.models, m = t.temporal;

export function TemporalPanel() {
  return <ModelLayout name={m.name} why={<p>{m.why}</p>}
    how={<><p>{m.how}</p><p>{m.example}</p><MoreDetail label={m.partsTitle}><dl className="models-parts">{m.parts.map((part) => <div key={part.name}><dt>{part.name}: {part.title}</dt><dd>{part.description}</dd></div>)}</dl><p>{m.orderNote}</p></MoreDetail></>}
    config={<>
      <Table><TableCaption>{m.configCaption}</TableCaption>
        <TableHeader><TableRow><TableHead>{t.target}</TableHead><TableHead>{m.modelColumn}</TableHead><TableHead>{m.meaningColumn}</TableHead></TableRow></TableHeader>
        <TableBody>{m.config.map(([target, model, meaning]) => <TableRow key={target}><TableCell>{target}</TableCell><TableCell>{model}</TableCell><TableCell>{meaning}</TableCell></TableRow>)}</TableBody></Table>
      <p className="models-note">{m.configNote}</p><p className="models-note">{m.detail}</p></>}
    visual={<ModelFlow label={m.flowLabel} steps={m.flow} icons={[History, TrendingUp, Layers, Target]} />} />;
}
