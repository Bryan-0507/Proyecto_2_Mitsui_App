"""Frozen temporal parameters with causal filtering; no fitting or smoothing."""
from .shared import datasets, earliest_prediction_id, load_model, validate_request
from src.models.temporal.core import predecir_temporal_causal
import numpy as np


def predict(request):
    target, date_id = validate_request(request, "temporal")
    _, labels = datasets()
    if date_id not in labels.index or date_id < earliest_prediction_id(target, "temporal"):
        return None
    artifact = load_model(target, "temporal")
    last_mature = date_id - artifact["lag"] - 1
    # A fresh filtered state per request makes browsing order irrelevant.
    available = labels.loc[:last_mature, target].copy()
    values = predecir_temporal_causal(artifact["modelo"], available, [date_id], artifact["lag"])
    if values.shape != (1,) or not np.isfinite(values[0]):
        raise ValueError("Temporal model did not return one finite prediction.")
    return float(values[0])
