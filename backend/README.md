# MatchLens backend

This FastAPI service powers the existing React replay UI. The initial data mode is
explicitly a **historical replay**, not a live feed. Cricsheet JSON files can be
placed in `app/data/matches`; the normalized parser loads them at startup.

## Load multiple real matches

The backend does not scrape an HTML scoreboard. It uses Cricsheet's structured,
historical ball-by-ball JSON source, which is more reliable for replay and
statistics. From the `backend` directory, download a bounded set of recent
men's T20 matches:

```powershell
python scripts\download_cricsheet.py --count 12
```

Restart Uvicorn after downloading. `GET /api/matches` will then expose the
downloaded matches alongside the bundled fallback. The downloader is
repeatable and only stores selected JSON files locally; do not commit the
downloaded match data unless your distribution policy permits it.

## Run locally

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

OpenAPI is available at `http://localhost:8000/docs`. Configure `GEMINI_API_KEY`
for grounded natural-language explanations. Without it, the API returns a
deterministic evidence-based fallback and explicitly warns that Gemini is not
configured. Configure Qdrant before running the ingestion tooling; rule
documents are never used to store changing match scores.

## Frontend

Use the real API by setting:

```env
VITE_DEMO_MODE=false
VITE_API_BASE_URL=http://localhost:8000
```

The frontend then calls `/api/matches`, `/api/matches/{id}/state`,
`/api/matches/{id}/timeline`, replay, catch-up, and assistant routes. Demo
fixtures remain available when `VITE_DEMO_MODE` is not `false`.

## Offline experiments and deployment

`app/fine_tuning/train.py` contains the PEFT/LoRA training entry point and
`evaluate.py` reports measured accuracy, macro-F1, and a confusion matrix.
Training is intentionally offline and the API does not train at startup.
`app/rag/ingestion.py` prepares idempotent document chunks for Qdrant.

Build the Cloud Run image with `docker build -t matchlens-api backend` and pass
secrets as environment variables. Netlify should use the same
`VITE_API_BASE_URL` setting and an SPA fallback for `index.html`. Render can
run the same Docker image with the configured `PORT`.
