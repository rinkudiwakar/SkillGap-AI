# SkillGap AI

SkillGap AI helps job seekers stop applying blindly. We compare a resume against real job descriptions using semantic AI, estimate hiring probability, expose missing skills, rewrite resume bullets, and turn the job search into a measurable improvement loop.

Our mission is simple: make career growth less confusing and more actionable. If you care about AI, employability, developer tools, or building products that help people move forward in their careers, this is a startup-sized problem with room to make a real dent.

## What It Does

- Scores resume-to-job fit beyond keyword matching
- Finds matched skills, missing skills, and critical gaps
- Estimates hiring probability and explains why
- Suggests stronger resume bullets and alternate job titles
- Stores match history so users can see progress over time
- Tracks job applications in a Supabase-backed workspace

## Product Architecture

```text
React + Vite frontend
        |
        v
FastAPI API for upload, parsing, and match orchestration
        |
        v
Celery + Redis for async match analysis
        |
        v
Supabase for auth, profiles, resumes, history, and applications
```

## Repository Map

```text
react_app/       Frontend app, public landing page, auth, dashboard
fastapi_app/     FastAPI service and API configuration
src/             Core data, feature, model, and visualization modules
supabase/        Database schema and row-level security policies
scripts/         Utility scripts for project workflows
tests/           Test suite
docs/            Documentation sources
data/            Raw, interim, processed, and external data
models/          Trained or serialized model artifacts
```

## Run Locally

1. Create environment files from the examples:

```bash
cp .env.example .env
cp react_app/.env.example react_app/.env
```

2. Install backend dependencies:

```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:

```bash
cd react_app
npm install
```

4. Start the frontend:

```bash
npm run dev
```

The frontend opens at:

```text
http://localhost:5173
```

## Required Services

- Supabase project with `supabase/schema.sql` applied
- FastAPI backend configured with the root `.env`
- Redis and Celery worker for async matching
- Frontend env values for `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`

## Why Join Us

SkillGap AI sits at the intersection of AI, hiring, and personal growth. The product has practical depth: resume parsing, semantic retrieval, scoring, auth, dashboards, job tracking, data pipelines, and production UX. Contributors can help shape matching quality, build delightful career workflows, improve infrastructure, or design experiences that make job seekers feel less alone and more in control.

If that sounds like the kind of product you want to build, clone the repo, run the app, and start with an issue that makes the user journey clearer, faster, or more trustworthy.
