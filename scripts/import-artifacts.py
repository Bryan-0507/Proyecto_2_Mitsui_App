"""Copy approved project artifacts without training or changing source files.

Model bytes stay private. Figures are losslessly encoded for browser delivery.
"""

import argparse
import csv
import gzip
import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image


APP_ROOT = Path(__file__).resolve().parents[1]
TARGETS = ("target_225", "target_19", "target_105", "target_410")
FIGURES = (
    ("docs/figuras/01_distribuciones_predictores_mercado.png", "eda/distributions.webp"),
    ("docs/figuras/02_candidatos_atipicos_tiempo.png", "eda/outliers-by-id.webp"),
    ("docs/figuras/03_distribucion_correlaciones_spearman.png", "eda/correlation-distribution.webp"),
    ("docs/figuras/04_dispersion_pares_mayor_asociacion.png", "eda/associated-pairs.webp"),
    ("docs/figuras/05_correlacion_predictores_candidatos.png", "eda/candidate-correlations.webp"),
    ("docs/figuras/06_correlacion_familia_oro.png", "eda/gold-correlations.webp"),
    ("docs/figuras/07_diagramas_caja_predictores_mercado.png", "eda/boxplots.webp"),
    ("docs/figuras/08_composicion_categorica.png", "eda/categorical-composition.webp"),
    ("docs/graficos_modelado/08_comparacion_rmse.png", "modeling/rmse-comparison.webp"),
    ("data/processed/modelado/graficos/08_dispersion_informe.png", "modeling/prediction-scatter.webp"),
    ("docs/graficos_modelado/08_tiempo_error.png", "modeling/training-time-error.webp"),
    ("docs/graficos_modelado/08_trayectorias_prueba.png", "modeling/test-trajectories.webp"),
    ("data/processed/modelado/graficos/04_tendencia_informe.png", "modeling/trend-diagnostics.webp"),
    ("data/processed/modelado/graficos/04_autocorrelacion_informe.png", "modeling/autocorrelation-diagnostics.webp"),
)
SUPPORT = (
    "src/__init__.py", "src/config.py", "src/shared/compatibility.py",
    "src/shared/modeling.py", "src/models/linear/core.py",
    "src/models/lightgbm/core.py", "src/models/lightgbm/shared_targets.py",
    "src/models/temporal/core.py", "src/models/external_lstm/core.py",
)
RECORDS = (
    ("data/processed/modelado/03_contrato.json", "contracts/benchmark.json"),
    ("data/processed/modelado/04_diagnosticos.json", "contracts/temporal-diagnostics.json"),
    ("data/processed/modelado/06_seleccion_congelada.json", "contracts/benchmark-selection.json"),
    ("data/processed/modelado/07_manifiesto.json", "contracts/benchmark-manifest.json"),
    ("data/processed/modelado/07_metricas_prueba.csv", "evaluation/benchmark/metrics.csv"),
    ("data/processed/modelado/07_predicciones_prueba.csv", "evaluation/benchmark/predictions.csv"),
    ("data/processed/modelado/08_tiempos_totales.csv", "evaluation/benchmark/training-totals.csv"),
    ("data/processed/modelado_compartido/22_contrato.json", "contracts/lightgbm-roles.json"),
    ("data/processed/modelado_compartido/23_freeze.json", "contracts/lightgbm-roles-selection.json"),
    ("data/processed/modelado_compartido/22_metricas.csv", "evaluation/lightgbm-roles/metrics.csv"),
    ("data/processed/modelado_externo/manifiesto_fuente.json", "contracts/external-lstm-provenance.json"),
    ("data/processed/modelado_externo/24_contrato.json", "contracts/external-lstm.json"),
    ("data/processed/modelado_externo/parametros_seguros.npz", "models/external_lstm/safe-preprocessing.npz"),
    ("data/processed/modelado_externo/fuente/config.json", "models/external_lstm/config.json"),
    ("data/processed/modelado_externo/fuente/eng_cols.json", "models/external_lstm/feature-columns.json"),
    ("data/processed/modelado_externo/fuente/seeds.json", "models/external_lstm/seeds.json"),
    ("data/processed/modelado_externo/final_comparison/metrics.csv", "evaluation/final-comparison/metrics.csv"),
    ("data/processed/modelado_externo/final_comparison/audit.json", "evaluation/final-comparison/audit.json"),
    ("data/raw/target_pairs.csv", "contracts/target-pairs.csv"),
)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n")


