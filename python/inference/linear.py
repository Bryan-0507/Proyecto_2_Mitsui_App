"""Frozen OLS baseline; preparation and loading are shared, never refitted."""
from .shared import predict_tabular


def predict(request):
    return predict_tabular(request, "linear")
