# Market Lens

Aplicación académica para comparar modelos de predicción de retornos relativos del MITSUI&CO. Commodity Prediction Challenge. La rama `presentacion` contiene el recorrido reducido para la exposición: Problema, Objetivos, Solución y diseño, Demo, Retos y aprendizajes y Conclusiones y trabajo futuro.

## Ejecutar la aplicación completa

Requisitos: Node.js >=22.12, pnpm 10.33 y Python 3.14. Los modelos serializados se generaron con Python 3.14.7; las versiones de sus bibliotecas están fijadas en `artifacts/python/requirements.txt`. Utiliza esas versiones para evitar incompatibilidades al cargar los modelos.

Los modelos, datos históricos necesarios, contratos y métricas están incluidos en `artifacts/` (aproximadamente 28 MB). No necesitas clonar el repositorio EDA, importar sus archivos ni reentrenar modelos para utilizar esta copia.

Desde la raíz del proyecto, en macOS o Linux:

```sh
pnpm install --frozen-lockfile
python3.14 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r artifacts/python/requirements.txt
pnpm dev --hostname 127.0.0.1 --port 3100
```

Abrir http://127.0.0.1:3100/. La instalación de dependencias requiere Internet; la consulta posterior utiliza archivos locales. Las dependencias de Python, especialmente PyTorch, ocupan más espacio que los modelos incluidos.

En Windows, crear e instalar el entorno con:

```powershell
py -3.14 -m venv .venv
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r artifacts/python/requirements.txt
```

Antes de iniciar Next.js en Windows, crear `.env.local` con:

```dotenv
PYTHON_EXECUTABLE=.venv/Scripts/python.exe
```

En macOS y Linux no hace falta `.env.local`: el proceso utiliza `.venv/bin/python` por defecto. Si ya existe una configuración que apunta al entorno de otra computadora, sustituirla por la ruta local relativa. `.env.example` documenta esta opción; no contiene secretos.

LightGBM puede requerir una biblioteca OpenMP del sistema. Si la importación falla por una biblioteca nativa ausente, instalar la correspondiente a la plataforma; no sustituir arbitrariamente las versiones fijadas de los modelos. La instalación en otras plataformas debe comprobarse antes de la exposición.

## Comprobar la instalación

```sh
pnpm validate
pnpm build
```

Para comprobar la inferencia, abrir Demo, seleccionar ExxonMobil frente a oro, elegir el dateId 1900 y pulsar Comparar modelos. Deben responder regresión lineal, modelo temporal, LightGBM y LSTM externa. La primera consulta puede tardar más al cargar las bibliotecas y modelos.

Si no aparecen los resultados, revisar la terminal de Next.js y comprobar que el intérprete configurado tiene instaladas las dependencias. La app utiliza un proceso Python local, no un servicio Python que deba levantarse manualmente.

## Cómo funciona

La interfaz y el endpoint `POST /api/prediction` están en Next.js. El endpoint valida la solicitud y se comunica mediante JSON Lines con `python/worker.py`. El proceso carga las entradas históricas y la preparación del modelo seleccionado, verifica los archivos contra sus hashes y devuelve la estimación. No entrena durante la consulta.

Las consultas usan dateId históricos con contexto disponible. No son pronósticos en vivo ni implican utilidad financiera. Las evaluaciones iniciales y la comparación retrospectiva con la LSTM externa conservan sus alcances separados.

## Estructura

```text
src/app/                 Rutas, metadata y endpoint de predicción
src/features/            Interfaz y lógica organizadas por funcionalidad
src/components/ui/       Componentes shadcn Base UI
src/i18n/es.json          Textos centralizados en español
python/                  Proceso local y adaptadores de inferencia
artifacts/models/        Modelos propios y pesos de la referencia externa
artifacts/data/          Entradas históricas comprimidas y caché PCA
artifacts/contracts/     Contratos y procedencia
artifacts/evaluation/    Métricas y datos de los gráficos
artifacts/python/        Compatibilidad de serialización y dependencias fijadas
public/                  Figuras, animación y otros recursos públicos
scripts/                 Importación y exportadores reproducibles
```

`artifacts/` no está dentro de `public/` ni se importa directamente en componentes cliente. Los archivos de modelos permanecen en el servidor local. Los manifiestos históricos pueden contener rutas de la computadora de origen; sirven como procedencia y no necesitan existir en la computadora que ejecuta la app.

## Procedencia y precauciones

Los modelos propios y los derivados provienen del repositorio EDA. No modificar pesos, datos o contratos para resolver errores de instalación: la inferencia comprueba su integridad. `scripts/import-artifacts.py` es una herramienta de mantenimiento de la transferencia inicial, no un paso de instalación ni un generador completo de los derivados incorporados después.

La LSTM externa y sus pesos proceden de Hayden1629, revisión `357e8352e7eff9ac10b54d992e61ac6564be8034`. El equipo integró la inferencia; no diseñó ni entrenó esa red. La procedencia está en `artifacts/contracts/external-lstm-provenance.json` y conserva el aviso de que no se encontró una licencia de redistribución. Su inclusión temporal para la demostración académica no concede una licencia ni autoriza usos posteriores. Eliminar un repositorio no revoca copias o clones realizados previamente. Conservar las condiciones aplicables a los datos de la competencia y a los recursos de terceros.

Los archivos joblib/pickle pueden ejecutar código al cargarse: utilizar únicamente los artefactos conocidos de este proyecto. Los hashes comprueban integridad respecto de los manifiestos, no vuelven seguro un modelo de origen desconocido.

Se versiona la copia congelada necesaria para la demostración. No se incluyen `.venv`, `node_modules`, `.next`, cachés de Python ni `.env.local`. Los nuevos cambios de pesos aumentarán el historial de Git: no utilizar este repositorio como registro de experimentos.

IBM Plex Sans se sirve localmente mediante Fontsource. Conservar sus avisos de licencia. Market Lens no implica afiliación con MITSUI ni constituye una recomendación financiera.
