# SkillGap AI Frontend

React + Vite frontend for SkillGap AI.

## Features

- Supabase email/password authentication
- Resume upload through FastAPI
- Resume persistence in Supabase
- Async match-analysis workflow with task polling
- Supabase-backed match history
- Application tracker with status updates
- Profile management

## Environment

Create `react_app/.env` from `react_app/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Run Locally

```bash
npm install
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Backend Requirements

- FastAPI API running on `http://localhost:8000`
- Redis and Celery worker running for `/api/match`
- Supabase schema applied from `supabase/schema.sql`

## Important Notes

- The frontend saves uploaded resume metadata and extracted text directly into Supabase.
- The backend upload endpoint now returns `extracted_text` and `raw_sections` so the frontend can persist them.
- Make sure root `.env` allows the frontend origin:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8000
```
