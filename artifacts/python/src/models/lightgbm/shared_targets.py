"""Roles economicos causales, formato largo y LightGBM con cabezas balanceadas."""
import itertools
import time
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
import src.config as C
from src.shared.modeling import metricas,hash_archivo

VENTANAS_CAMBIO=(1,5,20)
VENTANAS_MOVILES=(5,20)
MERCADOS=("US","JPX","LME","FX")
CATEGORICAS=("target_id","mercado_A","mercado_B")


def mercado(nombre):
    for m in MERCADOS:
        if nombre.startswith(m+"_"):return m
    raise ValueError("Mercado no reconocido")


def verificar_pares():
    pares=pd.read_csv(C.RUTA_TARGET_PAIRS).set_index("target")
    for t,meta in C.TARGETS_MODELADO.items():
        if pares.loc[t,"pair"]!=meta["par"] or int(pares.loc[t,"lag"])!=meta["lag"]:raise ValueError("Contrato del target no coincide con target_pairs")


def features_roles(X,target):
    if not X.index.equals(pd.Index(range(len(X)),name=X.index.name)):raise ValueError("Roles requieren prefijo sin comprimir")
    a,b=C.TARGETS_MODELADO[target]["par"].split(" - ");f={};retornos={}
    for rol,col in (("A",a),("B",b)):
        precio=X[col].where(np.isfinite(X[col])&(X[col]>0))
        cambios={k:precio/precio.shift(k)-1 for k in VENTANAS_CAMBIO}
        retornos[rol]=cambios
        for k,v in cambios.items():f[f"{rol}_cambio{k}"]=v
        for k in VENTANAS_MOVILES:
            f[f"{rol}_vol{k}"]=cambios[1].rolling(k,min_periods=k).std(ddof=0)
            f[f"{rol}_desvio{k}"]=precio/precio.rolling(k,min_periods=k).mean()-1
        f[f"{rol}_ausente"]=precio.isna().astype(float)
        f[f"{rol}_cobertura20"]=precio.notna().astype(float).rolling(20,min_periods=20).sum()
    for k in VENTANAS_CAMBIO:f[f"diferencia{k}"]=retornos["A"][k]-retornos["B"][k]
    f["correlacion20"]=retornos["A"][1].rolling(20,min_periods=20).corr(retornos["B"][1])
    f["horizonte"]=float(C.TARGETS_MODELADO[target]["lag"])
    out=pd.DataFrame(f,index=X.index).replace([np.inf,-np.inf],np.nan)
    out["target_id"]=pd.Categorical([target]*len(X),categories=list(C.TARGETS_MODELADO))
    out["mercado_A"]=pd.Categorical([mercado(a)]*len(X),categories=MERCADOS)
    out["mercado_B"]=pd.Categorical([mercado(b)]*len(X),categories=MERCADOS)
    if out.shape[1]!=26:raise ValueError("Esquema rolefeatures inesperado")
    return out


def cargar_datos():
    verificar_pares()
    X=pd.read_csv(C.RUTA_TRAIN_FINAL,nrows=C.FIN_DESARROLLO+1).set_index("date_id")
    Y=pd.read_csv(C.RUTA_TRAIN_LABELS,nrows=C.FIN_ETIQUETAS_RONDA2+1,usecols=["date_id",*C.TARGETS_MODELADO]).set_index("date_id")
    if not X.index.equals(pd.Index(range(C.FIN_DESARROLLO+1),name="date_id")) or not Y.index.equals(pd.Index(range(C.FIN_ETIQUETAS_RONDA2+1),name="date_id")):raise ValueError("Datos compartidos no alineados")
    Y=Y.reindex(X.index).loc[:,list(C.TARGETS_MODELADO)]
    if np.isinf(Y.to_numpy()).any():raise ValueError("Etiqueta infinita")
    return {t:features_roles(X,t) for t in Y},Y


def cortes(inicio=None,final=False):
    fin=C.FIN_ETIQUETAS_RONDA2 if final else inicio-6
    return [(fin-391,fin-196),(fin-195,fin)]


