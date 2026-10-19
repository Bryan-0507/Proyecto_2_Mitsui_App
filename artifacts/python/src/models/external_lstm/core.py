"""Preparacion e inferencia externa, sin entrenamiento ni ejecucion de pickle."""
from __future__ import annotations

import hashlib
import io
import json
import math
import pickletools
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from torch import nn

GLOBALES_DATOS = {
    ("sklearn.preprocessing._data", "RobustScaler"),
    ("sklearn.decomposition._pca", "PCA"),
    ("joblib.numpy_pickle", "NumpyArrayWrapper"),
    ("numpy", "ndarray"), ("numpy", "dtype"),
    ("numpy._core.multiarray", "_reconstruct"),
    ("numpy.core.multiarray", "_reconstruct"),
    ("numpy._core.multiarray", "scalar"),
    ("numpy.core.multiarray", "scalar"),
}
MAX_ARCHIVO = 2_000_000
MAX_ELEMENTOS = 300_000
MARCA = object()


def sha(ruta):
    return hashlib.sha256(Path(ruta).read_bytes()).hexdigest()


class Registro:
    """Etiqueta inerte: no importa ni instancia clases del archivo externo."""
    def __init__(self, tipo, estado=None):
        self.tipo = tipo
        self.estado = estado or {}


def leer_joblib_estatico(ruta):
    """Interpreta datos limitados; nunca usa pickle.load, joblib.load o GLOBAL real.

    Joblib intercala bloques de ndarray con opcodes. FRAME solo delimita bytes
    de pickle; los bloques numericos se leen explicitamente tras BUILD wrapper.
    Un opcode, clase, reducer o tamano no permitido provoca rechazo inmediato.
    """
    if Path(ruta).stat().st_size > MAX_ARCHIVO:
        raise ValueError("Archivo externo demasiado grande")
    datos = Path(ruta).read_bytes()
    if len(datos) > MAX_ARCHIVO:
        raise ValueError("Archivo externo demasiado grande")
    stream = io.BytesIO(datos)

    def interpretar(profundidad=0):
        if profundidad > 2:
            raise ValueError("Recursion externa excesiva")
        pila, memo = [], {}

        def quitar_marca():
            indice = next((i for i in range(len(pila)-1, -1, -1)
                           if pila[i] is MARCA), None)
            if indice is None:
                raise ValueError("MARK ausente")
            valores = pila[indice+1:]
            del pila[indice:]
            return valores

        for numero_op, (op, argumento, _) in enumerate(pickletools.genops(stream)):
            if numero_op > 100000:
                raise ValueError("Limite de opcodes excedido")
            if len(pila) > 10000 or len(memo) > 20000:
                raise ValueError("Limite de estructuras excedido")
            nombre = op.name
            if nombre in {"PROTO", "FRAME"}:
                continue
            if nombre == "MARK":
                pila.append(MARCA)
            elif nombre in {"BININT", "BININT1", "BININT2", "LONG1", "BINFLOAT",
                            "SHORT_BINUNICODE", "BINUNICODE", "SHORT_BINBYTES", "BINBYTES"}:
                pila.append(argumento)
            elif nombre in {"NONE", "NEWTRUE", "NEWFALSE"}:
                pila.append({"NONE": None, "NEWTRUE": True, "NEWFALSE": False}[nombre])
            elif nombre in {"EMPTY_DICT", "EMPTY_LIST", "EMPTY_TUPLE"}:
                pila.append({"EMPTY_DICT": dict, "EMPTY_LIST": list,
                             "EMPTY_TUPLE": tuple}[nombre]())
            elif nombre in {"MEMOIZE", "BINPUT", "LONG_BINPUT"}:
                memo[len(memo) if nombre == "MEMOIZE" else argumento] = pila[-1]
            elif nombre in {"BINGET", "LONG_BINGET"}:
                pila.append(memo[argumento])
            elif nombre in {"TUPLE1", "TUPLE2", "TUPLE3"}:
                n = int(nombre[-1]); valores = pila[-n:]; del pila[-n:]
                pila.append(tuple(valores))
            elif nombre == "TUPLE":
                pila.append(tuple(quitar_marca()))
            elif nombre == "APPENDS":
                valores = quitar_marca(); pila[-1].extend(valores)
            elif nombre == "APPEND":
                valor = pila.pop(); pila[-1].append(valor)
            elif nombre == "SETITEMS":
                valores = quitar_marca()
                if len(valores) % 2:
                    raise ValueError("Diccionario invalido")
                pila[-1].update(zip(valores[::2], valores[1::2]))
            elif nombre == "SETITEM":
                valor = pila.pop(); clave = pila.pop(); pila[-1][clave] = valor
            elif nombre == "STACK_GLOBAL":
                simbolo = pila.pop(); modulo = pila.pop(); etiqueta = (modulo, simbolo)
                if etiqueta not in GLOBALES_DATOS:
                    raise ValueError(f"GLOBAL rechazado: {etiqueta}")
                pila.append(etiqueta)
            elif nombre == "NEWOBJ":
                args = pila.pop(); etiqueta = pila.pop()
                if args != () or etiqueta not in GLOBALES_DATOS:
                    raise ValueError("NEWOBJ rechazado")
                pila.append(Registro(etiqueta))
            elif nombre == "REDUCE":
                args = pila.pop(); etiqueta = pila.pop()
                if etiqueta == ("numpy", "dtype") and args[0] in {"f4", "f8", "i8", "O8"}:
                    pila.append(Registro("dtype", {"codigo": args[0]}))
                elif etiqueta in {("numpy._core.multiarray", "_reconstruct"),
                                   ("numpy.core.multiarray", "_reconstruct")}:
                    if args != (("numpy", "ndarray"), (0,), b"b"):
                        raise ValueError("Reconstruccion ndarray rechazada")
                    pila.append(Registro("ndarray"))
                elif etiqueta in {("numpy._core.multiarray", "scalar"),
                                   ("numpy.core.multiarray", "scalar")}:
                    dtype = args[0]
                    if not isinstance(dtype, Registro) or dtype.tipo != "dtype":
                        raise ValueError("Escalar rechazado")
                    dt = np.dtype(dtype.estado["codigo"])
                    if dt.hasobject or len(args[1]) != dt.itemsize:
                        raise ValueError("Escalar no numerico")
                    pila.append(np.frombuffer(args[1], dtype=dt)[0])
                else:
                    raise ValueError(f"REDUCE rechazado: {etiqueta}")
            elif nombre == "BUILD":
                estado = pila.pop(); objeto = pila[-1]
                if not isinstance(objeto, Registro):
                    raise ValueError("BUILD no inerte")
                if objeto.tipo == "dtype":
                    if (not isinstance(estado, tuple) or len(estado) != 8 or
                            estado[0] != 3 or estado[1] not in {"<", "=", "|"} or
                            estado[2:5] != (None, None, None) or
                            estado[5:7] != (-1, -1) or estado[7] not in {0, 63}):
                        raise ValueError("Endian no soportado")
                elif objeto.tipo == "ndarray":
                    # Solo la lista de nombres, nunca ndarray de objetos ejecutables.
                    if len(estado) != 5 or estado[0] != 1 or not isinstance(estado[4], list) or not all(
                            isinstance(x, str) for x in estado[4]):
                        raise ValueError("Array de objetos rechazado")
                    if len(estado[4]) > 4096 or any(len(x)>256 for x in estado[4]):
                        raise ValueError("Array demasiado grande")
                    pila[-1] = np.asarray(estado[4], dtype=str)
                elif objeto.tipo == ("joblib.numpy_pickle", "NumpyArrayWrapper"):
                    if set(estado) != {"subclass", "shape", "order", "dtype", "allow_mmap", "numpy_array_alignment_bytes"}:
                        raise ValueError("Campos wrapper inesperados")
                    if estado["subclass"] != ("numpy", "ndarray"):
                        raise ValueError("Subclass no permitida")
                    shape = estado["shape"]
                    if not isinstance(shape, tuple) or len(shape) > 2 or any(
                            not isinstance(n, int) or n < 0 or n > MAX_ELEMENTOS for n in shape):
                        raise ValueError("Forma no permitida")
                    n = math.prod(shape)
                    if n > MAX_ELEMENTOS or estado["order"] not in {"C", "F"}:
                        raise ValueError("Tamano/orden no permitido")
                    tipo = estado["dtype"]
                    if not isinstance(tipo, Registro) or tipo.tipo != "dtype":
                        raise ValueError("dtype wrapper no permitido")
                    dtype = np.dtype(tipo.estado["codigo"])
                    if dtype.hasobject:
                        if len(shape) != 1 or n > 4096:
                            raise ValueError("Array de nombres demasiado grande")
                        valor = interpretar(profundidad+1)
                        if not isinstance(valor, np.ndarray) or valor.dtype.kind != "U" or valor.shape != shape:
                            raise ValueError("Objeto externo no es lista de nombres")
                    else:
                        alineacion = estado.get("numpy_array_alignment_bytes")
                        if alineacion is not None:
                            if alineacion != 16:
                                raise ValueError("Alineacion no soportada")
                            padding = stream.read(1)
                            if not padding or padding[0] > 16:
                                raise ValueError("Padding invalido")
                            stream.read(padding[0])
                        bloque = stream.read(n*dtype.itemsize)
                        if len(bloque) != n*dtype.itemsize:
                            raise ValueError("Array truncado")
                        valor = np.frombuffer(bloque, dtype=dtype).copy().reshape(shape, order=estado["order"])
                    pila[-1] = valor
                elif objeto.tipo in {("sklearn.preprocessing._data", "RobustScaler"),
                                     ("sklearn.decomposition._pca", "PCA")}:
                    if not isinstance(estado, dict):
                        raise ValueError("Estado invalido")
                    objeto.estado = estado
                else:
                    raise ValueError("BUILD desconocido")
            elif nombre == "STOP":
                if len(pila) != 1:
                    raise ValueError("Pila invalida")
                return pila[0]
            else:
                raise ValueError(f"Opcode rechazado: {nombre}")
        raise ValueError("Archivo sin STOP")

    try:
        resultado = interpretar()
    except (IndexError, KeyError, TypeError, StopIteration, OverflowError) as exc:
        raise ValueError("Archivo externo malformado") from exc
    if stream.tell() != len(datos) or not isinstance(resultado, Registro):
        raise ValueError("Datos adicionales o raiz invalida")
    return resultado


