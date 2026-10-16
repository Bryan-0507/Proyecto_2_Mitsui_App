import copy from "@/i18n/es.json";
import { numeric } from "./EdaCharts";

const t = copy.eda.coverageVisual;

/** Same 0–100% part-to-whole scale for every selected market and source. */
export function CoverageSummary({ cells, missing }: { cells: number; missing: number }) {
  const available = cells - missing;
  const absentPercent = 100 * missing / cells;
  const presentPercent = 100 - absentPercent;
  return (
    <figure className="eda-coverage-summary">
      <div className="eda-coverage-counts">
        <div><span>{t.available}</span><p>{numeric(available)} <small>/ {numeric(cells)}</small></p></div>
        <div><span>{t.absent}</span><p>{numeric(absentPercent)} % <small>({numeric(missing)})</small></p></div>
      </div>
      <div className="eda-coverage-track" role="img"
        aria-label={`${t.available}: ${numeric(available)} / ${numeric(cells)} (${numeric(presentPercent)} %). ${t.absent}: ${numeric(missing)} (${numeric(absentPercent)} %).`}>
        <span className="eda-coverage-present" style={{ width: `${presentPercent}%` }} />
        {missing > 0 && <span className="eda-coverage-absent" style={{ width: `${absentPercent}%` }} />}
      </div>
      <figcaption><span>{t.available}: {numeric(presentPercent)} %</span><span>{t.absent}: {numeric(absentPercent)} %</span></figcaption>
    </figure>
  );
}