def preparar(Y,origen):
    fin=min(origen-6,C.FIN_ETIQUETAS_RONDA2);yy=Y.loc[:fin]
    media=yy.mean().to_dict();desv=yy.std(ddof=0).to_dict();n=yy.notna().sum().to_dict()
    if any(n[t]<2 or not np.isfinite(media[t]) or not np.isfinite(desv[t]) or desv[t]<=0 for t in Y):raise ValueError("Cabeza sin etiquetas/escala")
    return {"media_y":media,"std_y":desv,"n_labels":n,"origen":origen,"train_fin":fin,"conocido_ajuste":origen-1}


def matriz_larga(F,Y,p,targets):
    piezas,etiquetas,pesos=[],[],[];total=sum(p["n_labels"][t] for t in targets)
    for t in targets:
        ids=Y.loc[:p["train_fin"],t].dropna().index
        piezas.append(F[t].loc[ids]);etiquetas.extend(((Y.loc[ids,t]-p["media_y"][t])/p["std_y"][t]).tolist())
        w=total/(len(targets)*len(ids)) if len(targets)>1 else 1.
        pesos.extend([w]*len(ids))
    return pd.concat(piezas),np.asarray(etiquetas),np.asarray(pesos)


def perfiles():
    nombres=list(C.GRID_COMPARTIDO)
    return [dict(zip(nombres,v)) for v in itertools.product(*(C.GRID_COMPARTIDO[n] for n in nombres))]


def entrenar(F,Y,p,perfil,targets):
    X,y,w=matriz_larga(F,Y,p,targets)
    t0=time.perf_counter()
    modelo=LGBMRegressor(**perfil,objective="regression",random_state=C.SEMILLA,n_jobs=1,
        deterministic=True,force_col_wise=True,subsample=1.,colsample_bytree=1.,verbosity=-1)
    modelo.fit(X,y,sample_weight=w,categorical_feature=list(CATEGORICAS))
    return {"modelo":modelo,"preparacion":p,"perfil":perfil,"targets":list(targets),"columnas":list(X),
        "categorias":{c:list(X[c].cat.categories) for c in CATEGORICAS},"n_train":len(X),"media_peso":float(w.mean()),
        "suma_pesos_target":{t:float(w[np.asarray(X.target_id==t)].sum()) for t in targets},
        "segundos":time.perf_counter()-t0,"n_arboles":modelo.booster_.num_trees(),"semilla":C.SEMILLA}


def predecir(a,F,ids):
    outputs={};p=a["preparacion"]
    for t in a["targets"]:
        X=F[t].loc[ids]
        if list(X)!=a["columnas"] or any(list(X[c].cat.categories)!=a["categorias"][c] for c in CATEGORICAS):raise ValueError("Esquema/categorias cambiadas")
        values=a["modelo"].predict(X)*p["std_y"][t]+p["media_y"][t]
        if not np.isfinite(values).all():raise ValueError("Prediccion compartida no finita")
        outputs[t]=values
    return pd.DataFrame(outputs,index=ids)


def ordenar(s):
    p=s["perfil"]
    return (-s["r2_interno"],p["num_leaves"],p["n_estimators"],p["min_child_samples"],p["reg_lambda"],p["learning_rate"])


def seleccionar(grid):
    selecciones={}
    for modo in ("compartido","independiente"):
        grupos=[list(C.TARGETS_MODELADO)] if modo=="compartido" else [[t] for t in C.TARGETS_MODELADO]
        for targets in grupos:
            specs=[]
            for num,perfil in enumerate(perfiles()):
                r=grid[(grid.modo==modo)&(grid.candidato==num)&grid.target.isin(targets)]
                if len(r)==2*len(targets) and not r.duplicated(["target","fold_interno"]).any() and set(r.fold_interno)=={1,2} and np.isfinite(r.r2).all() and r.r2_definido.eq(True).all() and (r.estado=="ok").all():
                    specs.append({"modo":modo,"targets":targets,"perfil":perfil,"candidato":num,"r2_interno":float(r.r2.mean())})
            if not specs:raise ValueError("Sin seleccion con todos los R2 definidos")
            selecciones[modo if modo=="compartido" else targets[0]]=min(specs,key=ordenar)
    return selecciones


