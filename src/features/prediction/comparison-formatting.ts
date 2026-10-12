import copy from "@/i18n/es.json";

export function fillCopy(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}

export function predictionErrorText(code: string): string {
  const errors: Record<string, string> = copy.prediction.errors;
  return Object.prototype.hasOwnProperty.call(errors, code) ? errors[code] : errors.inference_failed;
}

export function formatPrediction(value: number): string {
  // Preserve the direction if a tiny non-zero value would otherwise round to zero.
  if (value !== 0 && Math.abs(value) < 0.0000005) return value.toExponential(3);
  return new Intl.NumberFormat("es-GT", {
    minimumFractionDigits: 6, maximumFractionDigits: 6, signDisplay: "exceptZero",
  }).format(value);
}
