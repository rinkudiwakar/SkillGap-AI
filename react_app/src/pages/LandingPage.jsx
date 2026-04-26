import { useEffect, useRef, useState } from "react";
import SampleReportModal from "../components/SampleReportModal";

// ── Counter hook ──────────────────────────────────────────────────────
function useCountUp(target, trigger) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / 60;
    const id = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.round(start));
      if (start >= target) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [target, trigger]);
  return val;
}

function StatCounter({ value, label, suffix = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const count = useCountUp(value, visible);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div className="hero-stat" ref={ref}>
      <strong>{count.toLocaleString()}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}

// ── Animated hero widget ──────────────────────────────────────────────
function HeroWidget() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2200);
    const t2 = setTimeout(() => setPhase(0), 7500);
    const t3 = setInterval(() => { setPhase(0); setTimeout(() => setPhase(1), 2200); }, 9000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(t3); };
  }, []);
  return (
    <div className="hero-widget">
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", display: "inline-block", boxShadow: "0 0 6px var(--green)", animation: "pulse 2s ease-in-out infinite" }} />
        Live Analysis
      </div>
      <div className="widget-skeleton" style={{ marginBottom: "1rem" }}>
        {["80%", "60%", "80%", "40%", "65%"].map((w, i) => (
          <div key={i} style={{ height: 9, background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: 6, width: w, animation: `shimmer 2s ease-in-out ${i * 0.2}s infinite alternate` }} />
        ))}
      </div>
      {phase === 0 ? (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ animation: "spin 1.2s linear infinite", display: "inline-block" }}>⟳</span> Semantic matching in progress…
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
            <div className="scan-fill" style={{ height: "100%", background: "linear-gradient(90deg,#6366F1,#A78BFA,#F59E0B)", borderRadius: 3 }} />
          </div>
        </div>
      ) : (
        <div style={{ animation: "fadeSlide 0.4s ease" }}>
          <div style={{ textAlign: "center", margin: "0.5rem 0 1rem" }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "3.2rem", fontWeight: 700, color: "#F59E0B", lineHeight: 1 }}>73%</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>Hiring Probability · ±5% confidence</div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {[["✓ Python", "found"], ["✓ React", "found"], ["✗ Kubernetes", "missing"]].map(([label, type]) => (
              <span key={label} className={`wpill ${type}`} style={{ animation: "pillIn 0.4s ease both" }}>{label}</span>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @keyframes shimmer{from{opacity:0.4}to{opacity:0.9}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .scan-fill{animation:scanAnim 2.5s ease-in-out infinite}
        @keyframes scanAnim{0%{width:0}70%{width:100%}100%{width:100%}}
      `}</style>
    </div>
  );
}

// ── Rotating Testimonials Carousel ────────────────────────────────────
const TESTIMONIALS = [
  { name: "Aditya Sharma", title: "Final Year, IIT Bombay (CS)", initials: "AS", color: "#6366F1", bg: "rgba(99,102,241,0.15)", quote: "I was applying blindly to 50+ companies and getting ghosted. SkillGap AI showed me I was missing Kubernetes and FastAPI — two skills in every JD. Learned them in 3 weeks. Interview rate went from 2% to 22%.", tag: "Resume & JD Matcher", rating: 5 },
  { name: "Priya Mehta", title: "Software Engineer, Bengaluru (2 YOE)", initials: "PM", color: "#A78BFA", bg: "rgba(167,139,250,0.15)", quote: "The bullet rewriter alone is worth it. I knew my experience was good but couldn't articulate it. SkillGap AI rewrote my bullets with actual JD keywords — kept my real numbers intact. Shortlisted at 3 product companies within a week.", tag: "Bullet Rewriter", rating: 5 },
  { name: "Rahul Verma", title: "Career Switcher, Delhi (Finance → Tech)", initials: "RV", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", quote: "I was transitioning to product management and had no idea which roles to target. The 'Alternate Job Titles' feature told me I was best at Business Analyst at 78%+ match — not PM at 51%. That clarity saved months.", tag: "Alternate Job Titles", rating: 5 },
  { name: "Sneha Iyer", title: "MCA Graduate, Pune", initials: "SI", color: "#10B981", bg: "rgba(16,185,129,0.12)", quote: "My resume completeness score was 61% — I didn't realise I was missing a Summary section and zero quantified bullet points. Fixed those two things and my ATS pass rate visibly improved.", tag: "Resume Completeness", rating: 5 },
  { name: "Karan Nair", title: "B.Tech CSE, NIT Trichy", initials: "KN", color: "#EC4899", bg: "rgba(236,72,153,0.12)", quote: "Applied to 20 roles and got zero calls. Used SkillGap AI once and realised my resume was at 48% match for the roles I was targeting. Tailored my bullets and match jumped to 79%. Got 4 interview calls in a week.", tag: "Score Improvement", rating: 5 },
  { name: "Divya Krishnan", title: "Data Scientist, Hyderabad", initials: "DK", color: "#06B6D4", bg: "rgba(6,182,212,0.12)", quote: "The semantic matching is genuinely different from keyword scanners. It recognized that my 'statistical modeling' experience matched 'predictive analytics' in the JD. That nuance matters a lot for senior roles.", tag: "Semantic Matching", rating: 5 },
];

function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const total = TESTIMONIALS.length;
  const visible = 3;

  useEffect(() => {
    const id = setInterval(() => setCurrent(c => (c + 1) % total), 3500);
    return () => clearInterval(id);
  }, [total]);

  const getVisible = () => {
    const items = [];
    for (let i = 0; i < visible; i++) {
      items.push(TESTIMONIALS[(current + i) % total]);
    }
    return items;
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
        {getVisible().map((t, idx) => (
          <div key={`${t.name}-${current}-${idx}`} style={{ animation: "fadeSlide 0.5s ease both", animationDelay: `${idx * 80}ms` }} className="testimonial-card">
            <div className="t-header">
              {/* Avatar with initials */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div className="t-avatar" style={{ background: t.bg, color: t.color, border: `2px solid ${t.color}50`, width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.95rem", boxShadow: `0 0 16px ${t.color}25` }}>
                  {t.initials}
                </div>
                <div style={{ position: "absolute", bottom: 0, right: -2, width: 14, height: 14, background: "var(--green)", borderRadius: "50%", border: "2px solid var(--bg)", boxShadow: "0 0 6px var(--green)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="t-name">{t.name}</div>
                <div className="t-title">{t.title}</div>
              </div>
            </div>
            <div style={{ color: "#F59E0B", fontSize: "0.85rem", margin: "0.5rem 0" }}>{"★".repeat(t.rating)}</div>
            <p className="t-quote">"{t.quote}"</p>
            <div className="t-tag" style={{ marginTop: "1rem" }}>
              <span className="badge badge-indigo">{t.tag}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, background: i === current ? "var(--accent)" : "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", transition: "all 0.3s" }} />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, marginTop: "1.25rem", overflow: "hidden", maxWidth: 300, margin: "1.25rem auto 0" }}>
        <div key={current} style={{ height: "100%", background: "var(--accent)", borderRadius: 1, animation: "progressAuto 3.5s linear" }} />
      </div>
      <style>{`@keyframes progressAuto{from{width:0}to{width:100%}}`}</style>
    </div>
  );
}

// ── Demo Video Section ────────────────────────────────────────────────
function DemoVideo({ onGetStarted }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Video player shell */}
      <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: "#0b0e1a", border: "1px solid var(--border)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", aspectRatio: "16/9" }}>
        {/* Fake browser chrome bar */}
        <div style={{ background: "rgba(255,255,255,0.04)", padding: "0.65rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {["#EF4444", "#F59E0B", "#10B981"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "0.25rem 0.75rem", fontSize: "0.75rem", color: "var(--muted)", textAlign: "center" }}>skillgap.ai — Analysis in progress</div>
        </div>

        {/* Video content / preview */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 380, background: "linear-gradient(135deg,#0A0F1E 0%,#0d1228 50%,#0A0F1E 100%)" }}>
          {/* Background glow */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 50%,rgba(99,102,241,0.12),transparent 60%),radial-gradient(circle at 70% 50%,rgba(245,158,11,0.08),transparent 60%)", pointerEvents: "none" }} />

          {!playing ? (
            <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              {/* Mock UI preview */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: 560, margin: "0 auto 2rem", padding: "0 1rem" }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.5rem" }}>HIRING PROBABILITY</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "2.5rem", fontWeight: 700, color: "#F59E0B" }}>73%</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>±5% confidence</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[["Python", "found"], ["Docker", "found"], ["Kubernetes", "missing"], ["FastAPI", "missing"]].map(([s, t]) => (
                    <span key={s} className={`skill-pill ${t}`} style={{ fontSize: "0.78rem" }}>{t === "found" ? "✓" : "✗"} {s}</span>
                  ))}
                </div>
              </div>

              {/* Play button */}
              <button onClick={() => setPlaying(true)} style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--accent)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", boxShadow: "0 0 0 12px rgba(99,102,241,0.15), 0 0 0 24px rgba(99,102,241,0.07)", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                <span style={{ fontSize: "1.6rem", marginLeft: 4 }}>▶</span>
              </button>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "1rem" }}>Watch a 90-second product demo</p>
            </div>
          ) : (
            <div style={{ position: "absolute", inset: 0 }}>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1"
                title="SkillGap AI Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: "none" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Below video stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginTop: "2rem" }}>
        {[["⚡ 8 seconds", "Average analysis time"], ["🎯 94%", "User satisfaction rate"], ["🔒 Zero storage", "No resume stored after session"]].map(([val, label]) => (
          <div key={val} style={{ textAlign: "center", padding: "1.25rem", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 12 }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.25rem" }}>{val}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button className="btn-primary btn-lg" onClick={onGetStarted}>Try It on Your Resume →</button>
        <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.75rem" }}>Free · No account needed · Results in 30 seconds</p>
      </div>
    </div>
  );
}

// ── FAQ Accordion ─────────────────────────────────────────────────────
const FAQS = [
  { q: "Is my resume stored after analysis?", a: "No. Resume data is processed in-session and purged after your analysis is complete. We do not store or read your personal documents beyond the analysis window." },
  { q: "What makes this different from an ATS keyword scanner?", a: "ATS scanners check for literal word matches. SkillGap AI uses sentence-transformer models — the same technology behind Google Search — to understand meaning, not just words. \"Built ensemble models\" and \"XGBoost experience\" are recognised as the same skill." },
  { q: "How accurate is the hiring probability score?", a: "The score is calibrated against domain-specific benchmarks and accounts for cosine match score, seniority alignment, keyword density, and years of experience. Consistently rated useful by 94% of users — it is an estimate, not a guarantee." },
  { q: "Can I use this for any industry, not just tech?", a: "The current model is optimised for tech, software engineering, data science, and product roles. Expansion to finance, healthcare, and consulting is on our roadmap." },
  { q: "What file formats does SkillGap AI accept?", a: "PDF resume uploads and plain text paste are both supported. You can also paste a LinkedIn or Indeed job URL instead of copying the JD text manually." },
  { q: "Is there a free tier?", a: "Yes — your first analysis is completely free with no account required. Create a free account to save your history and access additional analyses." },
];

function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {items.map((item, i) => (
        <div key={i} className={`accordion-item${open === i ? " open" : ""}`}>
          <button className="accordion-trigger" onClick={() => setOpen(open === i ? null : i)}>
            {item.q}
            <span className="accordion-icon" style={{ fontSize: "1.3rem", fontWeight: 400 }}>+</span>
          </button>
          {open === i && <div className="accordion-body" style={{ animation: "fadeSlide 0.2s ease" }}>{item.a}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Live Demo Tabs ────────────────────────────────────────────────────
function DemoSection() {
  const [tab, setTab] = useState("overview");
  return (
    <div id="demo">
      <div className="tab-bar" style={{ maxWidth: 640, margin: "0 auto 1.5rem" }}>
        {[["overview", "📊 Match Overview"], ["skills", "🔍 Skill Gap"], ["bullets", "✍️ Rewritten Bullets"], ["titles", "🗂️ Alternate Titles"]].map(([id, label]) => (
          <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="tab-content glass-card" style={{ padding: "2rem", maxWidth: 820, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: "2rem", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "4.5rem", fontWeight: 700, color: "#F59E0B", lineHeight: 1 }}>73%</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.3rem" }}>Hiring Probability · ±5%</div>
            </div>
            <div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "0.3rem" }}>Semantic Match Score</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>0.74</div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "1rem", marginBottom: "0.3rem" }}>Resume Completeness</div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}><div style={{ width: "82%", height: "100%", background: "var(--accent)", borderRadius: 3 }} /></div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>82/100</div>
            </div>
            <div>
              {[["Strong Python background", "+12%", "pos"], ["ML experience aligns", "+9%", "pos"], ["Kubernetes not found", "−8%", "neg"]].map(([l, v, t]) => (
                <div key={l} className={`factor-row ${t}`} style={{ marginBottom: "0.5rem" }}>
                  <div className={`factor-dot ${t}`}>{t === "pos" ? "▲" : "▼"}</div>
                  <div className="factor-text" style={{ fontSize: "0.82rem" }}>{l}</div>
                  <div className="factor-val">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "skills" && (
        <div className="tab-content glass-card" style={{ padding: "2rem", maxWidth: 820, margin: "0 auto" }}>
          <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>10 skills required · 5 found · 5 missing</p>
          <div className="skills-split">
            <div>
              <div className="skills-col-header found-header">✓ Skills Found</div>
              <div className="skills-found" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>{["Python", "Docker", "ML", "React", "AWS"].map(s => <span key={s} className="skill-pill found">✓ {s}</span>)}</div>
            </div>
            <div>
              <div className="skills-col-header missing-header">✗ Skills Missing</div>
              <div className="priority-group"><div className="priority-label" style={{ color: "var(--red)" }}>🔴 Critical</div><div style={{ display: "flex", gap: "0.5rem" }}>{["Kubernetes", "FastAPI"].map(s => <span key={s} className="skill-pill missing">✗ {s}</span>)}</div></div>
              <div className="priority-group"><div className="priority-label" style={{ color: "var(--amber)" }}>🟡 Important</div><div style={{ display: "flex", gap: "0.5rem" }}>{["Redis", "PostgreSQL"].map(s => <span key={s} className="skill-pill missing">✗ {s}</span>)}</div></div>
              <div className="priority-group"><div className="priority-label" style={{ color: "var(--green)" }}>🟢 Nice to Have</div><span className="skill-pill missing">✗ Terraform</span></div>
            </div>
          </div>
        </div>
      )}

      {tab === "bullets" && (
        <div className="tab-content glass-card" style={{ padding: "2rem", maxWidth: 820, margin: "0 auto" }}>
          {[
            ["Worked on ML models for prediction tasks", "Architected and deployed ensemble ML models (XGBoost + Random Forest) for real-time prediction pipelines, improving model accuracy by 18% across 3 production environments"],
            ["Helped with backend API development", "Engineered and maintained 12+ RESTful API endpoints serving 50K daily requests, reducing average response latency from 340ms to 85ms through Redis caching"],
          ].map(([orig, rew], i) => (
            <div key={i} style={{ marginBottom: "1.25rem" }}>
              <div className="bullet-pair">
                <div className="bullet-before"><div className="bullet-label before-label">Original</div>{orig}</div>
                <div className="bullet-after"><div className="bullet-label after-label">AI Rewritten ✦</div>{rew}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "titles" && (
        <div className="tab-content" style={{ maxWidth: 700, margin: "0 auto" }}>
          {[["AI/ML Intern", 91], ["Python Developer", 83], ["ML Engineer", 81], ["Backend Engineer", 78], ["Data Scientist", 74]].map(([title, pct], i) => (
            <div key={i} className="alt-title-card" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="alt-rank">0{i + 1}</div>
              <div className="alt-info">
                <div className="alt-title-name">{title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div className="match-bar-wrap" style={{ width: 160 }}><div className="match-bar-fill" style={{ width: `${pct}%` }} /></div>
                  <span style={{ fontWeight: 600, color: "var(--accent)", fontSize: "0.88rem" }}>{pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────
export default function LandingPage({ onGetStarted }) {
  const [modal, setModal] = useState(false);

  return (
    <div>
      {modal && <SampleReportModal onClose={() => setModal(false)} />}

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-grad-orb" />
        <div className="hero-grid-lines" />
        <div className="hero-particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="particle" style={{ left: `${8 + i * 11}%`, top: `${15 + (i % 4) * 20}%`, "--dur": `${5 + i * 0.8}s`, "--dx": `${(i % 2 ? 1 : -1) * (8 + i * 2)}px`, "--dy": `${-12 - i * 3}px`, animationDelay: `${i * 0.6}s` }} />
          ))}
        </div>

        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow" style={{ marginBottom: "1.5rem" }}>
              <span className="badge badge-indigo" style={{ fontSize: "0.82rem", padding: "0.4rem 1rem" }}>✦ AI-Powered Resume Intelligence</span>
            </div>
            <h1 className="hero-title" style={{ lineHeight: 1.08 }}>
              Know Your Exact&nbsp;
              <span className="gradient-text">Chances</span>
              <br />Before You Apply.
            </h1>
            <p className="hero-sub">
              SkillGap AI compares your resume against any job description using <strong style={{ color: "var(--text)" }}>semantic AI</strong> — not keyword matching. Get your hiring probability, missing skills, AI-rewritten bullets, and smarter alternate job titles. <strong style={{ color: "var(--text)" }}>In under 30 seconds.</strong>
            </p>
            <div className="hero-ctas">
              <button className="btn-primary btn-lg btn-icon" onClick={onGetStarted} style={{ gap: "0.5rem" }}>
                <span>Analyse My Resume</span> <span>→</span>
              </button>
              <button className="btn-ghost btn-lg" onClick={() => setModal(true)}>📄 See a Sample Report</button>
            </div>
            <p className="hero-proof">🔒 No account needed · Free analysis · No resume stored after session</p>
            <div className="hero-stats">
              <StatCounter value={12400} label="Resumes Analysed" suffix="+" />
              <StatCounter value={94} label="User Satisfaction" suffix="%" />
              <StatCounter value={8} label="Sec Avg Analysis Time" />
            </div>
          </div>
          <HeroWidget />
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <div style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "1.25rem 2rem", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", whiteSpace: "nowrap" }}>Trusted by students from</span>
          {["IIT Bombay", "IIT Delhi", "NIT Trichy", "BITS Pilani", "VIT Vellore", "IIIT Hyderabad"].map(name => (
            <span key={name} style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", fontWeight: 600, whiteSpace: "nowrap" }}>{name}</span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how-it-works">
        <div className="eyebrow section-title" style={{ marginBottom: "0.5rem" }}>Process</div>
        <h2 className="section-title">How SkillGap AI Works</h2>
        <p className="section-sub">Three steps. Real intelligence. No guesswork.</p>
        <div className="steps-row">
          {[
            { num: "01", icon: "📄", title: "Upload Your Resume", desc: "Upload your PDF resume or paste plain text. Our parser extracts your skills, experience, and education automatically." },
            { num: "02", icon: "🔗", title: "Paste the Job Description", desc: "Drop in any job description — or paste a LinkedIn / Indeed URL and we'll scrape it automatically." },
            { num: "03", icon: "📊", title: "Get Your Intelligence Report", desc: "Receive your hiring probability, skill gap analysis, AI-rewritten bullets, and alternate job title suggestions in under 30 seconds." },
          ].map((s, i) => (
            <div key={s.num} className="step-card glass-card" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* SVG pipeline */}
        <svg viewBox="0 0 800 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", margin: "0 auto", maxWidth: 720, opacity: 0.7 }}>
          <text x="10" y="35" fill="rgba(255,255,255,0.45)" fontSize="12" fontFamily="Inter,sans-serif">Resume</text>
          <path d="M85 30 L220 30" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" strokeDasharray="5 3"><animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.2s" repeatCount="indefinite" /></path>
          <rect x="220" y="14" width="130" height="32" rx="8" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.35)" strokeWidth="1" />
          <text x="285" y="34" fill="#818CF8" fontSize="12" textAnchor="middle" fontFamily="Inter,sans-serif">AI Engine</text>
          <path d="M350 30 L480 30" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" strokeDasharray="5 3"><animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.2s" repeatCount="indefinite" /></path>
          <text x="488" y="20" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="Inter,sans-serif">📊 Match Score</text>
          <text x="488" y="35" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="Inter,sans-serif">🔍 Skills + Rewrites</text>
          <text x="488" y="50" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="Inter,sans-serif">🗂️ Job Titles</text>
        </svg>
      </section>

      {/* ── DEMO VIDEO ── */}
      <section className="section-full" style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "6rem 2rem" }}>
        <div className="eyebrow section-title" style={{ marginBottom: "0.5rem" }}>Product Demo</div>
        <h2 className="section-title">See It In Action</h2>
        <p className="section-sub">Watch how SkillGap AI analyses a real resume against a job description in under 30 seconds.</p>
        <DemoVideo onGetStarted={onGetStarted} />
      </section>

      {/* ── FEATURES BENTO ── */}
      <section className="section" id="features">
        <div className="eyebrow section-title" style={{ marginBottom: "0.5rem" }}>Capabilities</div>
        <h2 className="section-title">Everything You Need to Get Hired</h2>
        <p className="section-sub">Four live features. Two powerful ones coming soon.</p>
        <div className="bento">
          {[
            { size: "bento-large", icon: "🎯", title: "Semantic Resume Matching", desc: "Goes beyond keywords. Our sentence-transformer model understands that \"built predictive models\" matches \"XGBoost and Random Forest experience.\" Get a precise 0–100% hiring probability with calibrated confidence bands.", tag: "Available Now", tagClass: "badge-indigo", coming: false },
            { size: "bento-large", icon: "🔍", title: "Ranked Missing Skills Report", desc: "See exactly which skills are absent — tagged as Critical, Important, or Nice-to-Have based on frequency and position in the JD. Know what to learn before you apply.", tag: "Available Now", tagClass: "badge-indigo", coming: false },
            { size: "bento-medium", icon: "✍️", title: "AI Bullet Rewriter", desc: "Every resume bullet rewritten to align with JD keywords and action verbs. Factual content preserved — just made more compelling.", tag: "Available Now", tagClass: "badge-indigo", coming: false },
            { size: "bento-medium", icon: "🗂️", title: "Alternate Role Suggestions", desc: "Discover the 5 roles you're best qualified for right now — with match percentages and the one skill that would make you more competitive.", tag: "Available Now", tagClass: "badge-indigo", coming: false },
            { size: "bento-medium", icon: "📝", title: "AI Resume Writer", desc: "Write a fully ATS-optimized resume from scratch — or let AI enhance your existing one. Tailored to specific roles.", tag: "Coming Soon", tagClass: "badge-amber", coming: true },
            { size: "bento-medium", icon: "📊", title: "ATS Score & Improvement Tips", desc: "Get an ATS compatibility score with specific, actionable suggestions to improve formatting, keywords, and structure.", tag: "Coming Soon", tagClass: "badge-amber", coming: true },
          ].map((f) => (
            <div key={f.title} className={`${f.size} feature-card${f.coming ? " coming-soon" : ""}`}>
              <div className="feature-badge"><span className={`badge ${f.tagClass}`}>✦ {f.tag}</span></div>
              <div className="feature-icon" style={{ marginTop: "1rem" }}>{f.icon}</div>
              <h4 className="feature-title">{f.title}</h4>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE ANALYSIS DEMO TABS ── */}
      <section className="section">
        <div className="eyebrow section-title" style={{ marginBottom: "0.5rem" }}>Real Output</div>
        <h2 className="section-title">See a Real Analysis</h2>
        <p className="section-sub">Here's what your report looks like — powered by real AI output.</p>
        <DemoSection />
      </section>

      {/* ── TESTIMONIALS CAROUSEL ── */}
      <section className="section" style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid var(--border)", paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="eyebrow section-title" style={{ marginBottom: "0.5rem" }}>User Stories</div>
        <h2 className="section-title">What Our Users Say</h2>
        <p className="section-sub">Real results from students and professionals across India. Auto-rotating every 3.5 seconds.</p>
        <TestimonialsCarousel />
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="section">
        <div className="eyebrow section-title" style={{ marginBottom: "0.5rem" }}>Comparison</div>
        <h2 className="section-title">SkillGap AI vs Everything Else</h2>
        <p className="section-sub">See why keyword matching is not enough.</p>
        <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid var(--border)" }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{ background: "rgba(255,255,255,0.04)", padding: "1rem 1.25rem" }}>Feature</th>
                <th className="col-skillgap-head" style={{ padding: "1rem 1.25rem" }}>⚡ SkillGap AI</th>
                <th style={{ background: "rgba(255,255,255,0.02)", padding: "1rem 1.25rem" }}>Generic ATS Tools</th>
                <th style={{ background: "rgba(255,255,255,0.02)", padding: "1rem 1.25rem" }}>ChatGPT</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Semantic understanding", "✅ Sentence-transformer embeddings", "❌ Keyword match only", "⚠️ Generic, not structured"],
                ["Hiring probability score", "✅ Calibrated % with confidence", "❌ Not available", "❌ Not available"],
                ["Ranked skill gap report", "✅ Critical / Important / Nice-to-Have", "⚠️ Basic keyword list", "⚠️ Ad hoc"],
                ["AI bullet rewriter", "✅ JD-aligned, fact-preserving", "❌ Not available", "⚠️ No JD context"],
                ["Alternate job title suggestions", "✅ Vector similarity ranked", "❌ Not available", "❌ Not available"],
                ["Resume completeness score", "✅ Independent 0–100 score", "⚠️ Basic checklist", "❌ Not available"],
                ["Speed", "✅ Under 30 seconds", "✅ Fast", "⚠️ Manual prompting"],
              ].map(([feat, sg, ats, gpt], i) => (
                <tr key={feat}>
                  <td style={{ fontWeight: 500, whiteSpace: "nowrap", padding: "0.85rem 1.25rem" }}>{feat}</td>
                  <td className="col-skillgap" style={{ padding: "0.85rem 1.25rem" }}>{sg}</td>
                  <td style={{ color: "var(--muted)", padding: "0.85rem 1.25rem" }}>{ats}</td>
                  <td style={{ color: "var(--muted)", padding: "0.85rem 1.25rem" }}>{gpt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section" style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid var(--border)", paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="eyebrow section-title" style={{ marginBottom: "0.5rem" }}>FAQ</div>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-sub" style={{ marginBottom: "2.5rem" }}>Everything you need to know.</p>
        <Accordion items={FAQS} />
      </section>

      {/* ── FINAL CTA BAND ── */}
      <section className="cta-band" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 50%,rgba(99,102,241,0.3),transparent 60%),radial-gradient(circle at 80% 50%,rgba(167,139,250,0.2),transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <div className="badge badge-indigo" style={{ display: "inline-flex", marginBottom: "1.5rem" }}>✦ Free to start</div>
          <h2 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", marginBottom: "1rem" }}>Ready to Stop Guessing?</h2>
          <p style={{ fontSize: "1.05rem" }}>Get your semantic match score, skill gap report, and AI-rewritten bullets in under 30 seconds.</p>
          <button className="btn-primary btn-lg" onClick={onGetStarted} style={{ marginBottom: "1rem" }}>Analyse My Resume — It's Free →</button>
          <p className="cta-microcopy">No credit card · No account required · Instant results</p>
        </div>
      </section>
    </div>
  );
}
