export type ModelInputEntry = {
  family: "linear" | "lightgbm" | "temporal";
  target: string;
  lag: number;
  features: string[];
  indicators: string[];
  order: number[] | null;
};
export type ModelInputCatalog = {
  entries: ModelInputEntry[];
  external: { engineeredCount: number; componentCount: number; window: number };
};
