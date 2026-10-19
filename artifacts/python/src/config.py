"""Rutas y contratos compartidos del pipeline."""

from pathlib import Path
import json


RAIZ = Path(__file__).resolve().parent.parent
DIR_RAW = RAIZ / "data" / "raw"
DIR_PROCESSED = RAIZ / "data" / "processed"

# Canonical locations; historical filenames remain in frozen provenance only.
PROJECT_ROOT = RAIZ
RAW_DIR = DIR_RAW
PROCESSED_DIR = DIR_PROCESSED
MODEL_CATALOG_DIR = PROCESSED_DIR / "models"
PIPELINE_OUTPUT_DIR = PROCESSED_DIR / "pipelines"
LAYOUT_PATH = PROJECT_ROOT / "src" / "shared" / "layout.json"


def source_path(name):
    """Resolve a historical source name without changing historical manifests."""
    mapping = json.loads(LAYOUT_PATH.read_text())
    if name in mapping:
        return PROJECT_ROOT / mapping[name]
    path = Path(name)
    return PROJECT_ROOT / path if path.parts and path.parts[0] == "src" else PROJECT_ROOT / "src" / path

# Semilla unica para cualquier procedimiento estocastico del proyecto.
SEMILLA = 123

RUTA_TRAIN_CRUDO = DIR_RAW / "train.csv"
RUTA_TEST_CRUDO = DIR_RAW / "test.csv"
RUTA_TRAIN_LABELS = DIR_RAW / "train_labels.csv"
RUTA_TARGET_PAIRS = DIR_RAW / "target_pairs.csv"

RUTA_TRAIN_SIN_COBERTURA = DIR_PROCESSED / "01_train_sin_gold.csv"
RUTA_TEST_SIN_COBERTURA = DIR_PROCESSED / "01_test_sin_gold.csv"
RUTA_TRAIN_FINAL = DIR_PROCESSED / "train_eda.csv"
RUTA_TEST_FINAL = DIR_PROCESSED / "test_eda.csv"

COLUMNA_ID = "date_id"
COLUMNA_AUXILIAR_TEST = "is_scored"

COLUMNAS_SIN_COBERTURA = [
    "US_Stock_GOLD_adj_open",
    "US_Stock_GOLD_adj_high",
    "US_Stock_GOLD_adj_low",
    "US_Stock_GOLD_adj_close",
    "US_Stock_GOLD_adj_volume",
]

ESPECIFICACIONES_OHLC = [
    {
        "mercado": "Acciones de Estados Unidos",
        "open": "_adj_open",
        "high": "_adj_high",
        "low": "_adj_low",
        "close": "_adj_close",
    },
    {
        "mercado": "Futuros JPX",
        "open": "_Open",
        "high": "_High",
        "low": "_Low",
        "close": "_Close",
    },
]

RECHAZOS_ESPERADOS = {
    "train": {"apertura": 97, "cierre": 10},
    "test": {"apertura": 0, "cierre": 0},
}

