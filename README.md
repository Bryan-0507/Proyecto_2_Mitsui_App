# Market Lens

Next.js scaffold for the academic MITSUI commodity prediction project. Market Lens is the selected project name, not a claim of affiliation with MITSUI or a financial company.

## Run

Requirements: Node >=22.12 and pnpm 10.33.

```sh
pnpm install --frozen-lockfile
pnpm dev --hostname 127.0.0.1 --port 3100
pnpm validate
pnpm build
```

## Visual direction

Market is the selected design: locally served IBM Plex Sans, cool gray surfaces, blue accents and a compact sidebar inspired by financial analysis apps. Open http://127.0.0.1:3100/. All eight project pages remain empty Server Components with individual metadata. Temporary proposals, sample chart, selector and unused fonts have been removed.

## Structure

```text
src/app/                 Route entries, metadata, root layout, globals.css
src/features/shell/      Shared sidebar/header UI, hooks and types
src/features/shared/     Cross-feature navigation and metadata
src/features/<feature>/  Prepared components/hooks/types directories
src/components/ui/       Official shadcn Base UI components
src/i18n/es.json          Central Spanish copy
public/figures/           Lossless WebP assets and provenance manifest
artifacts/               Local ignored model/data/contract snapshots
scripts/import-artifacts.py   Repeatable transfer from the EDA repo
```

No backend, auth, live metrics, prediction form or financial recommendation has been implemented. API modules and data-fetching hooks should be added only when the actual backend contract is agreed.

## Import project artifacts

Use the existing EDA virtual environment, which contains Pillow. Sources are only read. The script copies final model weights and selected evaluation/contracts, not experimental checkpoints, into the private artifacts directory. Hashes are verified and symlinks are materialized.

```sh
/Users/bryan/Documents/DataScience/Proyecto_2_EDA_Data_Science/.venv/bin/python scripts/import-artifacts.py --source /Users/bryan/Documents/DataScience/Proyecto_2_EDA_Data_Science
```

Models are not public and cannot execute in a JavaScript runtime. artifacts/python contains the minimal project module snapshot required by trusted serialized objects. A Python process must add that directory to its module path and import src before loading our joblib files, to register the historical module aliases. Connecting and testing full inference is a separate task. Never load untrusted joblib/pickle files. The external LSTM is isolated as a third-party reference, not a model trained by the team.

Graphics are converted to lossless WebP without changing dimensions or decoded pixels. Existing metrics and rounds are retained separately. EDA graphic accessibility review is still required before displaying them; approved modeling graphs retain their original encoding, labels and accessible markers.

See docs/scaffold-design.md for routes, architecture and cleanup boundaries. No commits are made automatically.

## Font provenance

IBM Plex Sans is bundled locally through Fontsource; retain its included license notices. This is a licensed font choice inspired by financial analysis interfaces, not a claim that TradingView uses this font.