def copy_file(source_root, relative, destination, records):
    source = source_root / relative
    checksum = digest(source)
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and digest(destination) != checksum:
        raise ValueError(f"Refusing to overwrite different artifact: {destination}")
    shutil.copy2(source, destination, follow_symlinks=True)
    if digest(destination) != checksum or digest(source) != checksum:
        raise ValueError(f"Copy integrity failure: {relative}")
    records.append({"source": relative, "destination": str(destination.relative_to(APP_ROOT)),
                    "sha256": checksum, "bytes": destination.stat().st_size})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    args = parser.parse_args()
    source_root = args.source.resolve()
    if source_root == APP_ROOT or not (source_root / "src/config.py").is_file():
        raise ValueError("Expected the original EDA repository as --source")
    private = APP_ROOT / "artifacts"
    figures_root = APP_ROOT / "public/figures"
    records, images = [], []
    catalog = json.loads((source_root / "data/processed/models/registry.json").read_text())
    for entry in catalog["models"]:
        if digest(source_root / entry["original"]) != entry["sha256"]:
            raise ValueError(f"Source model changed from registry: {entry['original']}")
        relative_destination = Path(entry["path"]).relative_to("data/processed/models")
        copy_file(source_root, entry["original"], private / "models" / relative_destination, records)
    for source, target in RECORDS:
        copy_file(source_root, source, private / target, records)
    for source in SUPPORT:
        copy_file(source_root, source, private / "python" / source, records)

    for filename in ("train_eda.csv", "test_eda.csv"):
        source = source_root / "data/processed" / filename
        checksum = digest(source)
        destination = private / "data" / (filename + ".gz")
        destination.parent.mkdir(parents=True, exist_ok=True)
        with source.open("rb") as input_file, destination.open("wb") as output_file:
            with gzip.GzipFile(fileobj=output_file, mode="wb", mtime=0, filename="") as compressed:
                shutil.copyfileobj(input_file, compressed)
        with gzip.open(destination, "rb") as compressed:
            if hashlib.sha256(compressed.read()).hexdigest() != checksum:
                raise ValueError("Compressed dataset changed contents")
        records.append({"source": str(source.relative_to(source_root)),
                        "destination": str(destination.relative_to(APP_ROOT)),
                        "source_sha256": checksum, "sha256": digest(destination),
                        "bytes": destination.stat().st_size, "transformation": "gzip only"})

    labels_source = source_root / "data/raw/train_labels.csv"
    labels_output = private / "data/selected-target-labels.csv.gz"
    with labels_source.open(newline="") as input_file, gzip.open(labels_output, "wt", newline="") as output_file:
        reader = csv.DictReader(input_file)
        writer = csv.DictWriter(output_file, fieldnames=["date_id", *TARGETS])
        writer.writeheader()
        for row in reader:
            writer.writerow({name: row[name] for name in writer.fieldnames})
    records.append({"source": "data/raw/train_labels.csv",
                    "destination": str(labels_output.relative_to(APP_ROOT)),
                    "source_sha256": digest(labels_source), "sha256": digest(labels_output),
                    "bytes": labels_output.stat().st_size, "transformation": "date_id and four target columns, gzip"})

    for relative, target in FIGURES:
        source = source_root / relative
        checksum = digest(source)
        destination = figures_root / target
        destination.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as original:
            original.save(destination, "WEBP", lossless=True, method=6, exact=True)
            with Image.open(destination) as optimized:
                if original.size != optimized.size or original.convert("RGBA").tobytes() != optimized.convert("RGBA").tobytes():
                    raise ValueError(f"Lossless image verification failed: {relative}")
            if digest(source) != checksum:
                raise ValueError(f"Source image changed: {relative}")
            images.append({"source": relative, "url": "/figures/" + target,
                           "width": original.width, "height": original.height,
                           "source_bytes": source.stat().st_size, "bytes": destination.stat().st_size,
                           "source_sha256": checksum, "sha256": digest(destination),
                           "lossless": True, "pixels_verified": True,
                           "accessibility_review": "pending before display" if target.startswith("eda/") else
                             ("supporting figure; review before display" if "trajectories" in target else "approved source figure")})
    write_json(figures_root / "manifest.json", {"figures": images, "format": "lossless WebP"})
    write_json(private / "transfer-manifest.json", {"source_repository": str(source_root),
               "retrained": False, "backend_connected": False, "models_count": len(catalog["models"]),
               "files": records, "figures": images})
    versions = json.loads((private / "contracts/benchmark-manifest.json").read_text())["versiones"]
    write_json(private / "python/runtime-versions.json", versions)
    package_lines = [f"{name}=={version}" for name, version in versions.items() if name != "python"]
    (private / "python/requirements.txt").write_text("\n".join(package_lines) + "\ntorch==2.14.1\n")
    (private / "README.md").write_text(
        "# Local inference assets\n\n"
        "Frozen, hash-verified copies from the EDA repository. Nothing is public or retrained.\n"
        "linear contains the four OLS baselines. temporal contains the four selected temporal models.\n"
        "lightgbm contains the initial per-target models and the separate roles variants.\n"
        "external_lstm contains published third-party reference weights, isolated from our training.\n"
        "The latter needs its original feature construction, safe preprocessing and five-model ensemble.\n"
        "Never call these weights models trained by our team, or associate their evaluation with the initial benchmark.\n\n"
        "python/src preserves narrow modules and legacy import aliases required by trusted joblib artifacts.\n"
        "This is a compatibility snapshot, not a second training pipeline. A Python backend, path binding,\n"
        "input contract enforcement and causal history handling still need implementation and verification.\n"
        "The temporal and historical target inputs are not arbitrary current user labels.\n"
        "A calendar year cannot substitute for unknown date_id timing.\n\n"
        "evaluation separates initial benchmark, roles development and final external comparison.\n"
        "data holds cleaned predictor CSVs and only the four selected labels, compressed privately.\n"
        "See transfer-manifest.json for provenance, versions, transformations and hashes.\n"
        "The models are for academic demonstration, not financial decision-making.\n"
    )
    original_bytes = sum(entry["source_bytes"] for entry in images)
    web_bytes = sum(entry["bytes"] for entry in images)
    print(f"Transferred {len(catalog['models'])} model artifacts and {len(images)} figures")
    print(f"Figures: {original_bytes:,} -> {web_bytes:,} bytes ({100 * (1-web_bytes/original_bytes):.1f}% smaller)")
    print("No training or source modifications; backend remains unimplemented")


main()
