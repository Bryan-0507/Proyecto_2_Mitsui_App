"""Initial per-target LightGBM models, matching the benchmark metrics."""
from .shared import predict_tabular


def predict(request):
    return predict_tabular(request, "lightgbm")