def extraer_parametros(scaler_ruta, pca_ruta, columnas):
    scaler = leer_joblib_estatico(scaler_ruta)
    pca = leer_joblib_estatico(pca_ruta)
    if scaler.tipo != ("sklearn.preprocessing._data", "RobustScaler") or pca.tipo != ("sklearn.decomposition._pca", "PCA"):
        raise ValueError("Tipos externos incorrectos")
    s, p = scaler.estado, pca.estado
    if not (s["with_centering"] and s["with_scaling"] and not p["whiten"]):
        raise ValueError("Preparacion desconocida")
    if list(s["feature_names_in_"]) != columnas:
        raise ValueError("Orden de nombres externo incompatible")
    if not (s["center_"].shape == s["scale_"].shape == p["mean_"].shape == (2064,) and p["components_"].shape == (100, 2064)):
        raise ValueError("Dimensiones externas incompatibles")
    parametros = {"center": s["center_"], "scale": s["scale_"],
                  "pca_mean": p["mean_"], "components": p["components_"]}
    if not all(np.isfinite(v).all() for v in parametros.values()) or not (parametros["scale"]>0).all():
        raise ValueError("Parametros externos no finitos o escala invalida")
    return parametros


def construir_features(df, pares, rellenar_pct=False):
    """Replica causal validada: pct_change sin relleno previo de ausencias."""
    if not np.array_equal(df.date_id, np.arange(len(df))):
        raise ValueError("Historia debe mantener IDs consecutivos desde0")
    instrumentos = set()
    pares_unicos = []
    for texto in pares["pair"]:
        partes = tuple(x.strip() for x in texto.split(" - ", 1))
        instrumentos.update(partes)
        if len(partes) == 2 and partes not in pares_unicos:
            pares_unicos.append(partes)
    columnas = sorted(c for c in instrumentos if c in df)
    features = {}

    def retorno(s, h):
        s = s.ffill() if rellenar_pct else s
        return s.pct_change(h, fill_method=None)

    for col in columnas:
        for h in (1, 2, 5, 10, 20):
            features[f"{col}_ret{h}"] = retorno(df[col], h)
    for col in columnas:
        ret = retorno(df[col], 1)
        for w in (5, 20):
            features[f"{col}_vol{w}"] = ret.rolling(w).std()
            features[f"{col}_mom{w}"] = ret.rolling(w).mean()
    # Orden vol5,vol20,mom5,mom20 se restablece con eng_cols del autor.
    for a, b in pares_unicos:
        if a not in df or b not in df:
            continue
        clave = f"{a}__{b}"; spread = df[a]-df[b]
        features[f"{clave}_sret1"] = retorno(spread, 1)
        features[f"{clave}_sret5"] = retorno(spread, 5)
        features[f"{clave}_relmom5"] = retorno(df[a], 5)-retorno(df[b], 5)
    return pd.DataFrame(features).replace([np.inf, -np.inf], np.nan).fillna(0.)


