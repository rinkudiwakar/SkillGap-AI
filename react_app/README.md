# SkillGap AI Frontend

SkillGap AI's frontend is a React + Vite workspace for job seekers who want to understand their real fit before applying. It gives users a polished public homepage first, then opens the authenticated dashboard only when they choose to sign in or start.

## Product Experience

- Public landing page that loads immediately on localhost
- Email/password authentication with Supabase
- Numeric captcha check on sign in and sign up
- Resume upload through the FastAPI backend
- Resume metadata and extracted text persistence in Supabase
- Async resume-to-job matching with task polling
- Saved match history, profile management, and application tracking

## Local Setup

Install dependencies:

```bash
npm install
```

Create `react_app/.env` from `react_app/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Backend Requirements

- FastAPI API running on `http://localhost:8000`
- Redis and Celery worker running for `/api/match`
- Supabase schema applied from `../supabase/schema.sql`
- Complete analysis persistence migration applied from `../supabase/analysis_storage_migration.sql`
- Root `.env` allows the Vite origin:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8000
```

## UX Notes

- The homepage is intentionally public-first; Supabase session detection runs in the background.
- Users are asked to log in only when they open the workspace or start a protected flow.
- If Supabase keys are missing, the landing page still works and the auth form explains what needs to be configured.
