"""Contratos, estimadores y evaluacion causal compartidos de modelado."""

import hashlib
import importlib.metadata
import json
import time
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from scipy.stats import spearmanr
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.impute import SimpleImputer
from src.models.linear.core import build_estimator as build_linear
from src.models.lightgbm.core import build_estimator as build_lightgbm
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from src.models.temporal.core import ajustar_temporal, predecir_temporal_causal, nombre_variante

from src.config import (
    DESFASES_HISTORIA, DIR_MODELADO, FIN_PRUEBA, INICIO_PRUEBA,
    RUTA_TRAIN_FINAL, SEMILLA, TARGETS_MODELADO, VENTANAS_VALIDACION, ruta_target_preparado,
)


def guardar_json(contenido, ruta: Path) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(json.dumps(contenido, indent=2, ensure_ascii=False, allow_nan=False), encoding="utf-8")


def leer_json(ruta: Path):
    return json.loads(ruta.read_text(encoding="utf-8"))


def hash_archivo(ruta: Path) -> str:
    return hashlib.sha256(ruta.read_bytes()).hexdigest()


def versiones():
    import platform
    paquetes = ("numpy", "pandas", "scipy", "scikit-learn", "statsmodels", "lightgbm", "joblib")
    return {"python": platform.python_version(), **{p: importlib.metadata.version(p) for p in paquetes}}


def construir_historia(etiquetas: pd.Series, lag: int) -> pd.DataFrame:
    """En t el primer historial es y[t-lag-1]; nunca y[t-1] por costumbre."""
    if not etiquetas.index.equals(pd.RangeIndex(len(etiquetas))):
        raise ValueError("La historia exige el indice completo consecutivo de date_id")
    return pd.DataFrame({f"hist_target_desfase_{d}": etiquetas.shift(lag + 1 + d) for d in DESFASES_HISTORIA})


def cargar_target(target: str):
    datos = pd.read_csv(ruta_target_preparado(target)).set_index("date_id")
    if not datos.index.equals(pd.Index(range(FIN_PRUEBA + 1), name="date_id")):
        raise ValueError("Se perdieron o comprimieron posiciones temporales")
    return datos.drop(columns=target), datos[target]


def cortes_temporales(y: pd.Series, lag: int):
    for numero, (inicio, fin) in enumerate(VENTANAS_VALIDACION, 1):
        # Ajuste antes de observar X del primer instante de validacion.
        conocidos = inicio - 1
        limite = conocidos - lag - 1
        train_ids = y.index[(y.index <= limite) & y.notna()]
        valid_ids = y.index[(y.index >= inicio) & (y.index <= fin) & y.notna()]
        if not len(train_ids) or not len(valid_ids):
            raise ValueError("Corte vacio")
        assert int(train_ids.max()) + lag + 1 <= conocidos
        yield numero, train_ids, valid_ids, limite


def metricas(y, pred):
    y, pred = np.asarray(y, float), np.asarray(pred, float)
    if not len(y) or not np.isfinite(y).all() or not np.isfinite(pred).all():
        raise ValueError("Metricas requieren verdades y predicciones finitas")
    no_cero = y != 0
    r2 = float(r2_score(y, pred, force_finite=False))
    return {
        "rmse": float(root_mean_squared_error(y, pred)),
        "mae": float(mean_absolute_error(y, pred)),
        "r2": r2 if np.isfinite(r2) else None,
        "r2_definido": bool(np.isfinite(r2)),
        "acierto_signo": float((np.sign(y[no_cero]) == np.sign(pred[no_cero])).mean()) if no_cero.any() else None,
        "n": int(len(y)), "n_signo": int(no_cero.sum()),
    }


class SeleccionSpearman(BaseEstimator, TransformerMixin):
    """Seleccion supervisada exclusivamente sobre el entrenamiento del fold."""

    def __init__(self, k=32):
        self.k = k

    def fit(self, X, y):
        X = pd.DataFrame(X)
        y = np.asarray(y, float)
        asociaciones = []
        for columna in X.columns:
            valores = X[columna].to_numpy(float)
            mascara = np.isfinite(valores) & np.isfinite(y)
            if mascara.sum() < max(20, int(np.ceil(.6*len(y)))) or np.unique(valores[mascara]).size < 2:
                continue
            coef = spearmanr(valores[mascara], y[mascara]).statistic
            if np.isfinite(coef):
                asociaciones.append((abs(float(coef)), str(columna)))
        asociaciones.sort(key=lambda v: (-v[0], v[1]))
        if not asociaciones:
            raise ValueError("No hay predictores con cobertura y variabilidad")
        self.columnas_ = [c for _, c in asociaciones[:self.k]]
        self.asociaciones_ = dict((c, v) for v, c in asociaciones)
        self.feature_names_in_ = np.asarray(X.columns, dtype=object)
        self.n_features_in_ = len(X.columns)
        return self

    def transform(self, X):
        return pd.DataFrame(X).loc[:, self.columnas_].copy()

    def get_feature_names_out(self, input_features=None):
        return np.asarray(self.columnas_, dtype=object)


class RecortePredictoras(BaseEstimator, TransformerMixin):
    def __init__(self, activo=False):
        self.activo = activo

    def fit(self, X, y=None):
        X = pd.DataFrame(X)
        self.limites_inferiores_ = X.quantile(0.01)
        self.limites_superiores_ = X.quantile(0.99)
        self.feature_names_in_ = np.asarray(X.columns, dtype=object)
        return self

    def transform(self, X):
        X = pd.DataFrame(X).copy()
        return X.clip(self.limites_inferiores_, self.limites_superiores_, axis=1) if self.activo else X

    def get_feature_names_out(self, input_features=None):
        return self.feature_names_in_


def crear_tabular(familia, parametros):
    pasos = [
        ("seleccion", SeleccionSpearman(parametros["k"])),
        ("extremos", RecortePredictoras(parametros["recorte"])),
    ]
    if familia == "ols":
        pasos += [("imputacion", SimpleImputer(strategy="median", add_indicator=True)),
                  ("escalado", StandardScaler()), ("modelo", build_linear())]
    elif familia == "lightgbm":
        args = {k: v for k, v in parametros.items() if k not in ("k", "recorte")}
        pasos += [("modelo", build_lightgbm(args))]
    else:
        raise ValueError(f"Familia desconocida: {familia}")
    return Pipeline(pasos)








def prediccion_artefacto(ruta: Path, X=None, y=None, ids=None):
    """Entrada minima estable para futura interfaz; no recibe calendario ficticio."""
    artefacto = joblib.load(ruta)
    if artefacto["familia"] in ("ols", "lightgbm"):
        return artefacto["modelo"].predict(X.loc[:, artefacto["columnas_entrada"]])
    return predecir_temporal_causal(artefacto["modelo"], y, ids, artefacto["lag"])
