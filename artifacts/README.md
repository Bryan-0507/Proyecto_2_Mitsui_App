# Artefactos para inferencia local

Esta copia congelada se incluye en el repositorio para ejecutar la demostración sin depender de la carpeta EDA de otra computadora. No se reentrena durante la consulta. El proceso Next.js utiliza `python/worker.py` y los adaptadores de `python/inference/`.

- `models/linear`: cuatro modelos base de regresión lineal.
- `models/temporal`: cuatro modelos temporales seleccionados.
- `models/lightgbm`: modelos por target y variantes históricas por roles.
- `models/external_lstm`: preparación y cinco redes publicadas por un tercero, no entrenadas por el equipo.
- `data`: entradas históricas comprimidas, cuatro etiquetas seleccionadas y caché PCA de la ruta externa.
- `contracts`: contratos y procedencia; conservar los avisos de terceros.
- `evaluation`: resultados guardados, separados por experimento.
- `python`: compatibilidad de serialización y versiones de las bibliotecas necesarias.

Instalar las dependencias de `python/requirements.txt` dentro de un entorno virtual local siguiendo el README principal. El proceso registra automáticamente los alias históricos antes de cargar los modelos propios. No se necesita copiar el entorno virtual de Bryan ni reproducir sus rutas absolutas.

Los hashes de `transfer-manifest.json` y los contratos verifican los archivos consumidos por la inferencia. Los campos históricos `source_repository` y `backend_connected` registran la transferencia inicial, no describen las rutas ni el estado actual de la aplicación. No alterar esos manifiestos para corregir una instalación.

La referencia externa proviene de Hayden1629 y conserva en `contracts/external-lstm-provenance.json` el aviso de licencia no encontrada. Su disponibilidad pública no concede una licencia de redistribución. No atribuir sus pesos ni su entrenamiento al equipo. Esta copia no modifica los derechos de terceros ni las condiciones de los datos de la competencia.

No cargar modelos joblib/pickle desconocidos. No publicar estos archivos mediante la carpeta `public/`. Su presencia en Git no cambia el hecho de que la inferencia se realiza en el servidor local. No son recomendaciones financieras.
