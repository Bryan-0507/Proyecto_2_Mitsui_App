"""Private third-party five-checkpoint ensemble, not a model trained by our team."""
import json
from functools import lru_cache

from .shared import ARTIFACTS, validate_request, verified_path
from src.models.external_lstm.core import LSTMExterna
import numpy as np
import torch


@lru_cache(maxsize=1)
def external_contract():
    with (ARTIFACTS / "contracts/external-lstm.json").open(encoding="utf-8") as source:
        return json.load(source)


@lru_cache(maxsize=1)
def earliest_prediction_id():
    with verified_path("artifacts/models/external_lstm/config.json").open(encoding="utf-8") as source:
        config = json.load(source)
    with (ARTIFACTS / "contracts/target-pairs.csv").open(encoding="utf-8") as source:
        import csv
        max_lag = max(int(row["lag"]) for row in csv.DictReader(source))
    # Joint model selection used all 424 outputs through VAL_END - 1.
    return int(config["VAL_END"]) + max_lag + 1


@lru_cache(maxsize=1)
def pca_history():
    contract = external_contract()
    path = verified_path("artifacts/data/external-features-pca.npz", contract["pca_sha256"])
    with np.load(path, allow_pickle=False) as package:
        pca = package["pca"].copy()
        ids = package["date_id"].copy()
    if pca.shape != tuple(contract["pca"]) or not np.array_equal(ids, np.arange(len(pca))):
        raise ValueError("External PCA cache does not match its provenance.")
    if pca.shape[1] != 100 or not np.isfinite(pca).all():
        raise ValueError("External PCA input is invalid.")
    pca.setflags(write=False)
    return pca


@lru_cache(maxsize=1)
def models():
    torch.set_num_threads(1)
    torch.use_deterministic_algorithms(True)
    ensemble = []
    for seed in range(5):
        path = verified_path(f"artifacts/models/external_lstm/model_seed{seed}.pt")
        state = torch.load(path, map_location="cpu", weights_only=True)
        if not isinstance(state, dict) or not all(isinstance(value, torch.Tensor) for value in state.values()):
            raise ValueError("Checkpoint does not exclusively contain tensors.")
        model = LSTMExterna()
        model.load_state_dict(state, strict=True)
        model.eval()
        ensemble.append(model)
    return tuple(ensemble)


def predict(request):
    target, date_id = validate_request(request, "external_lstm")
    pca = pca_history()
    if not earliest_prediction_id() <= date_id <= len(pca):
        return None
    # Exactly 20 observations BEFORE date_id; no labels or X_t are used.
    window = pca[date_id - 20:date_id].copy()
    if window.shape != (20, 100):
        return None
    tensor = torch.from_numpy(window[None])
    with torch.inference_mode():
        outputs = [model(tensor).numpy()[0] for model in models()]
    prediction = np.mean(outputs, axis=0)
    if prediction.shape != (424,) or not np.isfinite(prediction).all():
        raise ValueError("External ensemble did not return 424 finite predictions.")
    return float(prediction[int(target.removeprefix("target_"))])