# Modelado: cortes por identificador, no por filas filtradas de cada objetivo.
DIR_MODELADO = DIR_PROCESSED / "modelado"
DIR_MODELOS = DIR_MODELADO / "modelos"
DIR_GRAFICOS_MODELOS = DIR_MODELADO / "graficos"
RUTA_CONTRATO_MODELOS = DIR_MODELADO / "03_contrato.json"
RUTA_DIAGNOSTICOS = DIR_MODELADO / "04_diagnosticos.json"
RUTA_GRID_TABULAR = DIR_MODELADO / "05_grid_tabular.csv"
RUTA_GRID_TEMPORAL = DIR_MODELADO / "06_grid_temporal.csv"
RUTA_SELECCION = DIR_MODELADO / "06_seleccion_congelada.json"
RUTA_METRICAS_PRUEBA = DIR_MODELADO / "07_metricas_prueba.csv"
RUTA_PREDICCIONES_PRUEBA = DIR_MODELADO / "07_predicciones_prueba.csv"
RUTA_MANIFIESTO_MODELOS = DIR_MODELADO / "07_manifiesto.json"
RUTA_SELECCION_TABULAR = DIR_MODELADO / "05_seleccion_tabular.json"
RUTA_OOF_TABULAR = DIR_MODELADO / "05_predicciones_oof.csv"
RUTA_AUDITORIA_CORTES = DIR_MODELADO / "05_auditoria_cortes.csv"
RUTA_OOF_TEMPORAL = DIR_MODELADO / "06_predicciones_oof.csv"
RUTA_GRAFICO_RMSE = DIR_GRAFICOS_MODELOS / "08_comparacion_rmse.png"
RUTA_GRAFICO_TRAYECTORIAS = DIR_GRAFICOS_MODELOS / "08_trayectorias_prueba.png"
RUTA_GRAFICO_DISPERSION = DIR_GRAFICOS_MODELOS / "08_dispersion_predicciones.png"
RUTA_GRAFICO_TIEMPO = DIR_GRAFICOS_MODELOS / "08_tiempo_error.png"
RUTA_TIEMPOS_TOTALES = DIR_MODELADO / "08_tiempos_totales.csv"
TARGETS_MODELADO = {
    "target_225": {"lag": 3, "par": "US_Stock_XOM_adj_close - JPX_Gold_Standard_Futures_Close"},
    "target_19": {"lag": 1, "par": "JPX_Gold_Standard_Futures_Close - FX_USDJPY"},
    "target_105": {"lag": 1, "par": "US_Stock_IAU_adj_close - LME_CA_Close"},
    "target_410": {"lag": 4, "par": "FX_EURUSD - LME_AH_Close"},
}
VENTANAS_VALIDACION = [(981, 1176), (1177, 1372), (1373, 1568)]
INICIO_PRUEBA = 1569
FIN_PRUEBA = 1960
FIN_DESARROLLO = INICIO_PRUEBA - 1
DESFASES_HISTORIA = (0, 1, 2, 4, 9)
TOP_K_OLS = (8, 16, 32)
GRID_LIGHTGBM = {
    "num_leaves": (7, 15), "min_child_samples": (30, 60),
    "learning_rate": (0.03, 0.1), "n_estimators": (200, 500),
}
TRATAMIENTOS_EXTREMOS = (False, True)


def ruta_target_preparado(target: str) -> Path:
    return DIR_MODELADO / f"03_{target}.csv"


def ruta_modelo(target: str, familia: str) -> Path:
    return DIR_MODELOS / f"{target}_{familia}.joblib"


def ruta_grafico_diagnostico(target: str) -> Path:
    return DIR_GRAFICOS_MODELOS / f"04_{target}_diagnostico.png"


# Ronda 2: investigacion retrospectiva, sin volver a consultar prueba publicada.
DIR_RONDA2 = DIR_PROCESSED / "modelado_ronda2"
DIR_MODELOS_RONDA2 = DIR_RONDA2 / "modelos"
RUTA_CONTRATO_RONDA2 = DIR_RONDA2 / "09_contrato.json"
RUTA_DICCIONARIO_RONDA2 = DIR_RONDA2 / "09_diccionario.csv"
RUTA_GRID_RONDA2 = DIR_RONDA2 / "10_grid_interno.csv"
RUTA_PRED_RONDA2 = DIR_RONDA2 / "10_predicciones_externas.csv"
RUTA_METRICAS_RONDA2 = DIR_RONDA2 / "10_metricas_externas.csv"
RUTA_SELECCION_EXTERNA_RONDA2 = DIR_RONDA2 / "10_seleccion_por_outer.json"
RUTA_GRID_FINAL_RONDA2 = DIR_RONDA2 / "11_grid_final_interno.csv"
RUTA_FREEZE_RONDA2 = DIR_RONDA2 / "11_seleccion_congelada.json"
RUTA_RESUMEN_RONDA2 = DIR_RONDA2 / "11_resumen.json"
DIR_CACHE_RONDA2 = DIR_RONDA2 / "cache_pipeline"
FIN_ETIQUETAS_RONDA2 = 1563
CORTES_EXTERNOS_RONDA2 = ((981, 1176), (1177, 1372), (1373, FIN_ETIQUETAS_RONDA2))
TAMANO_INTERNO_RONDA2 = 96
VENTANAS_RECENCIA_RONDA2 = (None, 768)
HORIZONTES_FEATURES_RONDA2 = (1, 5, 20)
FUENTES_FEATURES_RONDA2 = ("original_nativo", "original_ffill1", "dinamico_nativo", "dinamico_ffill1")
SHRINK_RONDA2 = (0., .25, .5, 1.)
ALPHAS_RIDGE_RONDA2 = (1., 10., 100., 1000., 10000.)


