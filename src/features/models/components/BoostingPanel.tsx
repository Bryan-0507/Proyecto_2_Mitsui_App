"use client";

import { Check, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableRow } from "@/components/ui/table";
import copy from "@/i18n/es.json";
import { boostingExample, fill, formatSigned, formatValue } from "../data";
import { useBoostingStep } from "../hooks/useBoostingStep";
import { ModelLayout, MoreDetail } from "./ModelLayout";

const t = copy.models, b = t.boosting;
const position = (value: number) => `${(value / 1.1) * 100}%`;

export function BoostingPanel() {
  const view = useBoostingStep();
  return <ModelLayout name={b.name}
    why={<><p>{b.why}</p>
      <ul className="models-links">{b.sources.map((s) => <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}<ExternalLink aria-hidden="true" /><span className="sr-only"> (se abre en una pestaña nueva)</span></a></li>)}</ul>
      <p className="models-note">{b.sourceNote}</p></>}
    how={<p>{b.how}</p>}
    config={<>
      <Table><TableCaption>{b.configCaption}</TableCaption>
        <TableBody>
          {b.parameters.map(([name, value]) => <TableRow key={name}><TableHead>{name}</TableHead><TableCell>{value}</TableCell></TableRow>)}
          {b.minLeafRows.map(([targets, value]) => <TableRow key={targets}><TableHead>{b.minLeaf} ({targets})</TableHead><TableCell>{value}</TableCell></TableRow>)}
        </TableBody></Table>
      <MoreDetail><p>{b.detail}</p>
        <ul className="models-params">{b.parameters.map(([name, , help]) => <li key={name}>{name}: {help}</li>)}<li>{b.minLeaf}: {b.minLeafHelp}</li></ul></MoreDetail></>}
    visual={<>
      <p className="models-note">{b.illustrative}</p>
      <div className="models-stepper">
        <Button variant="outline" onClick={view.previous} disabled={!view.canPrevious}><ChevronLeft aria-hidden="true" />{b.previous}</Button>
        <p aria-live="polite"><span>{b.stepLabel} {fill(b.stepOf, { step: view.step, total: view.total })}</span>: {b.stepNames[view.step]}</p>
        <Button onClick={view.next} disabled={!view.canNext}>{b.next}<ChevronRight aria-hidden="true" /></Button>
      </div>
      <ol className="models-trees" aria-label={b.stepperLabel}>
        {boostingExample.trees.map((tree, i) => {
          const applied = i < view.step;
          return <li key={i} className="models-tree" data-applied={applied}>
            <h4>{fill(b.treeTitle, { number: i + 1 })}</h4>
            <p className="models-split">{tree.feature} &gt; {tree.threshold}?</p>
            <div className="models-leaves">
              <div className="models-leaf" data-used="true"><span>{t.boosting.yes}</span><span>{b.leafLabel} {formatSigned(tree.yes)}</span><Check aria-label={b.usedLeaf} /></div>
              <div className="models-leaf"><span>{t.boosting.no}</span><span>{b.leafLabel} {formatSigned(tree.no)}</span></div>
            </div>
            <p className="models-tree-state">{applied ? b.applied : b.pendingTree}</p>
          </li>;
        })}
      </ol>
      <div className="models-scale" role="img" aria-label={fill(b.scaleAria, { actual: formatValue(view.actual), prediction: formatValue(view.prediction) })}>
        <div className="models-track">
          <span className="models-gap" style={{ left: position(view.prediction), width: `calc(${position(view.actual)} - ${position(view.prediction)})` }} />
          <span className="models-marker models-marker-prediction" style={{ left: position(view.prediction) }}><i>{formatValue(view.prediction)}</i></span>
          <span className="models-marker models-marker-actual" style={{ left: position(view.actual) }}><i>{formatValue(view.actual)}</i></span>
        </div>
        <p>{b.scaleLabel}</p>
      </div>
      <dl className="models-stats">
        <div><dt>{b.stats.actual}</dt><dd>{formatValue(view.actual)}</dd></div>
        <div><dt>{b.stats.prediction}</dt><dd>{formatValue(view.prediction)}</dd></div>
        <div><dt>{b.stats.correction}</dt><dd>{view.nextCorrection === null ? b.noMoreTrees : formatSigned(view.nextCorrection)}</dd></div>
        <div><dt>{b.stats.remaining}</dt><dd>{formatValue(view.remaining)}</dd></div>
      </dl>
      <p className="models-note">{b.disclaimer}</p></>} />;
}
