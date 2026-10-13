"""Read-only chart export; mirrors the selections in the two EDA notebooks."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
import pandas as pd


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    source = args.source
    path = source / "data/processed/train_eda.csv"
    frame = pd.read_csv(path)
    labels_path = source / "data/raw/train_labels.csv"
    labels = pd.read_csv(labels_path)
    assert frame.date_id.is_unique and labels.date_id.is_unique
    specs = [
        ("stocks", "US_Stock_VXUS_adj_close", "US_Stock_TRGP_adj_open", "US_Stock_"),
        ("jpx", "JPX_Gold_Standard_Futures_Close", "JPX_Platinum_Mini_Futures_Volume", "JPX_"),
        ("lme", "LME_AH_Close", "LME_PB_Close", "LME_"),
        ("fx", "FX_NOKEUR", "FX_GBPCAD", "FX_"),
    ]
    markets = []
    for key, distribution, outlier, prefix in specs:
        values = frame[distribution].dropna()
        q1, median, q3 = values.quantile([.25, .5, .75])
        iqr = q3 - q1
        inside = values.between(q1 - 1.5 * iqr, q3 + 1.5 * iqr)
        counts, edges = np.histogram(values, bins=30)
        other = frame[outlier].dropna()
        oq1, oq3 = other.quantile([.25, .75])
        oi = oq3 - oq1
        marked = (frame[outlier] < oq1 - 1.5 * oi) | (frame[outlier] > oq3 + 1.5 * oi)
        columns = [c for c in frame if c.startswith(prefix)]
        missing = frame[columns].isna()
        blocks = []
        for start in range(int(frame.date_id.min()), int(frame.date_id.max()) + 1, 25):
            rows = frame.date_id.between(start, start + 24)
            cells = int(rows.sum()) * len(columns)
            absent = int(missing.loc[rows].sum().sum())
            blocks.append(dict(start=start, end=int(frame.loc[rows, "date_id"].max()),
                               missing=absent, cells=cells, percentage=100 * absent / cells))
        points = [dict(id=int(row.date_id), value=float(row[outlier]), outlier=bool(marked.loc[i]))
                  for i, row in frame[["date_id", outlier]].dropna().iterrows()]
        markets.append(dict(key=key, variable=distribution, n=len(values), skew=float(values.skew()),
            histogram=[dict(start=float(edges[i]), end=float(edges[i+1]), count=int(v)) for i,v in enumerate(counts)],
            box=dict(min=float(values.min()), q1=float(q1), median=float(median), q3=float(q3), max=float(values.max()),
                low=float(values[inside].min()), high=float(values[inside].max()),
                outside=[float(v) for v in values[~inside]]),
            quality=dict(variable=outlier, n=len(other), count=int(marked.sum()),
                percentage=100*marked.sum()/len(other), points=points,
                lower=float(oq1-1.5*oi), upper=float(oq3+1.5*oi)),
            coverage=dict(columns=len(columns), missing=int(missing.sum().sum()),
                cells=int(missing.size), blocks=blocks)))
        assert sum(int(v) for v in counts) == len(values)
    pairs = [("LME_PB_Close", "target_406"), ("LME_PB_Close", "target_345"),
             ("LME_PB_Close", "target_231"), ("LME_PB_Close", "target_376"),
             ("US_Stock_LQD_adj_low", "target_410")]
    relations = []
    for predictor, target in pairs:
        joined = frame[["date_id", predictor]].merge(labels[["date_id",target]],on="date_id",validate="one_to_one").dropna()
        relations.append(dict(predictor=predictor, target=target, n=len(joined),
            rho=float(joined[predictor].corr(joined[target], method="spearman")),
            points=[dict(x=float(r[predictor]), y=float(r[target])) for _,r in joined.iterrows()]))
    # Verify against the saved notebook outputs rather than inventing a new ranking.
    assert abs(relations[0]["rho"] - .172483) < .000001
    assert [m["n"] for m in markets] == [1894,1845,1910,1961]
    assert [m["quality"]["count"] for m in markets] == [205,142,66,231]
    gold = pd.read_csv(source / "data/raw/train.csv", usecols=["US_Stock_GOLD_adj_close"])
    result = dict(provenance=dict(source="train_eda.csv + train_labels.csv", notebooks=["01_analisis_exploratorio.ipynb", "02_analisis_relaciones.ipynb"],
        sha256=hashlib.sha256(path.read_bytes()).hexdigest(), ids=[int(frame.date_id.min()),int(frame.date_id.max())],
        rows=len(frame), predictors=len(frame.columns)-1, goldMissing=int(gold.isna().sum().iloc[0])), markets=markets, relations=relations)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, allow_nan=False, separators=(",",":")))
    print(json.dumps(dict(rows=len(frame), predictors=len(frame.columns)-1, bytes=args.output.stat().st_size,
        histogram_counts=[m["n"] for m in markets], outliers=[m["quality"]["count"] for m in markets],
        correlations=[round(r["rho"],6) for r in relations])))


main()