def ruta_features_ronda2(target: str) -> Path:
    return DIR_RONDA2 / f"09_{target}.joblib"


def ruta_modelo_ronda2(target: str, familia: str) -> Path:
    return DIR_MODELOS_RONDA2 / f"{target}_{familia}.joblib"

# Comprobacion adicional separada; no cambia rutas/modelos de las rondas anteriores.
DIR_COMPROBACION = DIR_RONDA2 / "comprobacion12"
DIR_CACHE_COMPROBACION = DIR_COMPROBACION / "cache"
RUTA_CONTRATO_COMPROBACION = DIR_COMPROBACION / "12_contrato.json"
RUTA_GRID_COMPROBACION = DIR_COMPROBACION / "12_grid.csv"
RUTA_METRICAS_COMPROBACION = DIR_COMPROBACION / "12_metricas.csv"
RUTA_PRED_COMPROBACION = DIR_COMPROBACION / "12_predicciones.csv"
RUTA_SELECCIONES_COMPROBACION = DIR_COMPROBACION / "12_selecciones.json"
RUTA_FREEZE_COMPROBACION = DIR_COMPROBACION / "13_seleccion_congelada.json"
RUTA_GRID_FINAL_COMPROBACION = DIR_COMPROBACION / "13_grid_final.csv"
DIR_MODELOS_COMPROBACION = DIR_COMPROBACION / "modelos"

# Ronda3: ablacion contextual/cociente y politica de refit20, aislada de anteriores.
DIR_RONDA3 = DIR_PROCESSED / "modelado_ronda3"
DIR_CACHE_RONDA3 = DIR_RONDA3 / "cache"
DIR_MODELOS_RONDA3 = DIR_RONDA3 / "modelos"
DIR_CHECKPOINTS_RONDA3 = DIR_RONDA3 / "checkpoints"
RUTA_CONTRATO_RONDA3 = DIR_RONDA3 / "14_contrato.json"
RUTA_DICCIONARIO_RONDA3 = DIR_RONDA3 / "14_diccionario.csv"
RUTA_GRID_RONDA3 = DIR_RONDA3 / "15_grid.csv"
RUTA_PRED_RONDA3 = DIR_RONDA3 / "15_predicciones.csv"
RUTA_METRICAS_RONDA3 = DIR_RONDA3 / "15_metricas.csv"
RUTA_DECISIONES_RONDA3 = DIR_RONDA3 / "15_decisiones.json"
RUTA_AUDITORIA_RONDA3 = DIR_RONDA3 / "15_ajustes.csv"
RUTA_GRID_FINAL_RONDA3 = DIR_RONDA3 / "16_grid_final.csv"
RUTA_FREEZE_RONDA3 = DIR_RONDA3 / "16_freeze.json"
RUTA_RESUMEN_RONDA3 = DIR_RONDA3 / "16_resumen.json"
FRECUENCIA_REFIT_RONDA3 = 20
SHRINK_RONDA3 = (0., .5, 1.)
CONTEXTOS_RONDA3 = {
    "target_225": ("US_Stock_XOM_adj_close", "US_Stock_CVX_adj_close", "US_Stock_BP_adj_close", "US_Stock_COP_adj_close", "US_Stock_XLE_adj_close", "US_Stock_IAU_adj_close", "US_Stock_GLD_adj_close", "JPX_Gold_Standard_Futures_Close", "FX_USDJPY", "FX_EURUSD"),
    "target_19": ("JPX_Gold_Standard_Futures_Close", "US_Stock_IAU_adj_close", "US_Stock_GLD_adj_close", "US_Stock_SLV_adj_close", "FX_USDJPY", "FX_EURUSD", "FX_USDCHF"),
    "target_105": ("US_Stock_IAU_adj_close", "US_Stock_GLD_adj_close", "US_Stock_SLV_adj_close", "US_Stock_FCX_adj_close", "US_Stock_SCCO_adj_close", "US_Stock_VALE_adj_close", "LME_CA_Close", "FX_EURUSD", "FX_USDJPY"),
    "target_410": ("LME_AH_Close", "LME_CA_Close", "US_Stock_EMB_adj_close", "US_Stock_VCIT_adj_close", "US_Stock_LQD_adj_close", "US_Stock_BNDX_adj_close", "FX_EURUSD", "FX_USDJPY"),
}


