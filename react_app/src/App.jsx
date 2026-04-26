import { useDeferredValue, useEffect, useRef, useState } from "react";
import { API_BASE_URL, getMatchResult, submitMatch, uploadResume } from "./lib/api";
import { formatDate, formatPercent, formatScore, toTitleCase } from "./lib/format";
import { hasSupabaseEnv, supabase } from "./lib/supabase";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ResultDetail from "./components/ResultDetail";
import AnalysisProgress from "./components/AnalysisProgress";
import RoadmapTimeline from "./components/analysis/RoadmapTimeline";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import LegalPage from "./pages/LegalPage";

// ── Helpers ──────────────────────────────────────────────────────────
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function buildMatchInsertPayload({ userId, resumeId, jdText, jdSourceUrl, result }) {
  // Only include columns that actually exist in the match_results DB schema
  return {
    user_id: userId, resume_id: resumeId, jd_text: jdText, jd_source_url: jdSourceUrl,
    jd_role: result.jd_role, jd_seniority_level: result.jd_seniority, jd_years_required: result.jd_years_required,
    cosine_similarity: result.cosine_similarity, match_score: result.match_score,
    hiring_probability: result.hiring_probability,
    skill_match_score: result.granular_scores?.skill_match ?? null,
    project_relevance_score: result.granular_scores?.project_relevance ?? null,
    experience_relevance_score: result.granular_scores?.experience_relevance ?? null,
    matched_skills: result.matched_skills || [], missing_skills: result.missing_skills || [],
    critical_missing: result.critical_missing || [], important_missing: result.important_missing || [],
    nice_to_have_missing: result.nice_to_have_missing || [],
    skill_coverage_percentage: result.skill_gap_report?.coverage_percentage ?? null,
    alt_job_titles: result.alternate_titles || [], roadmap: result.roadmap || "",
    resume_suggestions: result.resume_suggestions || "", learning_resources: result.learning_resources || "",
    interview_questions: result.interview_questions || "", processing_time_ms: null,
    rewritten_bullets: result.rewritten_bullets || [],
  };
}

// Merges live API result into the stored Supabase row so ResultDetail can display all fields
function mergeResultForDisplay(storedMatch, liveResult) {
  return {
    ...storedMatch,
    found_skills: liveResult.found_skills || liveResult.matched_skills || [],
    rewritten_bullets: liveResult.rewritten_bullets || [],
    alternate_job_titles: liveResult.alternate_job_titles || liveResult.alternate_titles || [],
    resume_completeness_score: liveResult.resume_completeness_score || null,
    score_factors: liveResult.score_factors || {},
    summary: liveResult.summary || "",
    strengths: liveResult.strengths || [],
    weaknesses: liveResult.weaknesses || [],
    recommended_roles: liveResult.recommended_roles || [],
    roadmap: liveResult.roadmap || "",
  };
}

// ── Initial states ────────────────────────────────────────────────────
const authInit = { fullName: "", email: "", password: "" };
const profileInit = { full_name: "", email: "", profile_picture_url: "", bio: "" };
const appInit = { company: "", role: "", url: "", applied_date: "", status: "Applied", notes: "", match_result_id: "", match_score: "" };

function fixRoleTitle(role, text) {
  if (!role || role === "Unknown Role") {
    if (text) return text.slice(0, 40) + "...";
    return "Target Role";
  }
  if (role.length > 80) return role.slice(0, 80) + "...";
  return role;
}

const DASH_TABS = [
  { id: "analysis", label: "Analysis Lab" },
  { id: "history", label: "Match Archive" },
  { id: "applications", label: "Application Tracker" },
  { id: "profile", label: "Profile" },
];

// ── Insight card (in-dashboard) ───────────────────────────────────────
function InsightCard({ title, body }) {
  if (!body) return null;
  return (
    <div className="panel" style={{ marginTop: "1rem" }}>
      <h4 style={{ marginBottom: "0.75rem" }}>{title}</h4>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{body}</p>
    </div>
  );
}

