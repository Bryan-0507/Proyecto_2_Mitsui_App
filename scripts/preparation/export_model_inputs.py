"""Export descriptive inputs from verified frozen models; never fit or predict."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.dont_write_bytecode = True
sys.path.insert(0, str(ROOT / "python"))
from inference.shared import contract, load_model, verified_path


def main():
    entries = []
    for target in contract()["targets"]:
        for family in ("linear", "lightgbm", "temporal"):
            artifact = load_model(target, family)
            row = {"family": family, "target": target, "lag": artifact["lag"]}
            if family == "temporal":
                row.update(order=list(artifact["parametros"]["orden"]), features=[], indicators=[])
            else:
                pipeline = artifact["modelo"]
                features = list(pipeline.named_steps["seleccion"].columnas_)
                indicators = []
                if family == "linear":
                    imputer = pipeline.named_steps["imputacion"]
                    indicators = [features[int(i)] for i in imputer.indicator_.features_]
                assert len(set(features)) == len(features) and set(features) <= set(artifact["columnas_entrada"])
                row.update(features=features, indicators=indicators, order=None)
            entries.append(row)
    config = json.loads(verified_path("artifacts/models/external_lstm/config.json").read_text())
    columns = json.loads(verified_path("artifacts/models/external_lstm/feature-columns.json").read_text())
    # The input tensor, not the 424 output targets or the engineered source columns.
    external = {"engineeredCount": len(columns), "componentCount": 100, "window": 20}
    assert config["VAL_END"] > 0 and len(columns) == 2064
    output = ROOT / "artifacts/evaluation/preparation/model-inputs.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps({"entries": entries, "external": external}, ensure_ascii=False, indent=2) + "\n")
    print(f"Exported {len(entries)} verified model input descriptions to {output.relative_to(ROOT)}")


main()