def ruta_features_ronda3(target: str) -> Path:
    return DIR_RONDA3 / f"14_{target}.joblib"


# Comprobacion C: dos extremos del cociente; no sustituye el selector A/B.
DIR_COCIENTE = DIR_RONDA3 / "comprobacion17"
DIR_CACHE_COCIENTE = DIR_COCIENTE / "cache"
DIR_MODELOS_COCIENTE = DIR_COCIENTE / "modelos"
RUTA_CONTRATO_COCIENTE = DIR_COCIENTE / "17_contrato.json"
RUTA_GRID_COCIENTE = DIR_COCIENTE / "17_grid.csv"
RUTA_GRID_FINAL_COCIENTE = DIR_COCIENTE / "17_grid_final.csv"
RUTA_METRICAS_COCIENTE = DIR_COCIENTE / "17_metricas.csv"
RUTA_PRED_COCIENTE = DIR_COCIENTE / "17_predicciones.csv"
RUTA_DECISIONES_COCIENTE = DIR_COCIENTE / "17_decisiones.json"
RUTA_AJUSTES_COCIENTE = DIR_COCIENTE / "17_ajustes.csv"
RUTA_FREEZE_COCIENTE = DIR_COCIENTE / "17_freeze.json"

# Diagnostico posterior sin nuevos fits: respaldo AB/cero elegido internamente.
DIR_RESPALDO = DIR_RONDA3 / "comprobacion18"
RUTA_METRICAS_RESPALDO = DIR_RESPALDO / "18_metricas.csv"
RUTA_PRED_RESPALDO = DIR_RESPALDO / "18_predicciones.csv"
RUTA_DECISIONES_RESPALDO = DIR_RESPALDO / "18_decisiones.json"

# Ablacion de longitud de validacion interna, separada de A/B y C.
DIR_VALIDACION_EXTENSA = DIR_RONDA3 / "comprobacion19"
DIR_CACHE_VALIDACION_EXTENSA = DIR_VALIDACION_EXTENSA / "cache"
DIR_MODELOS_VALIDACION_EXTENSA = DIR_VALIDACION_EXTENSA / "modelos"
RUTA_CONTRATO_VALIDACION_EXTENSA = DIR_VALIDACION_EXTENSA / "19_contrato.json"
RUTA_GRID_VALIDACION_EXTENSA = DIR_VALIDACION_EXTENSA / "19_grid.csv"
RUTA_GRID_FINAL_VALIDACION_EXTENSA = DIR_VALIDACION_EXTENSA / "19_grid_final.csv"
RUTA_METRICAS_VALIDACION_EXTENSA = DIR_VALIDACION_EXTENSA / "19_metricas.csv"
RUTA_PRED_VALIDACION_EXTENSA = DIR_VALIDACION_EXTENSA / "19_predicciones.csv"
RUTA_DECISIONES_VALIDACION_EXTENSA = DIR_VALIDACION_EXTENSA / "19_decisiones.json"
RUTA_AJUSTES_VALIDACION_EXTENSA = DIR_VALIDACION_EXTENSA / "19_ajustes.csv"
RUTA_FREEZE_VALIDACION_EXTENSA = DIR_VALIDACION_EXTENSA / "19_freeze.json"

# MLP: aprendizaje compartido de cuatro objetivos, aislado de rondas previas.
DIR_MLP = DIR_PROCESSED / "modelado_mlp"
DIR_MODELOS_MLP = DIR_MLP / "modelos"
DIR_EXTERNOS_MLP = DIR_MLP / "externos"
RUTA_CONTRATO_MLP = DIR_MLP / "20_contrato.json"
RUTA_GRID_MLP = DIR_MLP / "20_grid.csv"
RUTA_PRED_MLP = DIR_MLP / "20_predicciones.csv"
RUTA_METRICAS_MLP = DIR_MLP / "20_metricas.csv"
RUTA_DECISIONES_MLP = DIR_MLP / "20_decisiones.json"
RUTA_AJUSTES_MLP = DIR_MLP / "20_ajustes.csv"
RUTA_GRID_FINAL_MLP = DIR_MLP / "21_grid_final.csv"
RUTA_FREEZE_MLP = DIR_MLP / "21_freeze.json"
MLP_ANCHOS = (32, 64)
MLP_WEIGHT_DECAY = (0.001, 0.01)
MLP_LEARNING_RATES = (0.001, 0.003)
MLP_EPOCAS = (20, 60, 120)
MLP_DROPOUT = 0.1

