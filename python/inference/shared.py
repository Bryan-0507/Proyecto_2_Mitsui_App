"""Shared read-only contracts, verified assets and causal inputs for inference."""

import hashlib
import json
import sys
from functools import lru_cache
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS = PROJECT_ROOT / "artifacts"
sys.dont_write_bytecode = True
sys.path.insert(0, str(ARTIFACTS / "python"))

import joblib
import numpy as np
import pandas as pd
from src.shared.compatibility import install_legacy_imports

install_legacy_imports()
from src.shared.modeling import construir_historia

MODEL_FAMILIES = {"linear": "ols", "lightgbm": "lightgbm", "temporal": "temporal"}


@lru_cache(maxsize=1)
def manifest():
    with (ARTIFACTS / "transfer-manifest.json").open(encoding="utf-8") as source:
        entries = json.load(source)["files"]
    return {entry["destination"]: entry["sha256"] for entry in entries}


def verified_path(relative_path, expected_hash=None):
    path = PROJECT_ROOT / relative_path
    expected = expected_hash if expected_hash is not None else manifest().get(relative_path)
    if not isinstance(expected, str) or len(expected) != 64:
        raise ValueError("Artifact has no valid provenance hash.")
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        raise ValueError("Artifact integrity check failed.")
    return path


@lru_cache(maxsize=1)
def contract():
    with (ARTIFACTS / "contracts" / "benchmark.json").open(encoding="utf-8") as source:
        return json.load(source)


@lru_cache(maxsize=1)
def datasets():
    predictors = pd.read_csv(verified_path("artifacts/data/train_eda.csv.gz"))
    labels = pd.read_csv(verified_path("artifacts/data/selected-target-labels.csv.gz"))
    for frame in (predictors, labels):
        if not np.array_equal(frame["date_id"].to_numpy(), np.arange(len(frame))):
            raise ValueError("Dataset identifiers are not consecutive and unique.")
    if not predictors["date_id"].equals(labels["date_id"]):
        raise ValueError("Predictor and label identifiers do not match.")
    predictors = predictors.set_index("date_id")
    labels = labels.set_index("date_id")
    if np.isinf(predictors.to_numpy(dtype=float)).any():
        raise ValueError("Predictors contain infinite values.")
    return predictors, labels


@lru_cache(maxsize=12)
def load_model(target, family="linear"):
    if target not in contract()["targets"] or family not in MODEL_FAMILIES:
        raise ValueError("Unknown target or family.")
    name = f"{target}.joblib" if family == "linear" else f"{target}_{family}.joblib"
    artifact = joblib.load(verified_path(f"artifacts/models/{family}/{name}"))
    metadata = contract()["targets"][target]
    if (
        artifact.get("familia") != MODEL_FAMILIES[family]
        or artifact.get("target") != target
        or artifact.get("lag") != metadata["lag"]
        or artifact.get("columnas_entrada") != metadata["columnas_entrada"]
    ):
        raise ValueError("Frozen model does not match its contract.")
    known, training_end = artifact["conocido_ajuste"], artifact["entrenamiento_fin_id"]
    if type(known) is not int or type(training_end) is not int:
        raise ValueError("Invalid training availability metadata.")
    if training_end + metadata["lag"] + 1 > known:
        raise ValueError("Training labels had not matured at the recorded fit time.")
    return artifact


def earliest_prediction_id(target, family="linear"):
    artifact = load_model(target, family)
    _, labels = datasets()
    last_validation_id = max(end for _, end in contract()["validaciones"])
    used_labels = labels.loc[:last_validation_id, target].dropna()
    if used_labels.empty:
        raise ValueError("Cannot verify model selection availability.")
    selection_known = int(used_labels.index.max()) + artifact["lag"] + 1
    return max(artifact["conocido_ajuste"], selection_known) + 1


def validate_request(request, family):
    if request.get("family") != family or request.get("target") not in contract()["targets"]:
        raise ValueError("Invalid target or model family.")
    date_id = request.get("dateId")
    if type(date_id) is not int or not 0 <= date_id <= 9_007_199_254_740_991:
        raise ValueError("Invalid observation identifier.")
    return request["target"], date_id


def build_input(target, date_id, family="linear"):
    artifact = load_model(target, family)
    predictors, labels = datasets()
    if date_id not in predictors.index or date_id < earliest_prediction_id(target, family):
        return None
    lag = artifact["lag"]
    history_labels = labels.loc[:date_id, target].copy().reset_index(drop=True)
    history_labels.loc[date_id - lag:] = np.nan
    history = construir_historia(history_labels, lag).loc[[date_id]]
    history.index.name = "date_id"
    row = pd.concat([predictors.loc[[date_id]], history], axis=1)
    columns = artifact["columnas_entrada"]
    if set(row.columns) != set(columns):
        raise ValueError("Inference inputs differ from the frozen model inputs.")
    return row.loc[:, columns]


def predict_tabular(request, family):
    target, date_id = validate_request(request, family)
    row = build_input(target, date_id, family)
    if row is None:
        return None
    values = load_model(target, family)["modelo"].predict(row)
    if np.asarray(values).shape != (1,) or not np.isfinite(values[0]):
        raise ValueError("Model did not return one finite prediction.")
    return float(values[0])
