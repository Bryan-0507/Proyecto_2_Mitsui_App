// Tone for a signed value shown as text ("+0,30", "-0,12") or number.
export function signTone(value: string | number): "positive" | "negative" | undefined {
  const n = typeof value === "number" ? value : Number(value.replace(",", ".").replace(/[^\d.+-]/g, ""));
  if (typeof value === "string" && !/^[+-]/.test(value.trim())) return undefined;
  return n > 0 ? "positive" : n < 0 ? "negative" : undefined;
}
