"""Causal AR, MA, ARMA, ARIMA and optional seasonal estimator logic."""
import time
import warnings
import numpy as np
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX

def ajustar_temporal(y, orden, estacional=(0, 0, 0, 0), tendencia="c"):
    inicio = time.perf_counter()
    with warnings.catch_warnings(record=True) as capturadas:
        warnings.simplefilter("always")
        # Index numerico regular: conservar NaN, incluso en posiciones internas.
        modelo = SARIMAX(np.asarray(y, float), order=tuple(orden), seasonal_order=tuple(estacional),
                         trend=tendencia, enforce_stationarity=True, enforce_invertibility=True)
        ajuste = modelo.fit(disp=False, maxiter=200)
    convergio = bool(ajuste.mle_retvals.get("converged", False))
    return ajuste, {"convergio": convergio, "avisos": sorted(set(str(w.message) for w in capturadas)),
                    "segundos_ajuste": time.perf_counter() - inicio}


def predecir_temporal_causal(ajuste, y: pd.Series, ids, lag: int):
    """Filtrado (no suavizado) y pronostico dinamico h+1 desde el ultimo y disponible.

    El filtro forward tiene parametros congelados. El estado filtrado en s depende
    solo de y[:s+1]; get_prediction(dynamic=True) ignora reales posteriores a s.
    Nunca se usa estado suavizado, que si puede depender de observaciones futuras.
    """
    ids = np.asarray(ids, dtype=int)
    ultimo_conocido = int(ids.max()) - lag - 1
    # Filtrar una vez es equivalente a actualizaciones online sin refit.
    filtrado = ajuste.apply(np.asarray(y.loc[:ultimo_conocido], float), refit=False)
    pred = []
    for t in ids:
        s = int(t) - lag - 1
        assert s + lag + 1 <= t
        bloque = filtrado.get_prediction(start=s + 1, end=int(t), dynamic=True)
        pred.append(float(np.asarray(bloque.predicted_mean)[-1]))
    return np.asarray(pred)


def nombre_variante(orden, estacional=(0, 0, 0, 0)):
    p, d, q = orden
    if estacional[-1]:
        return "SARIMA"
    if d:
        return "ARIMA"
    if p and q:
        return "ARMA"
    if p:
        return "AR"
    if q:
        return "MA"
    return "MEDIA"