def buscar(F,Y,bloques,conocido):
    rows=[];fits=0;segundos=0.
    preparados={f:preparar(Y,inicio) for f,(inicio,fin) in enumerate(bloques,1)}
    for modo in ("compartido","independiente"):
        grupos=[list(Y)] if modo=="compartido" else [[t] for t in Y]
        for targets in grupos:
            for num,perfil in enumerate(perfiles()):
                if num%8==0:print(f"[largo] {modo} {'/'.join(targets)} perfil{num+1}/32",flush=True)
                for fold,(inicio,fin) in enumerate(bloques,1):
                    if fin+5>conocido or fin>C.FIN_ETIQUETAS_RONDA2:raise ValueError("Seleccion inmadura")
                    p=preparados[fold];a=entrenar(F,Y,p,perfil,targets);fits+=1;segundos+=a["segundos"]
                    pr=predecir(a,F,Y.loc[inicio:fin].index)
                    for t in targets:
                        ids=Y.loc[inicio:fin,t].dropna().index;m=metricas(Y.loc[ids,t],pr.loc[ids,t])
                        rows.append({"modo":modo,"target":t,"candidato":num,"fold_interno":fold,"inicio_score":inicio,"fin_score":fin,
                            "conocido_seleccion":conocido,"train_fin":p["train_fin"],"conocido_ajuste":p["conocido_ajuste"],
                            "n_train":a["n_train"],"n_arboles":a["n_arboles"],"segundos":a["segundos"],"estado":"ok" if m["r2_definido"] else "r2_indefinido",**m})
    df=pd.DataFrame(rows);df.attrs.update(fits_ejecutados=fits,segundos_fit=segundos)
    validar_grid(df,externo=False)
    return seleccionar(df),df


def validar_grid(g,externo=True):
    keys=["modo","target","candidato","fold_interno"]
    esperado={(mode,t,c,f) for mode in ("compartido","independiente") for t in C.TARGETS_MODELADO for c in range(len(perfiles())) for f in (1,2)}
    if externo:keys=["outer",*keys];esperado={(o,*k) for o in (1,2,3) for k in esperado}
    if g.duplicated(keys).any() or set(g[keys].itertuples(index=False,name=None))!=esperado:raise ValueError("Grid largo parcial/duplicado")
    if not ((g.estado=="ok")&np.isfinite(g.r2)&g.r2_definido.eq(True)&(g.n>1)).all():raise ValueError("Grid largo R2 indefinido")
    return True


def snapshot_previos():
    out={}
    for carpeta in (C.DIR_RAW,C.DIR_MODELADO,C.DIR_RONDA2,C.DIR_RONDA3,C.DIR_MLP):
        for p in carpeta.rglob("*"):
            if p.is_file() and not any("cache" in parte for parte in p.relative_to(carpeta).parts):out[str(p)]=hash_archivo(p)
    out[str(C.RUTA_TRAIN_FINAL)]=hash_archivo(C.RUTA_TRAIN_FINAL)
    return out


def verificar_snapshot(s):
    if not all(hash_archivo(Path(p))==sha for p,sha in s.items()):raise ValueError("Archivo previo modificado")


