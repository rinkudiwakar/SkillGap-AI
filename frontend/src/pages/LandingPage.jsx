import { useEffect, useRef, useState } from "react";
import { uploadResume, submitMatch, getMatchResult } from "../lib/api";

// ── Tiny poll helper ───────────────────────────────────────────────────
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pollForResult(taskId) {
  for (let i = 0; i < 60; i++) {
    const r = await getMatchResult(taskId);
    if (r.status === "completed") return r;
    if (r.status === "failed") throw new Error(r.error || "Task failed.");
    await wait(2000);
  }
  throw new Error("Analysis timed out. Please try again.");
}

// ── Word Count hint ────────────────────────────────────────────────────
function WordCount({ text }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  if (!words) return null;
  const cls = words > 100 ? "ok" : "warn";
  const msg = words > 100
    ? `${words} words — good ✓`
    : `${words} words — paste more for better results`;
  return <div className={`word-count ${cls}`}>{msg}</div>;
}

// ── Hero Upload Box ────────────────────────────────────────────────────
function HeroUploadBox({ onResult }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [jdMode, setJdMode] = useState("text"); // "text" | "url"
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | uploading | analysing | done | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") setFile(f);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleAnalyse = async () => {
    if (!file) { setErrorMsg("Please upload your PDF resume first."); return; }
    if (jdMode === "text" && !jdText.trim()) { setErrorMsg("Please paste a job description."); return; }
    if (jdMode === "url" && !jdUrl.trim()) { setErrorMsg("Please enter a job URL."); return; }
    setErrorMsg("");
    try {
      setPhase("uploading");
      const up = await uploadResume(file);
      setPhase("analysing");
      const submitted = await submitMatch({
        resume_text: up.extracted_text || "",
        jd_text: jdMode === "text" ? jdText.trim() : null,
        jd_url: jdMode === "url" ? jdUrl.trim() : null,
        user_id: null,
        resume_id: up.resume_id,
      });
      const res = await pollForResult(submitted.task_id);
      setPhase("done");
      onResult(res.result, { file, jdText, jdUrl });
    } catch (err) {
      setPhase("error");
      setErrorMsg(err.message || "Analysis failed. Please try again.");
    }
  };

  const isLoading = phase === "uploading" || phase === "analysing";
  const btnLabel = phase === "uploading"
    ? "Processing resume…"
    : phase === "analysing"
    ? "Running AI analysis…"
    : "Analyse My Resume — Free →";

  return (
    <div className="hero-upload-box">
      {/* Step 1 – Drop zone */}
      <div className="hub-step">
        <div className="hub-step-label">
          <span className="hub-step-num">1</span> Upload your resume (PDF)
        </div>
        <div
          className={`dropzone-area${dragging ? " active" : ""}${file ? " has-file" : ""}`}
          onClick={() => !isLoading && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{ cursor: isLoading ? "default" : "pointer" }}
        >
          {file ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.4rem" }}>📄</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{file.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{(file.size / 1024).toFixed(0)} KB · Click to change</div>
              </div>
              <span style={{ marginLeft: "auto", color: "var(--green)", fontWeight: 700 }}>✓</span>
            </div>
          ) : (
            <>
              <div className="dropzone-icon">📄</div>
              <div className="dropzone-label">Drop your PDF here or <strong>click to browse</strong></div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.3rem" }}>PDF only · Max 5MB · Not stored after session</div>
            </>
          )}
          <input ref={inputRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileChange} />
        </div>
      </div>

      {/* Step 2 – JD input with mode toggle */}
      <div className="hub-step">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
          <div className="hub-step-label" style={{ marginBottom: 0 }}>
            <span className="hub-step-num">2</span> Job description
          </div>
          {/* Mode toggle */}
          <div style={{ display: "flex", gap: "0.25rem" }}>
            {[["text", "📋 Paste JD"], ["url", "🔗 Job URL"]].map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => { setJdMode(m); setErrorMsg(""); }}
                disabled={isLoading}
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  border: "1px solid",
                  borderColor: jdMode === m ? "rgba(99,102,241,0.5)" : "var(--border)",
                  background: jdMode === m ? "rgba(99,102,241,0.12)" : "transparent",
                  color: jdMode === m ? "#818CF8" : "var(--muted)",
                  cursor: isLoading ? "default" : "pointer",
                  transition: "all 120ms",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {jdMode === "text" ? (
          <>
            <textarea
              className="hub-jd-input"
              rows={6}
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste the full job description here…"
              disabled={isLoading}
            />
            <WordCount text={jdText} />
          </>
        ) : (
          <input
            type="url"
            value={jdUrl}
            onChange={e => setJdUrl(e.target.value)}
            placeholder="https://linkedin.com/jobs/view/… or Indeed URL"
            disabled={isLoading}
            style={{
              width: "100%",
              height: 44,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "0 0.875rem",
              color: "var(--text)",
              fontSize: "0.8125rem",
              transition: "border-color 150ms, box-shadow 150ms",
            }}
            onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
            onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
          />
        )}
      </div>

      {/* CTA */}
      {errorMsg && <p className="status-note error" style={{ marginTop: "0.5rem" }}>{errorMsg}</p>}
      <button
        className="btn-primary btn-lg"
        style={{ width: "100%", marginTop: "0.5rem", fontSize: "1rem", padding: "1rem", justifyContent: "center" }}
        onClick={handleAnalyse}
        disabled={isLoading}
      >
        {isLoading
          ? <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>{btnLabel}</span>
          : btnLabel}
      </button>
      <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.6rem" }}>
        🔒 No account needed · Free · Results in ~30 seconds
      </p>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Sample Output Preview (static) ────────────────────────────────────
