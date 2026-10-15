export const boostingExample: { actual: number; start: number; trees: { feature: string; threshold: string; yes: number; no: number }[] } = {
  actual: 1,
  start: 0.4,
  trees: [
    { feature: "Predictor A", threshold: "0,2", yes: 0.3, no: 0.05 },
    { feature: "Predictor B", threshold: "-0,5", yes: 0.12, no: -0.03 },
    { feature: "Predictor C", threshold: "0,5", yes: 0.09, no: 0.02 },
  ],
};

// Each tree sends the example down its "yes" branch, so the correction is that leaf.
export const treeCorrection = (index: number) => boostingExample.trees[index].yes;

const number = new Intl.NumberFormat("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signed = new Intl.NumberFormat("es", { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "exceptZero" });
export const formatValue = (value: number) => number.format(value);
export const formatSigned = (value: number) => signed.format(value);
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
