"""Export saved aggregate OLS search results; never train or change source files."""
import argparse
import csv
import json
import math
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    with (args.source / "05_grid_tabular.csv").open() as stream:
        grid = list(csv.DictReader(stream))
    with (args.source / "05_auditoria_cortes.csv").open() as stream:
        audit = list(csv.DictReader(stream))
    selection = json.loads((args.source / "05_seleccion_tabular.json").read_text())
    result = []
    for target in ("target_225", "target_19", "target_105", "target_410"):
        candidates = []
        for row in grid:
            if row["target"] != target or row["familia"] != "ols":
                continue
            parameters = json.loads(row["parametros"])
            candidate = {"k": parameters["k"], "clip": parameters["recorte"],
                         "rmse": float(row["rmse_media"]),
                         "foldRmse": [float(row[f"fold_{i}_rmse"]) for i in (1, 2, 3)],
                         "foldN": [int(row[f"fold_{i}_n"]) for i in (1, 2, 3)]}
            assert row["estado"] == "ok" and math.isfinite(candidate["rmse"])
            assert abs(sum(candidate["foldRmse"]) / 3 - candidate["rmse"]) < 1e-12
            candidates.append(candidate)
        assert len(candidates) == 6
        assert {(c["k"], c["clip"]) for c in candidates} == {(k, clip) for k in (8, 16, 32) for clip in (False, True)}
        winner = min(candidates, key=lambda c: (c["rmse"], c["k"], c["clip"]))
        saved = selection[target]["ols"]
        assert winner["k"] == saved["parametros"]["k"] and winner["clip"] == saved["parametros"]["recorte"]
        assert abs(winner["rmse"] - saved["rmse_cv"]) < 1e-12
        cuts = sorted([r for r in audit if r["target"] == target], key=lambda r: int(r["fold"]))
        assert len(cuts) == 3
        folds = [{"start": int(r["valid_inicio"]), "end": int(r["valid_fin"]), "n": int(r["valid_n"])} for r in cuts]
        assert all(c["foldN"] == [f["n"] for f in folds] for c in candidates)
        result.append({"target": target, "selectedK": winner["k"], "selectedClip": winner["clip"], "candidates": candidates, "folds": folds})
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(f"Verified {len(result)} targets, 24 candidates; no training performed")


main()