# Ultima hipotesis: LightGBM compartido por roles economicos, aislado de MLP.
DIR_COMPARTIDO = DIR_PROCESSED / "modelado_compartido"
DIR_MODELOS_COMPARTIDO = DIR_COMPARTIDO / "modelos"
DIR_EXTERNOS_COMPARTIDO = DIR_COMPARTIDO / "externos"
RUTA_CONTRATO_COMPARTIDO = DIR_COMPARTIDO / "22_contrato.json"
RUTA_GRID_COMPARTIDO = DIR_COMPARTIDO / "22_grid.csv"
RUTA_PRED_COMPARTIDO = DIR_COMPARTIDO / "22_predicciones.csv"
RUTA_METRICAS_COMPARTIDO = DIR_COMPARTIDO / "22_metricas.csv"
RUTA_DECISIONES_COMPARTIDO = DIR_COMPARTIDO / "22_decisiones.json"
RUTA_AJUSTES_COMPARTIDO = DIR_COMPARTIDO / "22_ajustes.csv"
RUTA_GRID_FINAL_COMPARTIDO = DIR_COMPARTIDO / "23_grid_final.csv"
RUTA_FREEZE_COMPARTIDO = DIR_COMPARTIDO / "23_freeze.json"
GRID_COMPARTIDO = {
    "num_leaves": (7, 15),
    "min_child_samples": (30, 60),
    "learning_rate": (.03, .1),
    "n_estimators": (100, 300),
    "reg_lambda": (1., 10.),
}

# Referencia externa: pesos publicados, sin entrenamiento de nuestro equipo.
DIR_EXTERNO = DIR_PROCESSED / "modelado_externo"
DIR_FUENTE_EXTERNO = DIR_EXTERNO / "fuente"
RUTA_MANIFIESTO_EXTERNO = DIR_EXTERNO / "manifiesto_fuente.json"
RUTA_PARAMETROS_EXTERNO = DIR_EXTERNO / "parametros_seguros.npz"
RUTA_PCA_EXTERNO = DIR_EXTERNO / "24_features_pca.npz"
RUTA_CONTRATO_EXTERNO = DIR_EXTERNO / "24_contrato.json"
RUTA_PRED_EXTERNO = DIR_EXTERNO / "25_predicciones_424.csv"
RUTA_SELECCION_EXTERNO = DIR_EXTERNO / "25_predicciones_seleccionadas.csv"
RUTA_REPLAY_EXTERNO = DIR_EXTERNO / "25_reproduccion.json"
RUTA_FUTURO_EXTERNO = DIR_EXTERNO / "25_prediccion_siguiente.csv"
SHA_FUENTE_EXTERNO = "357e8352e7eff9ac10b54d992e61ac6564be8034"
URL_FUENTE_EXTERNO = (
    "https://github.com/Hayden1629/mitsui_commodity/tree/"
    + SHA_FUENTE_EXTERNO + "/FINAL_LSTM"
)
INICIO_REPLAY_EXTERNO = 1827
FIN_REPLAY_EXTERNO = 1960
TOLERANCIA_REPLAY_EXTERNO = 1e-6

# Comparacion retrospectiva de modelos ya congelados, sin nuevos ajustes.
INICIO_COMPARACION_EXTERNO = 1832
RUTA_METRICAS_COMPARACION_EXTERNO = DIR_EXTERNO / "26_metricas_comparacion.csv"
RUTA_PRED_COMPARACION_EXTERNO = DIR_EXTERNO / "26_predicciones_comparacion.csv"
RUTA_AUDITORIA_COMPARACION_EXTERNO = DIR_EXTERNO / "26_auditoria_comparacion.json"

# Final four-family comparison; historical 26_* outputs remain untouched.
FINAL_EVALUATION_DIR = DIR_EXTERNO / "final_comparison"
FINAL_METRICS_PATH = FINAL_EVALUATION_DIR / "metrics.csv"
FINAL_PREDICTIONS_PATH = FINAL_EVALUATION_DIR / "predictions.csv"
FINAL_AUDIT_PATH = FINAL_EVALUATION_DIR / "audit.json"