// ── Drop Zone ─────────────────────────────────────────────────────────
function DropZone({ file, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) onChange(f); };
  return (
    <div>
      <div className={`dropzone-area${dragging ? " active" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
        <div className="dropzone-icon">📄</div>
        <div className="dropzone-label">Drop your PDF here, or <strong>click to browse</strong></div>
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.4rem" }}>Accepted: PDF only · Max 5MB · Not stored after session</div>
        <input ref={inputRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => onChange(e.target.files?.[0] || null)} />
      </div>
      {file && (
        <div className="file-preview"><span className="check">✓</span><span style={{ fontWeight: 500 }}>{file.name}</span><span style={{ color: "var(--muted)", fontSize: "0.8rem", marginLeft: "auto" }}>{(file.size / 1024).toFixed(0)} KB</span></div>
      )}
    </div>
  );
}

// ── Word Count ────────────────────────────────────────────────────────
function WordCount({ text }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const cls = words > 100 ? "ok" : words > 30 ? "" : "warn";
  const msg = words === 0 ? "" : words > 100 ? `${words} words — Good JD length ✓` : `${words} words — paste more for better results`;
  return msg ? <div className={`word-count ${cls}`}>{msg}</div> : null;
}

// ── Main App ──────────────────────────────────────────────────────────
function App() {
  // page routing: home | app | pricing
  const [page, setPage] = useState("home");

  // auth
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("signin");
  const [authForm, setAuthForm] = useState(authInit);
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false); // inline auth toggle

  // dashboard state
  const [activeTab, setActiveTab] = useState("analysis");
  const [profile, setProfile] = useState(profileInit);
  const [profileSaving, setProfileSaving] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [applications, setApplications] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // analysis state
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [jdInputMode, setJdInputMode] = useState("text");
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [analysisTask, setAnalysisTask] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisSaving, setAnalysisSaving] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  // history / applications
  const [historySearch, setHistorySearch] = useState("");
  const [applicationSearch, setApplicationSearch] = useState("");
  const deferredHistorySearch = useDeferredValue(historySearch);
  const deferredApplicationSearch = useDeferredValue(applicationSearch);
  const [applicationForm, setApplicationForm] = useState(appInit);
  const [applicationSubmitting, setApplicationSubmitting] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");

  // ── Boot ──
  useEffect(() => {
    if (!hasSupabaseEnv || !supabase) { setBootLoading(false); return; }
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: s } }) => { if (mounted) { setSession(s); setBootLoading(false); } });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setAuthMessage(""); });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session?.user || !supabase) { setProfile(profileInit); setResumes([]); setMatchResults([]); setApplications([]); setSelectedResumeId(""); return; }
    ensureProfile(session.user).then(() => loadDashboard(session.user.id));
  }, [session]);

  // Auto-show app when session arrives from "home"
  useEffect(() => { if (session && page === "home" && showAuth) setPage("app"); }, [session]);

  async function ensureProfile(user) {
    const base = { id: user.id, email: user.email || "", full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "" };
    const { error } = await supabase.from("user_profiles").upsert(base, { onConflict: "id" });
    if (error) setAuthMessage(error.message);
  }

  async function loadDashboard(userId) {
    setDashboardLoading(true);
    const [pr, rr, mr, ar] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("resumes").select("*").order("created_at", { ascending: false }),
      supabase.from("match_results").select("*").order("created_at", { ascending: false }),
      supabase.from("applications").select("*").order("created_at", { ascending: false }),
    ]);
    if (pr.data) setProfile({ full_name: pr.data.full_name || "", email: pr.data.email || session?.user?.email || "", profile_picture_url: pr.data.profile_picture_url || "", bio: pr.data.bio || "" });
    else setProfile(c => ({ ...c, email: session?.user?.email || "" }));
    if (!rr.error && rr.data) { setResumes(rr.data); if (!selectedResumeId && rr.data[0]) setSelectedResumeId(rr.data[0].id); }
    if (!mr.error && mr.data) setMatchResults(mr.data);
    if (!ar.error && ar.data) setApplications(ar.data);
    const err = pr.error || rr.error || mr.error || ar.error;
    if (err) setAuthMessage(err.message);
    setDashboardLoading(false);
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    if (!supabase) return;
    setAuthLoading(true); setAuthMessage("");
    const action = authMode === "signin"
      ? supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password })
      : supabase.auth.signUp({ email: authForm.email, password: authForm.password, options: { data: { full_name: authForm.fullName } } });
    const { error } = await action;
    if (error) setAuthMessage(error.message);
    else { setAuthMessage(authMode === "signin" ? "Signed in successfully." : "Account created. Check your email if confirmation is enabled."); if (authMode === "signin") setPage("app"); }
    setAuthLoading(false);
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    if (!session?.user || !supabase) return;
    setProfileSaving(true); setAuthMessage("");
    const { error } = await supabase.from("user_profiles").upsert({ id: session.user.id, email: profile.email || session.user.email || "", full_name: profile.full_name, profile_picture_url: profile.profile_picture_url, bio: profile.bio }, { onConflict: "id" });
    setAuthMessage(error ? error.message : "Profile saved.");
    setProfileSaving(false);
  }

  async function handleResumeUpload(e) {
    e.preventDefault();
    if (!resumeFile || !session?.user || !supabase) { setUploadMessage("Choose a PDF resume first."); return; }
    setUploading(true); setUploadMessage(""); setAnalysisError("");
    try {
      const up = await uploadResume(resumeFile);
      const row = { id: up.resume_id, user_id: session.user.id, s3_key: up.file_path, filename: up.filename, file_size_bytes: resumeFile.size, extraction_confidence: up.extraction_confidence, extracted_text: up.extracted_text, raw_sections: up.raw_sections };
      const { data, error } = await supabase.from("resumes").insert(row).select().single();
      if (error) throw error;
      setResumes(c => [data, ...c.filter(i => i.id !== data.id)]);
      setSelectedResumeId(data.id);
      setUploadMessage("Resume processed successfully.");
      setResumeFile(null);
    } catch (err) { setUploadMessage(err.message || "Failed to upload resume."); }
    finally { setUploading(false); }
  }

  async function handleRunAnalysis(e) {
    e.preventDefault();
    if (!selectedResume || !session?.user || !supabase) { setAnalysisError("Select a processed resume first."); return; }
    if ((jdInputMode === "text" && !jdText.trim()) || (jdInputMode === "url" && !jdUrl.trim())) { setAnalysisError(jdInputMode === "text" ? "Paste a job description." : "Add a job URL."); return; }
    setAnalysisTask({ status: "submitting", taskId: "" }); setAnalysisResult(null); setAnalysisSaving(false); setAnalysisError("");
    try {
      const submitted = await submitMatch({ resume_text: selectedResume.extracted_text || "", jd_text: jdInputMode === "text" ? jdText.trim() : null, jd_url: jdInputMode === "url" ? jdUrl.trim() : null, user_id: session.user.id, resume_id: selectedResume.id });
      setAnalysisTask({ status: "pending", taskId: submitted.task_id });
      const res = await pollForResult(submitted.task_id);
      setAnalysisTask({ status: res.status, taskId: submitted.task_id }); setAnalysisSaving(true);
      const payload = buildMatchInsertPayload({ userId: session.user.id, resumeId: selectedResume.id, jdText: jdInputMode === "text" ? jdText.trim() : res.result?.jd_text || "", jdSourceUrl: jdInputMode === "url" ? jdUrl.trim() : null, result: res.result });
      const { data: storedMatch, error: matchError } = await supabase.from("match_results").insert(payload).select().single();
      if (matchError) throw matchError;
      await supabase.from("match_history").insert({ user_id: session.user.id, match_result_id: storedMatch.id, snapshot_match_score: storedMatch.match_score, snapshot_hiring_probability: storedMatch.hiring_probability, snapshot_timestamp: new Date().toISOString() });
      const displayResult = mergeResultForDisplay(storedMatch, res.result);
      setMatchResults(c => [displayResult, ...c]);
      setAnalysisResult(displayResult); setAnalysisSaving(false); setActiveTab("history");
    } catch (err) { setAnalysisSaving(false); setAnalysisTask(null); setAnalysisError(err.message || "Analysis failed."); }
  }

  async function pollForResult(taskId) {
    for (let i = 0; i < 60; i++) {
      const r = await getMatchResult(taskId);
      if (r.status === "completed") return r;
      if (r.status === "failed") throw new Error(r.error || "Task failed.");
      await wait(2000);
    }
    throw new Error("Analysis timed out.");
  }

  async function handleApplicationSubmit(e) {
    e.preventDefault();
    if (!session?.user || !supabase) return;
    setApplicationSubmitting(true); setApplicationMessage("");
    const { data, error } = await supabase.from("applications").insert({ user_id: session.user.id, company: applicationForm.company, role: applicationForm.role, url: applicationForm.url || null, applied_date: applicationForm.applied_date || null, status: applicationForm.status, notes: applicationForm.notes || null, match_result_id: applicationForm.match_result_id || null, match_score: applicationForm.match_score ? Number(applicationForm.match_score) : null }).select().single();
    if (error) setApplicationMessage(error.message);
    else { setApplications(c => [data, ...c]); setApplicationForm(appInit); setApplicationMessage("Application saved."); }
    setApplicationSubmitting(false);
  }

  async function updateApplicationStatus(id, status) {
    if (!supabase) return;
    const { data, error } = await supabase.from("applications").update({ status }).eq("id", id).select().single();
    if (error) { setApplicationMessage(error.message); return; }
    setApplications(c => c.map(i => i.id === id ? data : i));
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setActiveTab("analysis"); setAnalysisResult(null); setApplicationMessage(""); setPage("home");
  }

  // Derived
  const selectedResume = resumes.find(i => i.id === selectedResumeId) || null;
  const matchOptions = matchResults.map(i => ({ id: i.id, label: `${i.jd_role || "Untitled"} | ${formatPercent(i.match_score)}` }));
  const historyItems = matchResults.filter(i => { const q = deferredHistorySearch.trim().toLowerCase(); if (!q) return true; return [i.jd_role, i.jd_text, i.jd_source_url, i.resume_id].filter(Boolean).some(v => v.toLowerCase().includes(q)); });
  const applicationItems = applications.filter(i => { const q = deferredApplicationSearch.trim().toLowerCase(); if (!q) return true; return [i.company, i.role, i.status, i.notes].filter(Boolean).some(v => v.toLowerCase().includes(q)); });
  const topMatch = matchResults[0];
  const averageMatch = matchResults.length > 0 ? matchResults.reduce((s, i) => s + Number(i.match_score || 0), 0) / matchResults.length : 0;
  const isAnalysing = analysisTask?.status === "pending" || analysisTask?.status === "submitting";

  // ── Missing env ──
  if (!hasSupabaseEnv) return (
    <div className="boot-screen"><div className="boot-card"><div className="eyebrow">Setup</div><h2>Supabase env missing</h2><p className="muted">Create <code>react_app/.env</code> from <code>.env.example</code> and add VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_API_BASE_URL.</p></div></div>
  );

  if (bootLoading) return (
    <div className="boot-screen"><div className="boot-card"><div className="eyebrow">Loading</div><h2>Preparing your workspace.</h2><p className="muted">Connecting to Supabase…</p></div></div>
  );

  const handleGetStarted = () => { if (session) { setPage("app"); } else { setShowAuth(true); setPage("auth"); } };
  const handleSignIn = () => { setPage("auth"); setShowAuth(true); };

  // ── AUTH PAGE ──
  if (page === "auth" || (!session && showAuth)) {
    return (
      <div className="auth-shell">
        <div className="auth-hero-side">
          <div className="eyebrow" style={{ marginBottom: "1.5rem" }}>SkillGap AI</div>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3.2rem)", marginBottom: "1.5rem" }}>Know Your <span className="gradient-text">Exact Chances</span><br />Before You Apply.</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.05rem", lineHeight: 1.8, maxWidth: 420, marginBottom: "2rem" }}>Upload resumes, score fit against real job descriptions using semantic AI, and track every application.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {["Semantic AI Matching", "Skill Gap Analysis", "Bullet Rewriter", "Alternate Job Titles"].map(b => <span key={b} className="badge badge-indigo">{b}</span>)}
          </div>
        </div>
        <div className="auth-card-side">
          <button onClick={() => { setPage("home"); setShowAuth(false); }} style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>← Back to home</button>
          <div className="eyebrow">{authMode === "signin" ? "Welcome back" : "Create account"}</div>
          <h2 style={{ marginBottom: "2rem", fontSize: "1.8rem" }}>{authMode === "signin" ? "Sign in to your workspace" : "Start building your profile"}</h2>
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "signup" && (
              <div className="field"><label className="field-label">Full name</label><input value={authForm.fullName} onChange={e => setAuthForm(c => ({ ...c, fullName: e.target.value }))} placeholder="Aanya Sharma" required /></div>
            )}
            <div className="field"><label className="field-label">Email</label><input type="email" value={authForm.email} onChange={e => setAuthForm(c => ({ ...c, email: e.target.value }))} placeholder="you@example.com" required /></div>
            <div className="field"><label className="field-label">Password</label><input type="password" value={authForm.password} onChange={e => setAuthForm(c => ({ ...c, password: e.target.value }))} placeholder="Minimum 6 characters" required /></div>
            <button className="btn-primary" disabled={authLoading} type="submit" style={{ width: "100%", padding: "1rem", marginTop: "0.5rem" }}>{authLoading ? "Working…" : authMode === "signin" ? "Sign In →" : "Create Account →"}</button>
            {authMessage && <p className={`status-note${authMessage.includes("success") || authMessage.includes("created") ? " success" : " error"}`}>{authMessage}</p>}
            <div className="auth-switch">
              {authMode === "signin" ? "New here? " : "Already have an account? "}
              <button type="button" onClick={() => setAuthMode(m => m === "signin" ? "signup" : "signin")}>{authMode === "signin" ? "Create account" : "Sign in"}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── HOME / PRICING / LEGAL (public) ──
  const isLegalPage = page === "legal-terms" || page === "legal-privacy" || page === "legal-data";
  if (!session || page === "home" || page === "pricing" || isLegalPage) {
    const legalSection = page === "legal-privacy" ? "privacy" : page === "legal-data" ? "data" : "terms";
    return (
      <div>
        <Navbar onGetStarted={handleGetStarted} onSignIn={handleSignIn} session={session} onSignOut={handleSignOut} currentPage={page} setPage={setPage} />
        {isLegalPage
          ? <LegalPage initialSection={legalSection} />
          : page === "pricing"
            ? <PricingPage onGetStarted={handleGetStarted} />
            : <LandingPage onGetStarted={handleGetStarted} />
        }
        <Footer setPage={setPage} />
      </div>
    );
  }


  // ── DASHBOARD (authenticated) ──
  return (
    <div className="app-shell">
      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-logo" style={{ cursor: "pointer" }} onClick={() => setPage("home")}>
          <div className="logo-dot" />
          SkillGap AI
        </div>
        <div className="topbar-actions">
          <div className="chip-stack">
            <span className="chip">{resumes.length} resumes</span>
            <span className="chip">{matchResults.length} analyses</span>
            <span className="chip">{applications.length} applications</span>
          </div>
          <span className="chip" style={{ color: "var(--muted)" }}>{session.user.email}</span>
          <button className="btn-ghost btn-sm" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>

      <div className="workspace">
        {authMessage && <div className="app-message" style={{ marginBottom: "1rem" }}>{authMessage}</div>}
        {dashboardLoading && <p className="status-note" style={{ marginBottom: "1rem" }}>Refreshing workspace data…</p>}

        {/* Dashboard Tabs */}
        <div className="dash-tabs">
          {DASH_TABS.map(t => (
            <button key={t.id} className={`dash-tab${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* ── ANALYSIS TAB ── */}
        {activeTab === "analysis" && (
          <div className="workspace-grid">
            {/* Upload Panel */}
            <div className="panel">
              <div className="panel-heading"><div><div className="eyebrow">Step 1</div><h3>Upload Resume</h3></div></div>
              <form className="stack" onSubmit={handleResumeUpload}>
                <DropZone file={resumeFile} onChange={setResumeFile} />
                <button className="btn-primary" disabled={uploading || !resumeFile} type="submit">{uploading ? "Uploading…" : "Process Resume"}</button>
                {uploadMessage && <p className={`status-note${uploadMessage.includes("success") ? " success" : ""}`}>{uploadMessage}</p>}
              </form>
              {resumes.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>Saved Resumes</div>
                  <div className="resume-list">
                    {resumes.map(r => (
                      <button key={r.id} className={`resume-card${r.id === selectedResumeId ? " active" : ""}`} onClick={() => setSelectedResumeId(r.id)} type="button" style={{ textAlign: "left" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.3rem" }}>
                          <strong className="text-truncate-1">{r.filename}</strong>
                          <span className="badge badge-indigo" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>{Math.round((r.extraction_confidence || 0) * 100)}%</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", display: "flex", justifyContent: "space-between" }}>
                          <span>{formatDate(r.created_at)}</span>
                          <span>{(r.file_size_bytes / 1024).toFixed(0)} KB</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Panel */}
            <div className="panel">
              <div className="panel-heading"><div><div className="eyebrow">Step 2</div><h3>Run Job Match</h3></div></div>
              <form className="stack" onSubmit={handleRunAnalysis}>
                <div className="field">
                  <label className="field-label">Selected resume</label>
                  <select value={selectedResumeId} onChange={e => setSelectedResumeId(e.target.value)}>
                    <option value="">Choose a processed resume</option>
                    {resumes.map(r => <option key={r.id} value={r.id}>{r.filename}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  {[["text", "Paste JD"], ["url", "Job URL"]].map(([m, l]) => (
                    <button key={m} type="button" className={`tab-btn${jdInputMode === m ? " active" : ""}`} onClick={() => setJdInputMode(m)}>{l}</button>
                  ))}
                </div>
                {jdInputMode === "text" ? (
                  <div className="field">
                    <label className="field-label">Job description</label>
                    <textarea rows={10} value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the full job description here…" />
                    <WordCount text={jdText} />
                  </div>
                ) : (
                  <div className="field">
                    <label className="field-label">Job URL (LinkedIn / Indeed)</label>
                    <input type="url" value={jdUrl} onChange={e => setJdUrl(e.target.value)} placeholder="https://linkedin.com/jobs/view/…" />
                  </div>
                )}
                <button className="btn-primary" style={{ padding: "1rem" }} disabled={!selectedResume || analysisSaving || isAnalysing || (jdInputMode === "text" ? !jdText.trim() : !jdUrl.trim())} type="submit">
                  {isAnalysing ? "Analysing…" : analysisSaving ? "Saving…" : "Analyse My Resume →"}
                </button>
                <AnalysisProgress active={isAnalysing} />
                {analysisError && <p className="status-note error">{analysisError}</p>}
              </form>
              {selectedResume && !isAnalysing && (
                <div style={{ marginTop: "1.25rem", padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                  <div className="eyebrow" style={{ marginBottom: "0.4rem" }}>Resume Preview</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{selectedResume.extracted_text || "No extracted text."}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div className="workspace-grid side-right">
            <div className="panel">
              <div className="panel-heading">
                <div><div className="eyebrow">Stored results</div><h3>Match Archive</h3></div>
                <input className="search-input" placeholder="Search by role…" value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
              </div>
              <div className="result-list">
                {historyItems.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">📊</div><p>No analysis runs saved yet.</p></div>
                ) : historyItems.map(i => (
                  <button key={i.id} className={`result-card${analysisResult?.id === i.id ? " active" : ""}`} onClick={() => setAnalysisResult(i)} type="button" style={{ textAlign: "left" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.4rem" }}>
                      <strong className="text-truncate-1" style={{ fontSize: "0.95rem" }}>{fixRoleTitle(i.jd_role, i.jd_text)}</strong>
                      <span className={`badge ${Number(i.hiring_probability) > 70 ? "badge-green" : Number(i.hiring_probability) > 40 ? "badge-amber" : "badge-red"}`} style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}>
                        {i.hiring_probability}%
                      </span>
                    </div>
                    <div className="text-truncate-1" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginBottom: "0.5rem" }}>
                      {i.jd_source_url || "Direct upload"}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--muted)" }}>
                      <span>Score: {formatPercent(i.match_score)}</span>
                      <span>{formatDate(i.created_at)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="panel" style={{ minHeight: 600 }}>
              <div className="panel-heading"><div><div className="eyebrow">Deep Dive</div><h3>{fixRoleTitle(analysisResult?.jd_role)}</h3></div></div>
              {analysisResult ? (
                <>
                  <ResultDetail result={analysisResult} />
                  {/* Roadmap timeline (replaces InsightCard for roadmap) */}
                  {analysisResult.roadmap && (
                    <div className="panel" style={{ marginTop: "1rem" }}>
                      <RoadmapTimeline roadmap={analysisResult.roadmap} />
                    </div>
                  )}
                  <InsightCard title="Resume Suggestions" body={analysisResult.resume_suggestions} />
                  <InsightCard title="Interview Questions" body={analysisResult.interview_questions} />
                </>
              ) : (
                <div className="empty-state"><div className="empty-icon">🎯</div><p>Choose a saved analysis to review the full report.</p></div>
              )}
            </div>
          </div>
        )}

        {/* ── APPLICATIONS TAB ── */}
        {activeTab === "applications" && (
          <div className="workspace-grid">
            <div className="panel">
              <div className="panel-heading"><div><div className="eyebrow">Pipeline</div><h3>Add Application</h3></div></div>
              <form className="stack" onSubmit={handleApplicationSubmit}>
                <div className="field"><label className="field-label">Company</label><input value={applicationForm.company} onChange={e => setApplicationForm(c => ({ ...c, company: e.target.value }))} placeholder="OpenAI" required /></div>
                <div className="field"><label className="field-label">Role</label><input value={applicationForm.role} onChange={e => setApplicationForm(c => ({ ...c, role: e.target.value }))} placeholder="Backend Engineer" required /></div>
                <div className="field">
                  <label className="field-label">Related match result</label>
                  <select value={applicationForm.match_result_id} onChange={e => { const id = e.target.value; const rel = matchResults.find(m => m.id === id); setApplicationForm(c => ({ ...c, match_result_id: id, match_score: rel?.match_score || "", role: c.role || rel?.jd_role || "" })); }}>
                    <option value="">None</option>
                    {matchOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>
                <div className="inline-fields">
                  <div className="field">
                    <label className="field-label">Status</label>
                    <select value={applicationForm.status} onChange={e => setApplicationForm(c => ({ ...c, status: e.target.value }))}>
                      {["Applied", "Interview", "Offer", "Rejected", "Withdrawn"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="field"><label className="field-label">Applied date</label><input type="date" value={applicationForm.applied_date} onChange={e => setApplicationForm(c => ({ ...c, applied_date: e.target.value }))} /></div>
                </div>
                <div className="field"><label className="field-label">Job URL</label><input value={applicationForm.url} onChange={e => setApplicationForm(c => ({ ...c, url: e.target.value }))} placeholder="https://company.com/jobs/123" /></div>
                <div className="field"><label className="field-label">Notes</label><textarea rows={4} value={applicationForm.notes} onChange={e => setApplicationForm(c => ({ ...c, notes: e.target.value }))} placeholder="Referral info, salary band, prep notes…" /></div>
                <button className="btn-primary" disabled={applicationSubmitting} type="submit">{applicationSubmitting ? "Saving…" : "Save Application"}</button>
                {applicationMessage && <p className="status-note success">{applicationMessage}</p>}
              </form>
            </div>
            <div className="panel">
              <div className="panel-heading">
                <div><div className="eyebrow">Tracker</div><h3>Application Board</h3></div>
                <input className="search-input" placeholder="Search applications…" value={applicationSearch} onChange={e => setApplicationSearch(e.target.value)} />
              </div>
              {applicationItems.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📋</div><p>No applications tracked yet. Add your first one!</p></div>
              ) : (
                <div className="kanban" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
                  {["Applied", "Interview", "Offer", "Rejected"].map(col => {
                    const colItems = applicationItems.filter(i => i.status === col);
                    return (
                      <div key={col} className="kanban-col">
                        <div className="kanban-col-header" style={{ color: col === "Offer" ? "var(--green)" : col === "Rejected" ? "var(--red)" : col === "Interview" ? "var(--amber)" : "var(--muted)" }}>{col} ({colItems.length})</div>
                        {colItems.length === 0 ? <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.2)", textAlign: "center", padding: "0.75rem 0" }}>Empty</div> : colItems.map(a => (
                          <div key={a.id} className="kanban-card">
                            <strong style={{ fontSize: "0.9rem" }}>{a.company}</strong>
                            <div style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0.25rem 0" }}>{a.role}</div>
                            {a.match_score && <span className="badge badge-indigo" style={{ fontSize: "0.72rem" }}>Match {formatPercent(a.match_score)}</span>}
                            <select style={{ display: "block", marginTop: "0.5rem", width: "100%", fontSize: "0.78rem", padding: "0.3rem 0.5rem", borderRadius: "6px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.05)", color: "var(--muted)" }} value={a.status} onChange={e => updateApplicationStatus(a.id, e.target.value)}>
                              {["Applied", "Interview", "Offer", "Rejected", "Withdrawn"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div className="workspace-grid">
            <div className="panel">
              <div className="panel-heading"><div><div className="eyebrow">Identity</div><h3>Profile Settings</h3></div></div>
              <form className="stack" onSubmit={handleProfileSave}>
                <div className="field"><label className="field-label">Full name</label><input value={profile.full_name} onChange={e => setProfile(c => ({ ...c, full_name: e.target.value }))} /></div>
                <div className="field"><label className="field-label">Email</label><input type="email" value={profile.email} onChange={e => setProfile(c => ({ ...c, email: e.target.value }))} /></div>
                <div className="field"><label className="field-label">Profile picture URL</label><input value={profile.profile_picture_url} onChange={e => setProfile(c => ({ ...c, profile_picture_url: e.target.value }))} placeholder="https://…" /></div>
                <div className="field"><label className="field-label">Bio</label><textarea rows={5} value={profile.bio} onChange={e => setProfile(c => ({ ...c, bio: e.target.value }))} /></div>
                <button className="btn-primary" disabled={profileSaving} type="submit">{profileSaving ? "Saving…" : "Save Profile"}</button>
              </form>
            </div>
            <div className="panel">
              <div className="panel-heading"><div><div className="eyebrow">Snapshot</div><h3>Workspace Summary</h3></div></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[["Saved Resumes", resumes.length], ["Completed Analyses", matchResults.length], ["Tracked Applications", applications.length], ["Average Match", formatPercent(averageMatch)]].map(([label, val]) => (
                  <div key={label} className="score-box"><span>{label}</span><strong style={{ fontSize: "1.6rem" }}>{val}</strong></div>
                ))}
              </div>
              {topMatch && (
                <div style={{ marginTop: "1rem" }} className="score-box">
                  <span>Best Match</span>
                  <strong style={{ fontSize: "1rem" }}>{topMatch.jd_role} — {topMatch.hiring_probability}%</strong>
                </div>
              )}
              <div style={{ marginTop: "1.25rem", fontSize: "0.82rem", color: "var(--muted)" }}>API URL: <code>{API_BASE_URL}</code></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