def transformar(features, parametros):
    escalado = np.clip(((features.to_numpy()-parametros["center"])/parametros["scale"]).astype(np.float32), -5, 5)
    # sklearn PCA transforma como X@components.T - mean@components.T.
    salida = escalado @ parametros["components"].T
    salida -= parametros["pca_mean"].reshape(1, -1) @ parametros["components"].T
    return salida.astype(np.float32)


class LSTMExterna(nn.Module):
    def __init__(self):
        super().__init__()
        self.lstm = nn.LSTM(100, 32, num_layers=1, batch_first=True)
        self.norm = nn.LayerNorm(32)
        self.head = nn.Sequential(nn.Linear(32, 32), nn.GELU(), nn.Dropout(.4), nn.Linear(32, 424))

    def forward(self, x):
        salida, _ = self.lstm(x)
        return self.head(self.norm(salida[:, -1, :]))


def predecir(pca, origenes, fuente):
    if not all(isinstance(t, (int, np.integer)) and 20 <= t <= len(pca) for t in origenes):
        raise ValueError("Origen sin historia suficiente")
    torch.set_num_threads(1)
    torch.use_deterministic_algorithms(True)
    ventanas = np.stack([pca[t-20:t] for t in origenes])
    if ventanas.shape != (len(origenes), 20, 100) or not np.isfinite(ventanas).all():
        raise ValueError("Ventana de inferencia invalida")
    resultados = []
    with torch.inference_mode():
        for seed in range(5):
            estado = torch.load(Path(fuente)/f"model_seed{seed}.pt", map_location="cpu", weights_only=True)
            if not isinstance(estado, dict) or not all(isinstance(v, torch.Tensor) for v in estado.values()):
                raise ValueError("Checkpoint no contiene exclusivamente tensores")
            modelo = LSTMExterna(); modelo.load_state_dict(estado, strict=True); modelo.eval()
            # Un origen por batch replica la forma numerica usada por el autor.
            resultados.append(np.stack([modelo(torch.from_numpy(x[None])).numpy()[0] for x in ventanas]))
    salida = np.mean(resultados, axis=0)
    if salida.shape != (len(origenes), 424) or not np.isfinite(salida).all():
        raise ValueError("Salida externa invalida")
    return salida