def auditar(m,pr,d,g,aud,F,Y):
    validar_grid(g)
    expected={(t,o,p) for t in Y for o in (1,2,3) for p in ("lgb_compartido","lgb_independiente","cero","media")}
    for f in (m,pr):
        if set(f[["target","outer","procedimiento"]].itertuples(index=False,name=None))!=expected:raise ValueError("Matriz larga parcial")
    if len(m)!=48 or m.duplicated(["target","outer","procedimiento"]).any() or pr.duplicated(["target","outer","procedimiento","date_id"]).any():raise ValueError("Duplicados largos")
    if not (np.isfinite(m.r2)&m.r2_definido.eq(True)&(m.n>1)).all():raise ValueError("Metricas largas R2 indefinido")
    for o,(inicio,fin) in enumerate(C.CORTES_EXTERNOS_RONDA2,1):
        specs=seleccionar(g[g.outer==o]);reg=d[str(o)]["seleccion"]
        if set(specs)!=set(reg) or not d[str(o)]["antes_score"]:raise ValueError("Decision larga no interna")
        for k,s in specs.items():
            if any(s[c]!=reg[k][c] for c in ("modo","targets","perfil","candidato")) or not np.isclose(s["r2_interno"],reg[k]["r2_interno"],rtol=1e-10,atol=1e-12):raise ValueError("Selector largo no reproduce grid")
        for t in Y:
            truth=Y.loc[inicio:fin,t].dropna()
            for name in ("lgb_compartido","lgb_independiente","cero","media"):
                f=pr[(pr.outer==o)&(pr.target==t)&(pr.procedimiento==name)].set_index("date_id").sort_index()
                if not f.index.equals(truth.index) or not np.allclose(f.real,truth,rtol=0,atol=1e-12) or not np.isfinite(f.prediccion).all():raise ValueError("Verdad larga incompatible")
                row=m[(m.outer==o)&(m.target==t)&(m.procedimiento==name)].iloc[0]
                for k,v in metricas(f.real,f.prediccion).items():
                    if v is None:
                        ok=pd.isna(row[k])
                    elif isinstance(v,bool):ok=row[k]==v
                    else:ok=np.isclose(v,row[k],rtol=1e-10,atol=1e-12)
                    if not ok:raise ValueError("Metricas largas incompatibles")
    for row in g.itertuples():
        u=C.CORTES_EXTERNOS_RONDA2[row.outer-1][0];begin,end=cortes(u)[row.fold_interno-1]
        if (row.inicio_score,row.fin_score,row.train_fin,row.conocido_ajuste,row.conocido_seleccion)!=(begin,end,begin-6,begin-1,u-1):raise ValueError("Cortes largos invalidos")
    expected_a={(o,"compartido","|".join(Y)) for o in (1,2,3)}|{(o,"independiente",t) for o in (1,2,3) for t in Y}
    if len(aud)!=15 or aud.duplicated(["outer","modo","targets"]).any() or set(aud[["outer","modo","targets"]].itertuples(index=False,name=None))!=expected_a:raise ValueError("Ajustes largos incompletos")
    for row in aud.itertuples():
        ruta=Path(row.archivo)
        if hash_archivo(ruta)!=row.sha256:raise ValueError("Checkpoint largo modificado")
        a=joblib.load(ruta);inicio,fin=C.CORTES_EXTERNOS_RONDA2[row.outer-1]
        key="compartido" if row.modo=="compartido" else row.targets;spec=d[str(row.outer)]["seleccion"][key]
        expected_p=preparar(Y,inicio)
        if a["preparacion"]!=expected_p or a["perfil"]!=spec["perfil"] or a["targets"]!=spec["targets"] or (row.inicio_score,row.fin_score,row.train_fin,row.conocido_ajuste)!=(inicio,fin,inicio-6,inicio-1):raise ValueError("Metadatos largos invalidos")
        if a["n_train"]!=sum(expected_p["n_labels"][t] for t in a["targets"]) or row.n_train!=a["n_train"] or row.n_arboles!=a["modelo"].booster_.num_trees():raise ValueError("Tamano/arboles largos incompatibles")
        if not np.isclose(a["media_peso"],1):raise ValueError("Peso medio no unitario")
        if len(a["targets"])>1 and not np.allclose(list(a["suma_pesos_target"].values()),a["n_train"]/4):raise ValueError("Cabezas no balanceadas")
        values=predecir(a,F,Y.loc[inicio:fin].index)
        for t in a["targets"]:
            f=pr[(pr.outer==row.outer)&(pr.target==t)&(pr.procedimiento=="lgb_"+row.modo)].set_index("date_id").sort_index()
            if not np.allclose(values.loc[f.index,t],f.prediccion,rtol=0,atol=1e-12):raise ValueError("Replay largo falla")
    return True