function SampleOutput() {
  return (
    <div className="sample-output-card glass-card">
      {/* Score header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "3.2rem", fontWeight: 700, color: "#F59E0B", lineHeight: 1 }}>73%</div>
          <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "0.2rem" }}>Hiring Probability</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "0.4rem" }}>Analysis complete for</div>
          <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Senior Backend Engineer · Startup</div>
          <div style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontStyle: "italic" }}>
            "Your Python and ML experience closely matches what this role requires. Adding Kubernetes would significantly boost your chances."
          </div>
        </div>
      </div>

      {/* Skill pills preview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>✓ Skills You Have</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {["Python", "Docker", "ML", "React", "AWS"].map(s => (
              <span key={s} className="skill-pill found" style={{ fontSize: "0.82rem" }}>✓ {s}</span>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>✗ Skills You're Missing</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {["Kubernetes", "FastAPI", "Redis", "PostgreSQL"].map(s => (
              <span key={s} className="skill-pill missing" style={{ fontSize: "0.82rem" }}>✗ {s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Single Testimonial ────────────────────────────────────────────────
function SingleTestimonial() {
  return (
    <div className="testimonial-card" style={{ maxWidth: 680, margin: "0 auto" }}>
      <div className="t-header">
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(99,102,241,0.15)", color: "#6366F1", border: "2px solid rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>AS</div>
        <div>
          <div className="t-name">Aditya Sharma</div>
          <div className="t-title">Final Year, IIT Bombay (CS)</div>
        </div>
      </div>
      <div style={{ color: "#F59E0B", fontSize: "0.9rem", margin: "0.6rem 0" }}>★★★★★</div>
      <p className="t-quote">"I was applying blindly to 50+ companies and getting ghosted. SkillGap AI showed me I was missing Kubernetes and FastAPI — two skills in every JD I was targeting. Learned them in 3 weeks. Interview rate went from 2% to 22%."</p>
      <div style={{ marginTop: "0.75rem" }}>
        <span className="badge badge-indigo">Resume & JD Matcher</span>
      </div>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────
export default function LandingPage({ onGetStarted, onGuestResult }) {
  const handleResult = (result, inputs) => {
    // Bubble up the guest analysis result to App.jsx
    if (onGuestResult) onGuestResult(result, inputs);
  };

  return (
    <div>
      {/* ── SECTION 1: HERO WITH UPLOAD ── */}
      <section className="hero" style={{ paddingBottom: "5rem" }}>
        <div className="hero-grad-orb" />
        <div className="hero-grid-lines" />
        <div className="hero-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="particle" style={{ left: `${8 + i * 14}%`, top: `${15 + (i % 3) * 22}%`, "--dur": `${5 + i * 0.9}s`, "--dx": `${(i % 2 ? 1 : -1) * (8 + i * 2)}px`, "--dy": `${-12 - i * 3}px`, animationDelay: `${i * 0.7}s` }} />
          ))}
        </div>

        <div className="hero-inner" style={{ gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
          {/* Left: headline */}
          <div style={{ paddingTop: "2rem" }}>
            <div className="hero-eyebrow" style={{ marginBottom: "1.25rem" }}>
              <span className="badge badge-indigo" style={{ fontSize: "0.82rem", padding: "0.4rem 1rem" }}>✦ AI-Powered Resume Intelligence</span>
            </div>
            <h1 className="hero-title" style={{ lineHeight: 1.08, fontSize: "clamp(2.2rem,4.5vw,3.6rem)" }}>
              Know Your Exact&nbsp;
              <span className="gradient-text">Chances</span>
              <br />Before You Apply.
            </h1>
            <p className="hero-sub" style={{ maxWidth: 480 }}>
              Upload your resume, paste any job description, and get your <strong style={{ color: "var(--text)" }}>hiring probability, missing skills, and AI-rewritten bullets</strong> in under 30 seconds. No account needed.
            </p>
            <div className="hero-stats" style={{ marginTop: "2rem", justifyContent: "flex-start", gap: "2rem" }}>
              <div className="hero-stat"><strong>12,400+</strong><span>Resumes Analysed</span></div>
              <div className="hero-stat"><strong>94%</strong><span>User Satisfaction</span></div>
              <div className="hero-stat"><strong>~30s</strong><span>Avg Analysis Time</span></div>
            </div>
          </div>

          {/* Right: upload box */}
          <div>
            <HeroUploadBox onResult={handleResult} />
            <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>
              Already have an account?{" "}
              <button
                style={{ color: "var(--accent)", fontWeight: 600 }}
                onClick={onGetStarted}
              >
                Sign in →
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: HOW IT WORKS ── */}
      <section className="section" id="how-it-works" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="eyebrow section-title" style={{ marginBottom: "0.5rem" }}>Process</div>
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">Three steps. Under 30 seconds. No account required.</p>
        <div className="steps-row">
          {[
            { num: "01", icon: "📄", title: "Upload Your Resume", desc: "Drop your PDF resume. Our AI parser extracts your skills, experience, and education automatically." },
            { num: "02", icon: "📋", title: "Paste the Job Description", desc: "Copy and paste any job description — from LinkedIn, Indeed, or anywhere else." },
            { num: "03", icon: "🎯", title: "Get Your Report", desc: "See your hiring probability, the skills you're missing, and AI-rewritten bullets — instantly." },
          ].map((s, i) => (
            <div key={s.num} className="step-card glass-card" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: SAMPLE OUTPUT ── */}
      <section className="section" style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid var(--border)" }}>
        <div className="eyebrow section-title" style={{ marginBottom: "0.5rem" }}>Sample Report</div>
        <h2 className="section-title">What Your Report Looks Like</h2>
        <p className="section-sub">Clear scores, plain-English insights, and a skill gap you can act on in seconds.</p>
        <SampleOutput />
      </section>

      {/* ── SECTION 4: ONE TESTIMONIAL ── */}
      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="eyebrow section-title" style={{ marginBottom: "0.5rem" }}>User Story</div>
        <h2 className="section-title">It Works</h2>
        <p className="section-sub" style={{ marginBottom: "2rem" }}>Real result from a student who used SkillGap AI.</p>
        <SingleTestimonial />
      </section>

      {/* ── SECTION 5: CTA ── */}
      <section className="cta-band" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 50%,rgba(99,102,241,0.3),transparent 60%),radial-gradient(circle at 80% 50%,rgba(167,139,250,0.2),transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 580, margin: "0 auto", position: "relative", textAlign: "center" }}>
          <div className="badge badge-indigo" style={{ display: "inline-flex", marginBottom: "1.25rem" }}>✦ Free to start</div>
          <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", marginBottom: "1rem" }}>Ready to Stop Guessing?</h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.65)", marginBottom: "2rem" }}>
            Upload your resume and any job description above — or sign in to save your results and track multiple analyses.
          </p>
          <button className="btn-primary btn-lg" onClick={onGetStarted} style={{ marginBottom: "0.75rem" }}>
            Sign In to Save Results →
          </button>
          <p className="cta-microcopy">No credit card · Instant results · First analysis is always free</p>
        </div>
      </section>
    </div>
  );
}
