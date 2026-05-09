# Environment Files

This folder stores shareable environment templates.

- `backend.env.example` -> copy to root `.env` for local FastAPI, Celery, Docker Compose, and secret configuration.
- `fastapi_app.env.example` -> legacy FastAPI-specific template kept with the rest of the env examples.
- `frontend.env.example` -> copy to `frontend/.env` for Vite public frontend variables.

Real `.env` files are intentionally ignored by git.
