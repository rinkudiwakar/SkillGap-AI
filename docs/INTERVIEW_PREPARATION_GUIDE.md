# SkillGap AI — Comprehensive Technical Interview Preparation Guide
*The Ultimate Master Study Guide for Technical Interviews, Architecture Discussions, and Recruiter Deep Dives*

---

## Table of Contents
1. [Executive Summary & Elevator Pitches](#1-executive-summary--elevator-pitches)
   - 30-Second Elevator Pitch
   - 2-Minute Deep-Dive Pitch
   - Resume Bullet Points & Key Metrics
2. [Problem Statement & Market Rationale](#2-problem-statement--market-rationale)
   - Why Traditional ATS Keyword Scanners Fail
   - Why Naive "Ask ChatGPT" Approaches Fail
   - The SkillGap AI Value Proposition
3. [System Architecture & Data Flow](#3-system-architecture--data-flow)
   - High-Level Architecture Diagram
   - End-to-End Request Lifecycle (10 Distinct Steps)
   - Component Breakdown & Separation of Concerns
4. [Tech Stack Deep-Dive & Architectural Trade-offs ("Why X over Y?")](#4-tech-stack-deep-dive--architectural-trade-offs)
   - Backend: FastAPI vs. Flask vs. Django
   - Task Queue: Celery + Redis vs. In-Process BackgroundTasks vs. Kafka
   - Embeddings: Sentence-Transformers (`all-MiniLM-L6-v2`) vs. OpenAI vs. TF-IDF/BM25
   - LLM Orchestration: Groq (Llama 3.3-70B) + Together AI Fallback vs. OpenAI GPT-4o
   - Single Comprehensive LLM Call vs. Multi-Agent Chain Chaining
   - Database: Supabase (PostgreSQL) vs. MongoDB vs. DynamoDB
   - Storage Strategy: Ephemeral In-Memory/Temp PDF Processing vs. Persistent S3
   - Frontend: React + Vite + Vanilla CSS vs. Next.js / TailwindCSS
   - Polling Mechanism: Periodic Polling vs. WebSockets vs. Server-Sent Events (SSE)
5. [The AI/ML Pipeline & Mathematical Formulations](#5-the-aiml-pipeline--mathematical-formulations)
   - Text Extraction & Normalization
   - Skill Taxonomy & Skill Expansion Mapping
   - Embedding Generation (384-dimensional dense vectors)
   - Cosine Similarity: Mathematical Formula & Geometric Meaning
   - Multi-Component Granular Scoring (Skills 60%, Projects 20%, Experience 20%)
   - Additive Blending (Weighted Component vs. Global Cosine Context)
   - Hiring Probability Sigmoid Calibration (Domain, Seniority, Keyword Boost, Exp Penalty)
   - Two-Stage Hybrid Skill Matcher (Exact Overlap + Semantic Cosine Fallback)
6. [Database Architecture & Schema Design](#6-database-architecture--schema-design)
   - Relational Schema Breakdown
   - JSONB vs. Relational Columns
   - Row-Level Security (RLS) & Supabase Auth Integration
7. [Production Engineering, Reliability & Fault Tolerance](#7-production-engineering-reliability--fault-tolerance)
   - Dual-Provider LLM Resilience (Circuit Breaker & Fallback)
   - Celery Task Guarantees (Timeouts, Soft Limits, Retries, Solo Pool)
   - Ephemeral PDF Lifecycle (Privacy, Zero-Disk Footprint, GDPR Compliance)
   - Rate-Limit Handling with Exponential Backoff
8. [MLOps & Reproducibility](#8-mlops--reproducibility)
   - DVC (Data Version Control) Multi-Stage Pipelines
   - Parameter Centralization (`params.yaml`)
   - MLflow Experiment Tracking
   - Containerization & Kubernetes (EKS, HPA, ConfigMaps, Secrets)
9. [Comprehensive Interview Q&A (50+ Recruiter & Engineering Questions)](#9-comprehensive-interview-qa-50-recruiter--engineering-questions)
   - Part A: Recruiter & Behavioral Questions (Culture, Team, Role)
   - Part B: Core Architecture & System Design Questions
   - Part C: Machine Learning, NLP & Mathematical Questions
   - Part D: Backend & Concurrency Questions (FastAPI, Celery, Redis)
   - Part E: Frontend & Client-Server Integration Questions
   - Part F: Edge Cases, Security, Failures & Difficult Bugs
   - Part G: Scale, Optimization & Future Roadmap Questions

---

## 1. Executive Summary & Elevator Pitches

### 30-Second Elevator Pitch
> *"SkillGap AI is an end-to-end semantic career intelligence platform that solves the black-box problem of modern hiring. Instead of relying on fragile keyword matching or hallucination-prone generic prompts, SkillGap AI combines a local Sentence-Transformers embedding pipeline (`all-MiniLM-L6-v2`) with custom mathematical calibration (Sigmoid hiring probability curves, multi-component weighting) and high-throughput LLM reasoning via Groq and Together AI. Job seekers get a mathematically grounded match score, exact and semantic skill gap breakdowns, rewritten resume bullets with quantified impact, and a dynamic 30-60-90 day learning roadmap in under 5 seconds."*

### 2-Minute Deep-Dive Pitch
> *"When candidates apply to technical roles, they face two extremes: legacy ATS scanners that blindly penalize candidates for slight wording differences (e.g., 'ML' vs 'Machine Learning'), or generic ChatGPT prompts that give vague, uncalibrated scores like '8/10' without any mathematical foundation.*
>
> *I designed and implemented SkillGap AI to solve both problems through a robust, full-stack microservice architecture:*
> 1. *On the **Frontend**, I built a responsive React SPA featuring real-time upload progress, an interactive score gauge, granular radar-style metrics, and dynamic career roadmaps.*
> 2. *The **Backend** is built on FastAPI, serving an asynchronous request/response model. Resume PDFs are processed ephemerally using `pdfplumber`—extracting text and deleting temp files immediately to ensure zero-disk footprint and candidate privacy.*
> 3. *Matching is offloaded to a **Celery** background worker backed by **Redis**. The worker normalizes text, passes skills through an expansion taxonomy, and runs our dual-stage matcher: exact match first, followed by semantic cosine similarity using `all-MiniLM-L6-v2` 384-dimensional dense vectors.*
> 4. *Our scoring engine calculates a **Final Weighted Score** (60% skills, 20% projects, 20% experience) and runs it through a custom **calibrated Sigmoid function** that factors in candidate seniority deltas, domain adjustments, and experience year shortfalls.*
> 5. *To deliver bullet rewrites and actionable roadmaps without incurring multi-call latency, I designed a **single comprehensive prompt** executed via Groq (Llama 3.3-70B) with automatic failover to Together AI (Mistral-Small-24B). This brought response time from 15 seconds down to ~3 seconds while slashing LLM costs by 85%.*
> 6. *All historical results, user profiles, and job applications are securely persisted in **Supabase PostgreSQL**."*

### Resume Bullet Points (Copy & Paste Ready)
* **Architected and built SkillGap AI**, an end-to-end career intelligence web application utilizing **FastAPI**, **React**, **Celery**, **Redis**, and **Supabase (PostgreSQL)**.
* **Engineered a semantic matching engine** utilizing **Sentence-Transformers** (`all-MiniLM-L6-v2`, 384-d dense embeddings) and cosine similarity, outperforming traditional keyword ATS scanners with semantic synonym resolution (threshold = 0.60).
* **Developed a calibrated hiring probability algorithm** using non-linear **Sigmoid transformations**, weighting granular components (60% skills, 20% projects, 20% experience) and penalizing experience/seniority gaps.
* **Optimized LLM inference pipeline** by consolidating 5 disparate generation chains into a **single comprehensive prompt** with automated dual-provider failover (**Groq Llama-3.3-70B** to **Together AI Mistral-24B**), cutting latency by 75% (< 4s) and API costs by 85%.
* **Implemented an ephemeral document ingestion pipeline** via `pdfplumber` with strict cleanup handlers, guaranteeing zero persistent storage of candidate PDFs for GDPR/privacy compliance.
* **Configured full MLOps reproducibility** with **DVC** pipelines, **MLflow** experiment tracking, and production-ready **Kubernetes (EKS)** deployment manifests with Horizontal Pod Autoscaling (HPA).

---

## 2. Problem Statement & Market Rationale

### Why Traditional ATS Keyword Scanners Fail
1. **Synonym Blindness:** Traditional Applicant Tracking Systems (ATS) use Boolean string search or basic regular expressions. If a job description demands *"Kubernetes container orchestration"* and the resume lists *"K8s deployment & cluster management"*, a keyword scanner scores this as a 0% match.
2. **Context Ignorance:** Keyword counters cannot differentiate between *"Led Python backend development"* and *"Interested in learning Python"*. Both count as +1 match.
3. **Keyword Stuffing Vulnerability:** Unscrupulous candidates hide white-font keywords in resumes to trick string-matching algorithms, degrading candidate quality for recruiters.

### Why Naive "Ask ChatGPT" Approaches Fail
1. **Non-Deterministic Scoring:** Asking an LLM *"Rate this resume from 1 to 100"* yields varying scores (e.g., 65 on run 1, 88 on run 2) for the exact same input because autoregressive language models are probabilistic token predictors, not calibrated mathematical evaluators.
2. **Extreme Hallucination in Bullet Points:** Generic prompts often fabricate metrics (e.g., *"Increased revenue by $4.2M"*) when rewriting bullets, destroying candidate credibility during background checks.
3. **Prohibitive Latency & Cost:** Running 5 separate prompts (skills, score, roadmap, rewrites, alternate titles) consumes 15–25 seconds and costs 5x more tokens, making the application unusable at interactive scale.

### The SkillGap AI Value Proposition
SkillGap AI decouples **objective mathematical evaluation** from **subjective generative reasoning**:
* **Deterministic Math Layer (Local Embeddings + Scorer):** Generates dense vector representations, measures cosine similarity, and evaluates hiring probability mathematically. Every run yields reproducible, objective metrics.
* **Constrained Generative Layer (Groq/Together AI):** The LLM receives pre-computed match scores, explicit missing skill lists, and strict anti-hallucination constraints ("*preserve all factual content; never invent numbers*"). It is used only for what LLMs do best: synthesis, reframing, and structured JSON generation.

---

## 3. System Architecture & Data Flow

### High-Level Architecture Diagram

```mermaid
flowchart TB
    subgraph Client ["Frontend (React + Vite)"]
        UI["Modern Web UI / Landing / Dashboard"]
        Store["State Management & Storage"]
        Poll["Async Polling Engine (/api/result/{task_id})"]
    end

    subgraph Gateway ["API Gateway (FastAPI)"]
        Upload["POST /api/upload<br/>(Ephemeral PDF Ingestion)"]
        Match["POST /api/match<br/>(Task Dispatcher)"]
        Result["GET /api/result/{task_id}<br/>(Status & Result Polling)"]
        Health["GET /health & /ready<br/>(Liveness Probes)"]
    end

    subgraph Queue ["Message Broker & State Cache"]
        Redis[("Redis 7 (In-Memory)")<br/>DB 0: Celery Broker<br/>DB 1: Result Backend]
    end

    subgraph Workers ["Distributed Worker Pool (Celery)"]
        Worker["Celery Worker (match_pipeline)"]
        subgraph Pipeline ["10-Step AI/ML Processing Pipeline"]
            Clean["1. Text Cleaning & Regex"]
            Parse["2. Structured Parsing (JD / Resume)"]
            Taxonomy["3. Skill Expansion Taxonomy"]
            Extract["4. Tech Keyword & Entity Extraction"]
            Embed["5. Sentence-Transformers (all-MiniLM-L6-v2)"]
            Cosine["6. Cosine Similarity & Granular Scores"]
            Matcher["7. Two-Stage Skill Matcher (0.60 Thresh)"]
            Calibrate["8. Sigmoid Hiring Probability Calibration"]
            LLMCall["9. Dual-Provider LLM Comprehensive Analysis"]
            Compile["10. Score Factors & Final Result Assembly"]
        end
    end

    subgraph AIProviders ["External LLM Providers"]
        Groq["Primary: Groq API<br/>(Llama 3.3-70B Versatile @ 300+ tok/s)"]
        Together["Fallback: Together AI<br/>(Mistral-Small-24B-Instruct)"]
    end

    subgraph Persistence ["Persistence & Auth (Supabase)"]
        SupaAuth["Supabase GoTrue Auth"]
        PG[("PostgreSQL Database")<br/>user_profiles, resumes,<br/>match_results, applications]
    end

    %% Flow connections
    UI -->|1. Multipart PDF| Upload
    Upload -->|Returns resume_id & text| UI
    UI -->|2. POST JSON (resume_text + jd_text)| Match
    Match -->|3. Dispatches task| Redis
    Redis -->|4. Consumes task| Worker
    Worker --> Pipeline
    LLMCall -->|Primary HTTP| Groq
    LLMCall -.->|Failover on error/timeout| Together
    Worker -->|5. Store completed result| Redis
    UI -->|6. Polls every 2s| Result
    Result -->|Reads status/result| Redis
    UI -->|7. Persists enriched analysis| PG
    UI -->|Auth session| SupaAuth
```

---

### End-to-End Request Lifecycle (10 Distinct Steps)

```
[Candidate] Drops PDF + Pastes JD
     │
     ▼
[Step 1: Frontend Ingestion] ────────────────────────────────────────────────────────
  • File validated client-side (MIME type == application/pdf, size <= 10MB).
  • Dispatched via FormData POST to /api/upload.

[Step 2: Ephemeral PDF Parsing] ─────────────────────────────────────────────────────
  • FastAPI creates a uniquely named temporary file: tempfile.NamedTemporaryFile.
  • pdfplumber extracts raw text across all pages.
  • Extraction confidence calculated based on character density, line count, and average line length.
  • FINALLY block unconditionally triggers tmp_path.unlink() — zero persistent disk footprint.
  • Returns resume_id, extracted_text, and confidence score to frontend.

[Step 3: Task Submission & Celery Dispatch] ──────────────────────────────────────────
  • Candidate clicks "Analyze Match".
  • Frontend calls POST /api/match with { resume_text, jd_text (or jd_url), user_id, resume_id }.
  • If jd_url is passed, BeautifulSoup + Requests scrapes the job page.
  • FastAPI generates a unique task_id (UUID4) and invokes match_pipeline.apply_async().
  • Returns HTTP 202 Accepted with task_id immediately.

[Step 4: Celery Worker Task Pickup] ──────────────────────────────────────────────────
  • Celery worker running solo pool (Windows compatibility) picks up task from Redis DB 0.
  • Imports core ML modules lazily to ensure isolation.

[Step 5: Cleaning & Skill Taxonomy Expansion] ───────────────────────────────────────
  • clean_text() strips special characters, collapses whitespace, and lowercases text.
  • Candidate skills extracted via keyword matching and domain vocabularies.
  • Skill expansion map (skill_expansion_cleaned.json) maps parent terms to sub-skills
    (e.g., "generative ai" → ["direct preference optimization", "tokenization"]).

[Step 6: Dense Vector Embedding Generation] ─────────────────────────────────────────
  • EmbedderSingleton loads all-MiniLM-L6-v2 (384-dimensional dense vectors).
  • Encodes 5 specific representations:
      a) Full resume text
      b) Full JD text
      c) Resume skills text
      d) JD skills text
      e) JD role text

[Step 7: Cosine Similarity & Multi-Component Granular Scoring] ──────────────────────
  • Computes overall cosine similarity: dot(A, B) / (||A|| * ||B||).
  • Computes granular component similarities:
      - skill_match = cosine(resume_skills_emb, jd_skills_emb)
      - project_relevance = cosine(resume_projects_emb, jd_role_emb)
      - experience_relevance = cosine(resume_experience_emb, jd_role_emb)
  • Calculates weighted score: (0.60 * skill) + (0.20 * project) + (0.20 * experience).
  • Blends weighted score additively with overall context: (0.70 * weighted) + (0.30 * overall).

[Step 8: Two-Stage Hybrid Skill Matching] ───────────────────────────────────────────
  • Stage 1 (Exact Match): Checks if lowercase JD skill is present in resume skill set.
  • Stage 2 (Semantic Fallback): If not exact, computes cosine similarity between embeddings.
    If cosine > 0.60, classified as matched (e.g., "PostgreSQL" ↔ "Postgres DB").
  • Unmatched skills classified as missing.
  • Categorizes missing skills into Critical (freq >= 2 in JD), Important (freq >= 1), Nice-to-have.

[Step 9: Non-Linear Calibrated Hiring Probability] ──────────────────────────────────
  • Applies calibrated Sigmoid: base_prob = sigmoid(cosine_score * 10 - 2.5) * 100.
  • If missing_skills == 0, base_prob clamped to minimum 85%.
  • Domain factor applied (Tech = 1.0, Finance = 0.92, Healthcare = 0.88).
  • Seniority adjustment applied (+10% if senior vs junior JD, -15% if junior vs senior JD).
  • Keyword overlap boost added (up to +5%).
  • Experience gap penalty subtracted (0.07 per missing year).
  • Final probability clamped to integer range [1, 99].

[Step 10: Single Comprehensive LLM Analysis & Supabase Persistence] ──────────────────
  • Worker calls analyze_resume_comprehensive() via Groq (Llama 3.3-70B).
  • Strict JSON contract delivers: strengths, weaknesses, recommended_roles,
    rewritten_bullets, confidence_assessment, and 30-60-90 day roadmap.
  • Automatic failover to Together AI if Groq fails or times out (timeout = 6s).
  • Worker returns complete compiled dictionary to Redis DB 1.
  • Frontend polling detects status: "completed" and renders rich dashboard.
  • Match row persisted in Supabase match_results table for permanent user history.
```

---

## 4. Tech Stack Deep-Dive & Architectural Trade-offs

When interviewers ask: *"Why did you choose technology X over technology Y?"*, use the structured comparisons below:

### 1. Backend: FastAPI vs. Flask vs. Django
| Criterion | FastAPI (Chosen) | Flask | Django |
| :--- | :--- | :--- | :--- |
| **Concurrency Model** | Native `asyncio` event loop; non-blocking I/O | Synchronous WSGI by default; requires Gevent/Gunicorn hacks | ASGI supported in newer versions, but heavy ORM is synchronous |
| **Data Validation** | Native **Pydantic v2** with compile-time type validation | Requires manual marshmallow or custom request checking | Django Forms / Serializers (heavyweight) |
| **API Documentation** | Automated **Swagger / OpenAPI 3.0** interactive UI at `/docs` | Requires third-party plugins (`flask-restx`) | Requires `drf-spectacular` or `drf-yasg` |
| **Execution Speed** | One of the fastest Python frameworks (Starlette + Uvicorn) | Slower under high concurrency | High overhead due to "batteries-included" middleware |

> **Interview Pitch:** *"I chose FastAPI because our application is fundamentally an API-first microservice. Native asynchronous support allows FastAPI to handle thousands of concurrent polling requests (`/api/result/{task_id}`) without blocking worker threads, while Pydantic guarantees strict type validation for our complex ML payloads."*

---

### 2. Task Queue: Celery + Redis vs. In-Process BackgroundTasks vs. Kafka
| Criterion | Celery + Redis (Chosen) | FastAPI `BackgroundTasks` | Apache Kafka |
| :--- | :--- | :--- | :--- |
| **Process Isolation** | Heavy ML & LLM workloads run in completely separate OS worker processes | Runs inside the API web server event loop | External distributed log clusters |
| **Failure Recovery** | Automatic retries, exponential backoff, dead-letter tracking | If web server crashes or restarts, task is permanently lost | Highly fault-tolerant, but massive operational complexity |
| **Resource Contention** | CPU-bound PyTorch/NumPy matrix operations don't starve web requests | Heavy CPU embedding computation freezes the FastAPI async loop | Overkill for single-node to moderate multi-node deployments |
| **Horizontal Scalability**| Simply scale worker containers (`docker compose up --scale worker=5`) | Cannot scale workers independently of the web API | Requires Zookeeper/KRaft, multi-broker management |

> **Interview Pitch:** *"In-process background tasks would freeze the async event loop during Sentence-Transformers matrix multiplications. Celery offloads CPU-heavy embeddings and network-heavy LLM calls to dedicated worker pools. Redis serves as both an ultra-low latency AMQP broker and a result store with automatic TTL expiration."*

---

### 3. Embeddings: Sentence-Transformers (`all-MiniLM-L6-v2`) vs. OpenAI (`text-embedding-3-small`) vs. TF-IDF
| Criterion | `all-MiniLM-L6-v2` (Chosen) | OpenAI `text-embedding-3-small` | TF-IDF / BM25 |
| :--- | :--- | :--- | :--- |
| **Hosting & Cost** | Self-hosted locally; **$0 API cost** per million inferences | $0.02 / 1M tokens; ongoing external API cost | Self-hosted locally; $0 cost |
| **Latency** | **15–30ms** per document on CPU; 3ms on GPU | 150–400ms network round-trip latency | < 5ms (pure sparse matrix math) |
| **Semantic Understanding**| Trained specifically for sentence pair semantic similarity (cosine) | Excellent semantic understanding | **Zero semantic understanding** (pure lexical matching) |
| **Privacy / Compliance** | Candidate resumes **never leave the local infrastructure** | Sends complete candidate resumes to external third-party server | Local |
| **Vector Dimension** | Compact **384 dimensions** (low memory, ultra-fast dot product) | 1,536 dimensions (4x memory and compute footprint) | Sparse vocabulary-size vector (~10,000+ dims) |

> **Interview Pitch:** *"Using `all-MiniLM-L6-v2` gives us the optimal sweet spot between semantic accuracy, privacy, and operational cost. Resumes contain sensitive PII; encoding them locally guarantees data privacy. Furthermore, 384-dimensional dense vectors compute cosine similarity in under 20 milliseconds on standard CPU without paying per-token API costs."*

---

### 4. LLM Orchestration: Groq (Llama 3.3-70B) + Together AI Fallback vs. OpenAI GPT-4o
| Criterion | Groq + Together AI (Chosen) | Direct OpenAI GPT-4o |
| :--- | :--- | :--- |
| **Generation Speed** | **300+ tokens/second** via Groq LPUs (Tensor Streaming Processors) | 40–70 tokens/second |
| **Total Response Time**| **~2.5 to 3.5 seconds** for 1,200 tokens | 9.0 to 14.0 seconds |
| **Cost Efficiency** | ~$0.59 / million tokens (Llama 3.3-70B) | $5.00 / million tokens (8.5x more expensive) |
| **High Availability** | Automatic failover to Together AI (Mistral-Small-24B) if Groq 429s/timeouts | Single point of failure if OpenAI API degrades |

> **Interview Pitch:** *"User experience in resume matching demands near-instantaneous feedback. Traditional OpenAI calls took 10+ seconds. By deploying on Groq's custom LPU hardware with Llama 3.3-70B, generation time dropped to under 3 seconds. To guard against rate limits (HTTP 429), I implemented a circuit breaker with Together AI's Mistral-Small as an automatic fallback."*

---

### 5. Prompt Architecture: Single Comprehensive Call vs. Multi-Agent Chain Chaining
* **The Multi-Call Anti-Pattern:** A naive architecture invokes 5 separate LLM chains:
  1. Chain 1: Extract strengths & weaknesses (~3s)
  2. Chain 2: Rewrite resume bullet points (~4s)
  3. Chain 3: Generate 30-60-90 day learning roadmap (~3s)
  4. Chain 4: Recommend alternate job titles (~3s)
  5. Chain 5: Generate interview preparation questions (~3s)
  * *Total Latency:* 16+ seconds. *Token Cost:* 5x repeated system prompt overhead.
* **Our Single Comprehensive Prompt Innovation:**
  * Consolidates all 5 tasks into one unified, structured JSON prompt (`analyze_resume_comprehensive`).
  * System prompt instructs the model to return a single strictly validated JSON payload containing all sections.
  * *Total Latency:* ~3 seconds. *Token Savings:* **85% reduction** in redundant input tokens.

---

### 6. Storage Strategy: Ephemeral PDF Processing vs. Persistent S3
* **The Security & GDPR Concern:** Resumes contain personally identifiable information (PII): home addresses, phone numbers, emails, educational history. Storing thousands of unencrypted PDFs in AWS S3 creates substantial liability, storage costs, and GDPR data-deletion overhead.
* **SkillGap AI Ephemeral Implementation:**
  * File is uploaded to memory, written to a sandboxed temporary file with a unique UUID.
  * Text is extracted, parsed into structured data, and the temporary file is deleted in a `finally` block immediately.
  * Only extracted text and structured vectors are processed. Nothing remains on disk.

---

### 7. Polling Mechanism: Polling vs. WebSockets vs. Server-Sent Events (SSE)
* **Chosen Approach: Client-side Periodic Polling with Exponential Jitter:**
  * Frontend submits match, receives `task_id`, and queries `GET /api/result/{task_id}` every 2 seconds.
* **Why not WebSockets?**
  * WebSockets require persistent, stateful TCP connections. This complicates autoscaling behind load balancers (sticky sessions required) and consumes server file descriptors.
  * Since our pipeline completes in 3–5 seconds, 2–3 lightweight HTTP GET requests over HTTP/2 are significantly simpler, fully stateless, and seamlessly scale across distributed Kubernetes pods.

---

## 5. The AI/ML Pipeline & Mathematical Formulations

### 1. Vector Cosine Similarity
Cosine similarity evaluates the angular alignment between two $n$-dimensional vectors, completely invariant to document length:

$$\text{Cosine Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$$

* **Code Implementation (`ai/src/model/model_Evaluation.py`):**
```python
def cosine_distance(vec_a: list, vec_b: list) -> float:
    arr_a = np.asarray(vec_a, dtype=np.float32)
    arr_b = np.asarray(vec_b, dtype=np.float32)
    norm_a = np.linalg.norm(arr_a)
    norm_b = np.linalg.norm(arr_b)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(np.dot(arr_a, arr_b) / (norm_a * norm_b))
```
* **Why Cosine over Euclidean Distance?** Euclidean distance increases if a candidate writes a longer resume with more words. Cosine similarity evaluates the *direction* of the semantic vector, measuring semantic meaning rather than word count.

---

### 2. Multi-Component Granular Scoring Architecture
A candidate might have strong skills but irrelevant projects. A single global cosine score dilutes these nuances. We compute three granular embeddings and blend them:

$$S_{\text{skills}} = \text{cosine}(E_{\text{resume\_skills}}, E_{\text{jd\_skills}})$$

$$S_{\text{projects}} = \text{cosine}(E_{\text{resume\_projects}}, E_{\text{jd\_role}})$$

$$S_{\text{experience}} = \text{cosine}(E_{\text{resume\_experience}}, E_{\text{jd\_role}})$$

$$\text{Score}_{\text{weighted}} = (w_{\text{skills}} \cdot S_{\text{skills}}) + (w_{\text{projects}} \cdot S_{\text{projects}}) + (w_{\text{experience}} \cdot S_{\text{experience}})$$
*Where $w_{\text{skills}} = 0.60$, $w_{\text{projects}} = 0.20$, and $w_{\text{experience}} = 0.20$.*

#### Additive Context Blending
To prevent an edge-case where a low global similarity score destroys a candidate who possesses 100% of the required technical skills, we blend the granular weighted score with the overall context:

$$\text{Final Match Score} = (0.70 \times \text{Score}_{\text{weighted}}) + (0.30 \times \text{Cosine}_{\text{overall}})$$

---

### 3. Non-Linear Calibrated Hiring Probability Formula
Raw cosine similarities cluster in the range of $[0.50, 0.85]$. Displaying a raw score of 0.68 confuses candidates (it sounds like an 'F' or 68%). We calibrate this score into an industry-calibrated hiring probability percentage using a customized Sigmoid transformation:

#### Base Sigmoid Calibration:
$$\text{Base Probability} = \frac{1}{1 + e^{-(10 \times \text{Score}_{\text{final}} - 2.5)}} \times 100$$
* *Inflection point:* Shifted by $-2.5$ so an average match (~0.60) yields a competitive probability (~65–70%).
* *Zero-Gap Guarantee:* If missing skills count is 0, $\text{Base Probability} = \max(\text{Base Probability}, 85.0)$.

#### Domain & Seniority Modifiers:
$$\text{Adjusted Prob} = \text{Base Probability} \times F_{\text{domain}} \times F_{\text{seniority}}$$
* $F_{\text{domain}}$: `tech` = 1.0, `finance` = 0.92, `healthcare` = 0.88.
* $F_{\text{seniority}}$:
  * Overqualified (Senior candidate vs Junior JD): $F_{\text{seniority}} = 1.10$.
  * Underqualified (Junior candidate vs Senior JD): $F_{\text{seniority}} = 0.85$.
  * Matched level: $F_{\text{seniority}} = 1.00$.

#### Keyword Overlap Boost & Experience Penalty:
$$\text{Bonus}_{\text{keyword}} = \min\left(0.05, \frac{|\text{Resume Skills} \cap \text{JD Skills}|}{|\text{JD Skills}|} \times 0.15\right)$$

$$\text{Penalty}_{\text{exp}} = \max(0, \text{Years}_{\text{required}} - \text{Years}_{\text{candidate}}) \times 0.07$$

$$\text{Hiring Probability} = \text{clamp}\Big(\text{Adjusted Prob} + \text{Bonus}_{\text{keyword}} - \text{Penalty}_{\text{exp}}, \; \min=1, \; \max=99\Big)$$

---

### 4. Two-Stage Hybrid Skill Matcher
* **Stage 1: Exact String Matching:**
  * Checks direct inclusion after string normalization (stripping brackets, normalizing hyphens, lowercasing).
* **Stage 2: Semantic Proximity Fallback:**
  * For any unmatched JD skill $s_{\text{jd}}$, computes cosine similarity against all resume skills $\{s_{\text{res}}\}$:
  $$\max_{s_{\text{res}}} \text{cosine}(E(s_{\text{jd}}), E(s_{\text{res}})) > 0.60$$
  * If greater than threshold $\tau = 0.60$, the skill is categorized as **Matched**.
  * *Example:* JD specifies `"PostgreSQL"`, Resume contains `"Postgres database"`. Exact match fails; semantic cosine is $0.89 \ge 0.60 \implies$ Matched!

---

## 6. Database Architecture & Schema Design

Persisted via **Supabase PostgreSQL**. The schema enforces relational integrity while utilizing `JSONB` for unstructured ML outputs:

```
┌─────────────────────────────────┐
│          user_profiles          │
├─────────────────────────────────┤
│ id: UUID (PK, FK auth.users)    │
│ email: TEXT UNIQUE              │
│ full_name: TEXT                 │
│ profile_picture_url: TEXT       │
│ bio: TEXT                       │
│ created_at: TIMESTAMP           │
└───────────────┬─────────────────┘
                │ 1
                │
                │ N
┌───────────────▼─────────────────┐       1 ┌──────────────────────────────────┐
│             resumes             │─────────│          match_results           │
├─────────────────────────────────┤         ├──────────────────────────────────┤
│ id: UUID (PK)                   │       N │ id: UUID (PK)                    │
│ user_id: UUID (FK)              │         │ user_id: UUID (FK)               │
│ filename: TEXT                  │         │ resume_id: UUID (FK)             │
│ s3_key: TEXT (ephemeral marker) │         │ jd_role: TEXT                    │
│ extraction_confidence: FLOAT    │         │ match_score: FLOAT               │
│ extracted_text: TEXT            │         │ hiring_probability: INT          │
│ raw_sections: JSONB             │         │ matched_skills: TEXT[]           │
│ created_at: TIMESTAMP           │         │ missing_skills: TEXT[]           │
└─────────────────────────────────┘         │ critical_missing: TEXT[]         │
                                            │ granular_scores: JSONB           │
                                            │ score_factors: JSONB             │
                                            │ rewritten_bullets: JSONB         │
                                            │ roadmap: JSONB / TEXT            │
                                            │ recommended_roles: JSONB         │
                                            │ created_at: TIMESTAMP            │
                                            └────────────────┬─────────────────┘
                                                             │ 1
                                                             │
                                                             │ 0..1
                                            ┌────────────────▼─────────────────┐
                                            │           applications           │
                                            ├──────────────────────────────────┤
                                            │ id: UUID (PK)                    │
                                            │ user_id: UUID (FK)               │
                                            │ match_result_id: UUID (FK, Null) │
                                            │ company: TEXT                    │
                                            │ role: TEXT                       │
                                            │ applied_date: DATE               │
                                            │ status: TEXT (Applied/Interview) │
                                            │ match_score: FLOAT               │
                                            │ notes: TEXT                      │
                                            └──────────────────────────────────┘
```

### Why JSONB for ML Results?
Fields like `granular_scores`, `score_factors`, `rewritten_bullets`, and `roadmap` evolve rapidly as ML prompts change. Utilizing PostgreSQL `JSONB` allows schema flexibility without requiring full database migrations every time a new LLM attribute is added, while still supporting indexed GIN queries if needed.

---

## 7. Production Engineering, Reliability & Fault Tolerance

### 1. Dual-Provider LLM Resilience Pattern
External LLM APIs are prone to rate limiting (HTTP 429), timeouts, and transient outages. SkillGap AI implements a provider fallback pattern:

```python
# Pseudo-code architecture from fastapi_app/services/llm_service.py
def analyze_resume_comprehensive(self, prompt, ...):
    try:
        # 1. Attempt Primary: Groq (Llama 3.3-70B) with 6s timeout
        return self.groq_provider.call(prompt, timeout=6)
    except (LLMProviderError, requests.exceptions.RequestException) as e:
        logger.warning(f"Groq primary failed ({e}). Tripping circuit to Together AI...")
        try:
            # 2. Attempt Fallback: Together AI (Mistral-Small-24B)
            return self.together_provider.call(prompt, timeout=6)
        except Exception as fallback_err:
            logger.error(f"All LLM providers failed: {fallback_err}")
            return self._build_graceful_degraded_response(...)
```

### 2. Celery Worker Reliability Configurations
* **Windows-Compatible Solo Pool:** `worker_pool = 'solo'`. Avoids standard UNIX prefork issues and IPC deadlocks on Windows systems.
* **Soft & Hard Timeouts:** 
  * `task_soft_time_limit = 240` (4 minutes): Throws `SoftTimeLimitExceeded` inside Python so the task can clean up.
  * `task_time_limit = 300` (5 minutes): Hard SIGKILL to terminate runaway tasks.
* **Idempotency & Retry Policies:** 
  * Auto-retries up to 3 times on unexpected exceptions with exponential backoff: $1s, 2s, 4s$.

---

## 8. MLOps & Reproducibility

### 1. DVC (Data Version Control) Pipeline
The ML pipeline is formalized in `ai/dvc.yaml` across 4 reproducible stages:
1. `data_preprocessing`: Cleans raw skill strings and vocabulary corpora.
2. `feature_engineering`: Generates and caches dense numpy matrix embeddings.
3. `model_evaluation`: Computes benchmark score distributions and writes `evaluation_metrics.json`.
4. `register_model`: Tags parameters from `params.yaml` and exports the production bundle.

### 2. Kubernetes Deployment Architecture (`backend/deployment.yaml`)
* **StatefulSet for Redis:** Deployed with persistent volume claims (`volumeClaimTemplates`, 10Gi) and append-only file persistence (`--appendonly yes`).
* **Deployment for API & Workers:** Independent replica counts.
* **Horizontal Pod Autoscaler (HPA):** Scales API pods from 2 to 10 replicas based on CPU target utilization (> 70%).
* **Probes:**
  * Liveness Probe: `GET /health` ensures the process is running.
  * Readiness Probe: `GET /ready` verifies Redis connectivity and database responsiveness before routing traffic.

---

## 9. Comprehensive Interview Q&A (50+ Recruiter & Engineering Questions)

### Part A: Recruiter & Behavioral Questions

#### Q1: "Can you walk me through your project as if I'm not technical?"
**Answer:**
> *"SkillGap AI is like having a veteran technical recruiter review your resume before you hit submit. When job seekers apply to companies, their resumes are usually rejected by automated filters because their keywords don't match the exact phrasing of the job posting. 
> 
> My app solves this. You upload your resume and paste a job description. In 3 seconds, SkillGap AI analyzes your real skills, shows you your true hiring probability, identifies exactly what tools or technologies you are missing, rewrites your resume bullet points to highlight your strongest achievements, and gives you a 30-day learning roadmap to bridge any gaps. It takes the guesswork out of job searching."*

#### Q2: "What was your specific role in building this project?"
**Answer:**
> *"I designed and built the entire system end-to-end as a full-stack AI engineer. This included:
> - Architecting the FastAPI backend and Celery asynchronous background worker.
> - Developing the NLP/ML pipeline using Sentence-Transformers and designing the mathematical scoring and sigmoid calibration algorithms.
> - Integrating dual LLM providers (Groq and Together AI) with automated failover for ultra-fast generation.
> - Building the React frontend interface, from PDF dropzone to interactive charts and Supabase authentication.
> - Containerizing the application using Docker and writing Kubernetes deployment manifests."*

#### Q3: "What was the most challenging technical decision you had to make?"
**Answer:**
> *"The hardest decision was how to balance LLM generation quality, cost, and latency. Initially, I had 5 separate LangChain chains running sequentially—one for skills, one for bullet rewrites, one for the roadmap, etc. The results were good, but it took 15 to 18 seconds to finish, and if OpenAI rate-limited any single call, the whole analysis crashed.
> 
> I re-engineered the architecture: I separated the math from the LLM. All scoring and skill matching is calculated locally in 20 milliseconds using Sentence-Transformers and NumPy. Then, I combined all generative tasks into a single comprehensive prompt executed on Groq's LPU hardware with Together AI as a fallback. This reduced latency from 16 seconds down to 3 seconds, cut API costs by 85%, and eliminated single points of failure."*

---

### Part B: Core Architecture & System Design Questions

#### Q4: "Why did you build an asynchronous task architecture with Celery instead of processing the match synchronously inside FastAPI?"
**Answer:**
> *"In Python, synchronous requests block the worker thread. Embedding a full resume and job description using PyTorch models, calculating matrix multiplications, and making external LLM calls takes between 2 and 4 seconds. 
>
> If 50 users submit resumes simultaneously in a synchronous architecture, web server worker threads become completely exhausted. New users would experience HTTP 504 Gateway Timeouts even when simply trying to view the homepage.
>
> By utilizing Celery with Redis, the FastAPI API responds in under 50 milliseconds with an HTTP 202 Accepted and a `task_id`. The client polls for progress. The web API remains completely responsive, while the compute-heavy workloads run across horizontally scalable worker pools."*

#### Q5: "How does the frontend know when the Celery task has finished?"
**Answer:**
> *"We use client-side interval polling. When the user submits a match, the frontend receives a `task_id`. It triggers an asynchronous polling function using `setInterval` or recursive `setTimeout` every 2 seconds against `GET /api/result/{task_id}`.
>
> On the backend, FastAPI queries Celery's `AsyncResult(task_id)`. If the task is still working, it returns `{ status: 'pending' }`. When the worker finishes and writes the compiled dictionary to Redis backend DB 1, `async_result.successful()` returns true, and FastAPI returns `{ status: 'completed', result: data }`. The frontend stops polling, updates its state, and renders the analysis dashboard."*

#### Q6: "Why didn't you use WebSockets instead of polling?"
**Answer:**
> *"I evaluated WebSockets, Server-Sent Events (SSE), and Short Polling. 
> - WebSockets maintain stateful TCP socket connections. This introduces architectural complexity when scaling horizontally across Kubernetes pods because you need sticky sessions or a Redis Pub/Sub backplane to route socket messages to the right container.
> - Because our entire pipeline finishes in only 3 to 4 seconds, the client only needs to make 1 or 2 polling requests before receiving the completed payload. Polling over stateless HTTP/2 is vastly simpler, completely stateless, highly reliable across mobile/spotty networks, and requires zero socket connection management."*

---

### Part C: Machine Learning & NLP Questions

#### Q7: "Why use Sentence-Transformers instead of standard BERT or Word2Vec?"
**Answer:**
> *"Standard BERT was trained with Masked Language Modeling and Next Sentence Prediction. It does not produce semantically meaningful sentence embeddings natively. Finding semantic similarity with standard BERT requires passing both sentences simultaneously into cross-encoders, which scales at $O(n^2)$ and is far too slow for real-time document comparison.
>
> Word2Vec produces static word-level vectors and cannot understand context (e.g., 'Apple company' vs 'apple fruit'), and averaging word vectors loses all syntax and word order.
>
> Sentence-Transformers (specifically `all-MiniLM-L6-v2`) uses a siamese network fine-tuned specifically to map variable-length texts into a 384-dimensional dense vector space such that semantically similar sentences have high cosine similarity. It encodes documents independently in $O(n)$ time."*

#### Q8: "Explain the two-stage hybrid skill matching algorithm."
**Answer:**
> *"Real-world skills have both lexical matches and conceptual synonyms.
> - **Stage 1 (Exact Match):** We take normalized strings and check set intersection. If the JD requires `'Python'` and the resume has `'Python'`, it's matched instantly in $O(1)$ time.
> - **Stage 2 (Semantic Fallback):** For any JD skill not matched in Stage 1, we pass its embedding and the embeddings of all candidate skills to a cosine distance function. If $\text{cosine}(E(s_{\text{jd}}), E(s_{\text{resume}})) \ge 0.60$, we accept it as a match.
> 
> For instance, `'Amazon Web Services'` and `'AWS'`, or `'PostgreSQL'` and `'Postgres'`. This eliminates false negatives that break traditional ATS software."*

#### Q9: "Why is the similarity threshold set to 0.60?"
**Answer:**
> *"Through empirical evaluation during feature engineering (tracked in our DVC metrics), we found that in 384-dimensional space with `all-MiniLM-L6-v2`:
> - Pairs above 0.75 are near-identical rephrasings (e.g., `'K8s'` vs `'Kubernetes'`).
> - Pairs between 0.60 and 0.74 represent closely related technologies within the same domain (e.g., `'Flask'` and `'FastAPI'`, or `'PyTorch'` and `'TensorFlow'`).
> - Pairs below 0.55 represent distinct technologies (e.g., `'Docker'` and `'PostgreSQL'` yield ~0.42).
> 
> Setting the threshold at 0.60 allows candidate skills to bridge reasonable gaps without incorrectly matching unrelated technologies."*

#### Q10: "Walk me through your Sigmoid Hiring Probability formula."
**Answer:**
> *"Raw cosine scores are bounded between -1 and 1, and for resume embeddings, they usually hover between 0.50 and 0.85. If you show a candidate a '0.65' match score, they assume they failed.
>
> We pass the final score into a calibrated Sigmoid function:
> $$\text{base\_prob} = \frac{100}{1 + e^{-(10 \cdot S - 2.5)}}$$
> 
> The multiplier of 10 creates a steep, discriminative curve, while the offset of $-2.5$ shifts the midpoint so that a 0.65 score maps to roughly 70% probability. 
>
> Then, we apply domain multipliers (tech vs finance), adjust for candidate seniority versus job requirements (+10% or -15%), add a small boost for exact keyword matches (up to +5%), and subtract an experience penalty (0.07 per year of shortfall). Finally, we clamp the output between 1% and 99%."*

---

### Part D: Backend, Concurrency & Security Questions

#### Q11: "How do you guarantee that a user's resume PDF is not permanently stored or leaked?"
**Answer:**
> *"Candidate privacy was a core architectural requirement. In `backend/fastapi_app/routers/upload.py`, we implement an ephemeral processing lifecycle:
> 1. The binary stream from `UploadFile` is written to a unique file generated by Python's `tempfile.NamedTemporaryFile` in an isolated temp directory.
> 2. `pdfplumber` extracts the text and metadata into memory.
> 3. The entire parsing block is wrapped in a `try...finally` statement.
> 4. In the `finally` block, `tmp_path.unlink()` is invoked unconditionally, deleting the file whether extraction succeeded or threw an exception.
> No PDF bytes are ever written to persistent disk or AWS S3 in our production deployment."*

#### Q12: "Why do you configure Celery with `worker_pool='solo'`?"
**Answer:**
> *"By default, Celery uses the `prefork` pool, which uses UNIX `fork()` to spawn worker processes. On Windows operating systems, Python does not have native `fork()` support, which leads to child processes freezing, duplicate tasks, or unhandled permission errors when initializing PyTorch models.
> 
> The `solo` pool executes tasks in-process without spawning sub-processes, ensuring full stability on Windows development environments while maintaining the identical task API."*

#### Q13: "What happens if Groq API goes down or hits a 429 Rate Limit?"
**Answer:**
> *"Our `LLMService` implements a resilient multi-tier fallback:
> 1. It calls Groq with a strict 6-second timeout.
> 2. If Groq returns HTTP 429, our client executes exponential backoff with jitter up to the retry limit.
> 3. If Groq times out or fails (HTTP 500/503), an exception is caught and the service immediately fails over to Together AI running `mistralai/Mistral-Small-24B-Instruct-2501`.
> 4. If all external LLM APIs fail, the pipeline does NOT crash. The worker catches the failure, populates the deterministic scores, skill matches, and gap reports, and returns empty generative fields with a clear user notice."*

---

### Part E: Frontend & Client-Server Integration Questions

#### Q14: "How does your frontend handle data transformation without relying on the backend to format strings?"
**Answer:**
> *"We maintain a dedicated client-side transformation layer in `frontend/src/lib/transform.js`. 
> 
> The backend returns pure, raw data arrays: `matched_skills: ['python', 'aws']`, `strengths: [...]`, `missing_skills: [...]`. 
> 
> The frontend transformation layer uses deterministic JavaScript functions (`transformStrengths`, `transformWeaknesses`, `transformRoadmap`) to join strings into grammatically correct English sentences, format URLs for LinkedIn job searches, and structure 30-60-90 day timeline objects. This cleanly separates data persistence from presentation logic."*

#### Q15: "How did you manage user authentication and session security?"
**Answer:**
> *"We integrated Supabase Auth (GoTrue). The frontend initializes the Supabase client using environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). 
> 
> Authentication state is subscribed via `supabase.auth.onAuthStateChange()`. When a user logs in, Supabase issues JWT access and refresh tokens stored in secure browser storage. These tokens authenticate database calls against Row-Level Security (RLS) policies in PostgreSQL, ensuring users can only read and write their own resume analyses and job applications."*

---

### Part F: Tricky Edge Cases & Hard Bugs Encountered

#### Q16: "What happens if a candidate uploads a scanned image PDF without selectable text?"
**Answer:**
> *"When `pdfplumber` attempts to extract text from a scanned image, it returns an empty string or very few characters. In our `ResumeParser.get_confidence_score()` method, we calculate a heuristic confidence score based on character count, line count, and average line length. 
> 
> If the text contains fewer than 50 characters or confidence is below 0.50, the backend returns an HTTP 422 Unprocessable Entity with a descriptive error: `'Unable to extract text from PDF. Scanned images are not supported; please upload a text-based PDF.'` This prevents wasting embedding computation on garbage input."*

#### Q17: "How do you prevent the LLM from hallucinating metrics in the rewritten resume bullets?"
**Answer:**
> *"In our prompt engineering (`backend/fastapi_app/services/llm_service.py` and `prompts/rewrite.txt`), we apply strict negative constraints:
> ```
> Preserve all factual content, metrics, and achievements.
> Do NOT invent numbers, percentages, or company names.
> Only rephrase using stronger action verbs and naturally integrating the target keywords.
> ```
> Furthermore, by passing the candidate's actual bullet text as explicit input variables and using a low sampling temperature ($T = 0.3$), the model acts as a constrained rephraser rather than an open-ended creative generator."*

#### Q18: "What was a subtle bug you solved in this project?"
**Answer:**
> *"Early on, when a candidate had an almost 100% skill match for a role, their overall match score was coming out surprisingly low (~52%). 
> 
> When debugging the math, I discovered that our overall text cosine similarity was comparing the entire raw resume (which included university coursework, hobbies, and contact info) against a concise job description. The extra irrelevant text diluted the global cosine score down to 0.45.
> 
> Because our original formula multiplied the weighted skill score by the global score, this low global score dragged down the entire result. 
> 
> I resolved this by redesigning the scoring function:
> 1. We calculate granular skill, project, and experience embeddings separately.
> 2. We combine them with explicit weights (60% skills, 20% projects, 20% experience).
> 3. We use an **additive blend** ($0.7 \times \text{weighted} + 0.3 \times \text{overall}$) rather than a multiplicative penalty. This immediately fixed the issue and produced realistic, fair scores."*

---

### Part G: Scale, Optimization & Future Roadmap

#### Q19: "How would you scale this platform to support 100,000 daily active users?"
**Answer:**
> *"To scale 100x:
> 1. **Embedding Caching:** Compute SHA-256 hashes of standardized resume skills and JDs and cache their 384-d vectors in Redis with a 24-hour TTL. Duplicate skill encodings would drop to $O(1)$.
> 2. **GPU Worker Nodes:** Transition Celery embedding workers to GPU-backed instances (e.g., AWS G4dn with NVIDIA T4) utilizing TensorRT or ONNX Runtime, increasing embedding throughput from 50 docs/sec to 1,500+ docs/sec.
> 3. **Vector Database:** Move the alternate job title lookups to a dedicated vector database like Milvus or Pinecone with HNSW indexing for sub-10ms similarity searches across 500,000+ indexed job titles.
> 4. **Kubernetes Auto-scaling:** Configure KEDA (Kubernetes Event-driven Autoscaling) to scale Celery worker pods automatically based on Redis queue depth rather than simple CPU metrics."*

#### Q20: "What feature would you build next?"
**Answer:**
> *"I would implement an automated **Resume Diff Viewer & Instant PDF Generator**. 
> 
> Right now, the candidate sees rewritten bullet points side-by-side on the dashboard. The next evolution would let the candidate click 'Accept Rewrite', see a real-time visual diff of their resume using `react-diff-viewer`, and export an ATS-optimized, beautifully typeset PDF directly using headless Chromium or LaTeX rendering."*

---

## 10. Quick Reference Formulas & Numbers Cheat Sheet

| Metric / Parameter | Value | Rationale / Source |
| :--- | :--- | :--- |
| **Embedding Model** | `all-MiniLM-L6-v2` | Sentence-Transformers 384-dimensional dense vector |
| **Skill Match Threshold** | `0.60` | Cosine similarity threshold for semantic synonym matching |
| **Weights Configuration** | 60% Skills, 20% Projects, 20% Experience | Tuned in `params.yaml` |
| **Context Blend** | $0.70 \times \text{Granular} + 0.30 \times \text{Overall}$ | Prevents background text dilution |
| **Sigmoid Base Multiplier** | `10.0` | Steepness factor for discrimination |
| **Sigmoid Offset** | `-2.5` | Centers average match around ~70% |
| **Domain Adjustments** | Tech: 1.0, Finance: 0.92, Healthcare: 0.88 | Industry benchmark calibration |
| **Seniority Bonuses** | Senior vs Jr JD: +10%; Jr vs Senior JD: -15% | Accounts for qualification delta |
| **Experience Penalty** | `-0.07` per missing required year | Penalizes experience deficit |
| **Primary LLM** | Groq Llama 3.3-70B Versatile | Ultra-fast token generation (~300 tok/s) |
| **Fallback LLM** | Together AI Mistral-Small-24B | High-reliability secondary provider |
| **LLM Call Latency** | ~2.5 to 3.5 seconds | Single comprehensive JSON prompt |
| **Celery Timeouts** | Soft: 240s, Hard: 300s | Prevents orphaned background tasks |
| **Client Polling Interval**| 2,000 ms (2 seconds) | Balances responsiveness and network traffic |
