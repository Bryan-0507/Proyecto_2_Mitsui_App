"""Export aggregate Spearman stability from trusted local round-2 artifacts.

No models are fitted, no source files changed, no raw observations exported.
Run with the EDA virtual environment. Never load untrusted joblib files.
"""
import argparse
import json
from pathlib import Path
import joblib
import numpy as np
from scipy.stats import spearmanr

EXPECTED = {
    "target_225": [0.177, -0.106, 0.050, 0.050],
    "target_19": [-0.116, -0.011, 0.037, 0.133],
    "target_105": [0.115, -0.027, -0.006, -0.092],
    "target_410": [-0.187, 0.167, 0.038, 0.013],
}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    result = []
    for target, expected in EXPECTED.items():
        payload = joblib.load(args.source / f"09_{target}.joblib")
        X, y = payload["features"]["dinamico_nativo"], payload["y"]
        assert X.index.equals(y.index) and list(y.index) == list(range(1569))
        end = 981 - int(payload["lag"]) - 2
        ids = y.index[(y.index <= end) & y.notna()]
        eligible = []
        for column in X:
            values = X.loc[ids, column]
            mask = np.isfinite(values) & np.isfinite(y.loc[ids])
            if mask.sum() < max(20, int(np.ceil(.6 * len(ids)))) or values[mask].nunique() < 2:
                continue
            rho = float(spearmanr(values[mask], y.loc[ids][mask]).statistic)
            if np.isfinite(rho):
                eligible.append((abs(rho), column))
        eligible.sort(key=lambda row: (-row[0], row[1]))
        feature = eligible[0][1]
        periods = []
        for start, stop in [(0, end), (981, 1176), (1177, 1372), (1373, 1563)]:
            subset = X.index[(X.index >= start) & (X.index <= stop)]
            values, truth = X.loc[subset, feature], y.loc[subset]
            mask = np.isfinite(values) & np.isfinite(truth)
            rho = float(spearmanr(values[mask], truth[mask]).statistic)
            assert np.isfinite(rho) and -1 <= rho <= 1 and mask.sum() > 20
            # Independent equivalent calculation on average ranks, including ties.
            check = values[mask].rank().corr(truth[mask].rank())
            assert abs(rho - check) < 1e-12
            periods.append({"start": start, "end": stop, "n": int(mask.sum()), "rho": rho})
        assert all(round(p["rho"], 3) == value for p, value in zip(periods, expected)), (target, feature, periods)
        result.append({"target": target, "feature": feature, "eligible": len(eligible), "periods": periods})
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, allow_nan=False, indent=2) + "\n", encoding="utf8")
    for row in result:
        print(row["target"], row["feature"], [(p["n"], round(p["rho"], 6)) for p in row["periods"]])

main()
