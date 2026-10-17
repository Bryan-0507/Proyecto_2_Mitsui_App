"use client";

import { GitCompareArrows, LoaderCircle, MoveRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Combobox, ComboboxTrigger, ComboboxValue, ComboboxContent, ComboboxInput, ComboboxEmpty, ComboboxList, ComboboxItem } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { usePredictionComparison } from "../hooks/usePredictionComparison";
import { fillCopy, formatPrediction, predictionErrorText } from "../comparison-formatting";
import type { ComparisonOptions } from "../types/comparison";
import copy from "@/i18n/es.json";

const text = copy.prediction;

export function PredictionComparison({ options }: { options: ComparisonOptions }) {
  const { containerRef, dateTriggerRef, ...view } = usePredictionComparison(options);
  const pair = text.targets[view.target];
  const items = options.targets.map((entry) => ({ value: entry.target, label: text.targets[entry.target].label }));
  const context = { target: view.target, dateId: Number(view.dateId), lag: view.selectedTarget.lag,
    stepLabel: view.selectedTarget.lag === 1 ? text.step : text.steps };

  return (
    <section ref={containerRef} className="prediction-screen" aria-labelledby="prediction-title">
      <header data-comparison-intro className="prediction-heading">
        <h1 id="prediction-title">{text.title}</h1>
        <p>{text.intro}</p>
      </header>

      <Card className="comparison-config">
        <CardHeader>
          <CardTitle><h2>{text.configuration}</h2></CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={view.compare} noValidate>
            <FieldGroup className="comparison-fields">
              <Field>
                <FieldLabel htmlFor="comparison-target">{text.targetLabel}</FieldLabel>
                <Select items={items} value={view.target} onValueChange={view.changeTarget}>
                  <SelectTrigger id="comparison-target" className="comparison-select"><SelectValue /></SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} side="bottom" align="start" className="comparison-popup">
                    <SelectGroup>{items.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field data-invalid={view.dateError ? true : undefined}>
                <FieldLabel id="date-label" htmlFor="comparison-date">{text.dateLabel}</FieldLabel>
                <Combobox items={view.dateOptions} filteredItems={view.filteredDates} filter={null}
                  value={view.dateId} onValueChange={view.changeDateId}
                  inputValue={view.dateSearch} onInputValueChange={view.changeDateSearch}
                  open={view.dateMenuOpen} onOpenChange={view.changeDateMenuOpen}>
                  <ComboboxTrigger ref={dateTriggerRef} render={<Button variant="outline" />} type="button"
                    id="comparison-date" className="comparison-date-trigger" aria-labelledby="date-label"
                    aria-invalid={Boolean(view.dateError)} aria-describedby={view.dateError ? "date-help date-error" : "date-help"}>
                    <ComboboxValue />
                  </ComboboxTrigger>
                  <ComboboxContent anchor={dateTriggerRef} side="bottom" align="start" className="comparison-date-popup">
                    <ComboboxInput placeholder={text.dateSearch} aria-label={text.dateSearchLabel} showTrigger={false} />
                    <ComboboxEmpty><div><p>{text.dateEmpty}</p><p>{text.dateEmptyHelp}</p></div></ComboboxEmpty>
                    <ComboboxList>{(id: string) => <ComboboxItem key={id} value={id}>{id}</ComboboxItem>}</ComboboxList>
                    <p className="comparison-date-count" role="status" aria-live="polite">{fillCopy(text.dateCount, { count: view.filteredDates.length, total: view.dateOptions.length })}</p>
                  </ComboboxContent>
                </Combobox>
                <FieldDescription id="date-help">{fillCopy(text.dateHelp, { min: options.minDateId, max: options.maxDateId })}</FieldDescription>
                {view.dateError && <FieldError id="date-error">{view.dateError}</FieldError>}
              </Field>
              <Field className="comparison-submit" data-disabled={view.isLoading || undefined}>
                <Button type="submit" disabled={view.isLoading} size="lg">
                  {view.isLoading ? <LoaderCircle data-icon="inline-start" className="comparison-spinner" /> : <GitCompareArrows data-icon="inline-start" />}
                  {view.isLoading ? text.loading : text.compare}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="comparison-context-band">
          <div className="comparison-pair">
            <div className="comparison-instrument"><span>{text.instrumentA}</span><p>{pair.a}</p></div>
            <MoveRight className="comparison-versus" aria-hidden="true" />
            <div className="comparison-instrument"><span>{text.instrumentB}</span><p>{pair.b}</p></div>
            <div className="comparison-horizon"><span>{text.horizonLabel}</span><p>{fillCopy(text.horizonShort, context)}</p></div>
            <span className="comparison-target-id">{fillCopy(text.targetId, context)}</span>
          </div>
        </CardFooter>
      </Card>

      <p className="sr-only" role="status" aria-live="polite">{view.hasComparison && (view.isLoading ? fillCopy(text.progress, { count: view.completedCount }) : text.completed)}</p>
      {view.hasComparison && <section className="comparison-results" aria-busy={view.isLoading} aria-labelledby="comparison-results-title" data-comparison-results>
        <header className="comparison-results-heading">
          <h2 id="comparison-results-title">{text.resultsTitle}</h2>
          <p>{fillCopy(text.resultsDescription, context)}</p>
        </header>
        <div className="comparison-model-grid">
          {view.rows.map((row) => {
            const model = text.models[row.family];
            const modelLabel = row.family === "temporal"
              ? copy.metrics.signFinding.temporal[view.target].split("(")[0]
              : model.label;
            return (
              <Card key={row.family} className="comparison-model-card" data-status={row.status} aria-labelledby={`model-${row.family}`}>
                <CardHeader>
                  <CardTitle><h3 id={`model-${row.family}`}>{modelLabel}</h3></CardTitle>
                  <CardDescription>{model.detail}</CardDescription>
                </CardHeader>
                <CardContent className="comparison-model-content">
                  {row.status === "success" ? <p className="comparison-value" data-sign={row.result.sign}>{formatPrediction(row.result.value)}</p>
                    : row.status === "loading" ? <Skeleton className="h-10 w-40" />
                    : <p className="comparison-value-placeholder">{text.failedValue}</p>}
                </CardContent>
                <CardFooter className="comparison-model-footer">
                  <p>{row.status === "success" ? fillCopy(text[`${row.result.sign}Meaning`], { a: pair.a, b: pair.b })
                    : row.status === "error" ? predictionErrorText(row.code) : text.pendingValue}</p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        <p className="comparison-reading">{text.tableCaption}</p>
      </section>}
    </section>
  );
}
