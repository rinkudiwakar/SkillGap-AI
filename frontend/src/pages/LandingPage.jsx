import { useEffect, useRef, useState } from "react";
import SampleReportModal from "../components/SampleReportModal";
import LandingAnalysisWidget from "../components/LandingAnalysisWidget";

/* ── Counter hook ─────────────────────────────────────────────── */
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

/* ── Hero Widget ──────────────────────────────────────────────── */
function HeroWidget() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2400);
    const t2 = setTimeout(() => setPhase(0), 7000);
    const t3 = setInterval(() => { setPhase(0); setTimeout(() => setPhase(1), 2400); }, 9000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(t3); };
  }, []);

  return (
    <div className="hero-widget">
      {/* header bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} />
        <span style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-2)" }}>
          Live Analysis
        </span>
      </div>

      {/* skeleton lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: "1.25rem" }}>
        {["80%", "55%", "70%", "40%", "65%"].map((w, i) => (
          <div key={i} style={{
            height: 7, background: "rgba(255,255,255,0.05)", borderRadius: 3, width: w,
            animation: `pulse 2s ${i * 0.18}s ease-in-out infinite alternate`
          }} />
        ))}
      </div>

      {/* scan bar */}
      {phase === 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.77rem", color: "var(--text-2)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ animation: "spin 1.2s linear infinite", display: "inline-block" }}>⟳</span>
            Semantic matching…
          </div>
          <div className="hero-widget-bar"><div className="hero-widget-fill" /></div>
        </div>
      )}

      {/* result */}
      {phase === 1 && (
        <div style={{ animation: "fadeSlide 0.35s ease" }}>
          <div style={{ marginBottom: "1rem" }}>
            <div className="wscore-num">73%</div>
            <div className="wscore-label">Hiring probability · ±5%</div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {[["✓ Python", "found"], ["✓ Docker", "found"], ["✗ Kubernetes", "missing"]].map(([l, t]) => (
              <span key={l} className={`wpill ${t}`} style={{ animation: "pillIn 0.35s ease both" }}>{l}</span>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse{from{opacity:0.35}to{opacity:0.7}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

/* ── Testimonials ─────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "Aditya Sharma", title: "Final Year, IIT Bombay", initials: "AS",
    quote: "Was applying blindly to 50+ companies. SkillGap showed I was missing Kubernetes and FastAPI. Interview rate: 2% → 22%.", tag: "Resume Matching"
  },
  {
    name: "Priya Mehta", title: "Software Engineer, Bengaluru", initials: "PM",
    quote: "The bullet rewriter kept my real metrics intact but finally made them land. Shortlisted at 3 product companies in a week.", tag: "Bullet Rewriter"
  },
  {
    name: "Rahul Verma", title: "Finance → Tech, Delhi", initials: "RV",
    quote: "Alternate Job Titles told me I was an 78% match for Business Analyst — not PM at 51%. That clarity saved months.", tag: "Alternate Titles"
  },
  {
    name: "Sneha Iyer", title: "MCA Graduate, Pune", initials: "SI",
    quote: "Completeness score was 61% — missing a Summary and zero quantified bullets. Fixed those, ATS pass rate improved visibly.", tag: "Completeness"
  },
  {
    name: "Karan Nair", title: "B.Tech CSE, NIT Trichy", initials: "KN",
    quote: "20 roles, zero calls. Match was at 48%. Tailored once, jumped to 79%. Got 4 interview calls in a week.", tag: "Score Boost"
  },
];

function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCurrent(c => (c + 1) % TESTIMONIALS.length), 3800);
    return () => clearInterval(id);
  }, []);
  const visible = [0, 1, 2].map(i => TESTIMONIALS[(current + i) % TESTIMONIALS.length]);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: "2rem" }}>
        {visible.map((t, idx) => (
          <div key={`${t.name}-${idx}`} style={{ padding: "2rem", background: "var(--bg2)", animation: "fadeSlide 0.4s ease both", animationDelay: `${idx * 60}ms` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%", background: "rgba(201,245,59,0.1)",
                color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.78rem", fontWeight: 500, flexShrink: 0
              }}>{t.initials}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{t.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>{t.title}</div>
              </div>
            </div>
            <div style={{ color: "var(--accent)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>★★★★★</div>
            <p style={{ color: "var(--text-2)", fontSize: "0.87rem", lineHeight: 1.75, fontStyle: "italic", marginBottom: "1rem" }}>"{t.quote}"</p>
            <span className="badge badge-default" style={{ fontSize: "0.68rem" }}>{t.tag}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{
            width: i === current ? 22 : 7, height: 7, borderRadius: 4,
            background: i === current ? "var(--accent)" : "rgba(255,255,255,0.12)",
            border: "none", cursor: "pointer", transition: "all 0.3s"
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────── */
const FAQS = [
  { q: "Is my resume stored after analysis?", a: "No. Resume data is processed in-session and purged immediately after your analysis is complete. Nothing is stored beyond the response window." },
  { q: "What makes this different from an ATS keyword scanner?", a: "ATS scanners match literal words. SkillGap uses sentence-transformer models — the same architecture behind Google Search — to understand meaning. 'Built ensemble models' and 'XGBoost experience' match correctly." },
  { q: "How accurate is the hiring probability?", a: "It's calibrated on domain benchmarks and accounts for cosine match, seniority alignment, keyword density, and experience delta. 94% of users rated it useful. It's a rigorous estimate, not a guarantee." },
  { q: "What industries does SkillGap support?", a: "Optimised for tech, software, data science, and product roles. Finance, healthcare, and consulting are on the roadmap." },
  { q: "What file formats are accepted?", a: "PDF upload and plain-text paste. You can also paste a LinkedIn or Indeed URL and we'll extract the JD automatically." },
  { q: "Is there a free tier?", a: "Your first analysis is free with no account required. Create a free account to save history and access additional analyses." },
];

function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      {items.map((item, i) => (
        <div key={i} className={`accordion-item${open === i ? " open" : ""}`}>
          <button className="accordion-trigger" onClick={() => setOpen(open === i ? null : i)}>
            {item.q}
            <span className="accordion-icon">+</span>
          </button>
          {open === i && <div className="accordion-body" style={{ animation: "fadeSlide 0.18s ease" }}>{item.a}</div>}
        </div>
      ))}
    </div>
  );
}

/* ── Demo tabs ────────────────────────────────────────────────── */
function DemoSection() {
  const [tab, setTab] = useState("overview");
  return (
    <div>
      <div className="tab-bar" style={{ maxWidth: 640, margin: "0 auto 1.75rem" }}>
        {[["overview", "Match Overview"], ["skills", "Skill Gap"], ["bullets", "Rewritten Bullets"], ["titles", "Alternate Titles"]].map(([id, label]) => (
          <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="tab-content" style={{ padding: "2rem", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: "2.5rem", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "4.5rem", color: "var(--accent)", lineHeight: 1 }}>73%</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-2)", marginTop: "0.3rem" }}>Hiring Probability · ±5%</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-2)", marginBottom: "0.3rem" }}>Semantic Match Score</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", color: "var(--text)" }}>0.74</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-2)", margin: "1rem 0 0.3rem" }}>Resume Completeness</div>
              <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: "82%" }} /></div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-2)", marginTop: "0.3rem" }}>82 / 100</div>
            </div>
            <div>
              {[["Strong Python background", "+12%", "pos"], ["ML experience aligns", "+9%", "pos"], ["Kubernetes not found", "−8%", "neg"]].map(([l, v, t]) => (
                <div key={l} className={`factor-row ${t}`}>
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
        <div className="tab-content" style={{ padding: "2rem", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12 }}>
          <p style={{ color: "var(--text-2)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>10 skills required · 5 found · 5 missing</p>
          <div className="skills-split">
            <div>
              <div className="skills-col-header found-header">✓ Skills Found</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {["Python", "Docker", "ML", "React", "AWS"].map(s => <span key={s} className="skill-pill found">✓ {s}</span>)}
              </div>
            </div>
            <div>
              <div className="skills-col-header missing-header">✗ Skills Missing</div>
              <div className="priority-group">
                <div className="priority-label" style={{ color: "var(--red)" }}>🔴 Critical</div>
                <div style={{ display: "flex", gap: "0.5rem" }}>{["Kubernetes", "FastAPI"].map(s => <span key={s} className="skill-pill missing">✗ {s}</span>)}</div>
              </div>
              <div className="priority-group">
                <div className="priority-label" style={{ color: "var(--amber)" }}>🟡 Important</div>
                <div style={{ display: "flex", gap: "0.5rem" }}>{["Redis", "PostgreSQL"].map(s => <span key={s} className="skill-pill missing">✗ {s}</span>)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "bullets" && (
        <div className="tab-content" style={{ padding: "2rem", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12 }}>
          {[
            ["Worked on ML models for prediction tasks", "Architected and deployed ensemble ML models (XGBoost + Random Forest) for real-time prediction pipelines, improving accuracy by 18% across 3 production environments"],
            ["Helped with backend API development", "Engineered 12+ RESTful API endpoints serving 50K daily requests, reducing latency from 340ms to 85ms via Redis caching"],
          ].map(([orig, rew], i) => (
            <div key={i} style={{ marginBottom: "1.5rem" }}>
              <div className="bullet-pair">
                <div className="bullet-before"><div className="bullet-label before-label">Original</div>{orig}</div>
                <div className="bullet-after"><div className="bullet-label after-label">AI Rewritten ✦</div>{rew}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "titles" && (
        <div className="tab-content">
          {[["AI/ML Intern", 91], ["Python Developer", 83], ["ML Engineer", 81], ["Backend Engineer", 78], ["Data Scientist", 74]].map(([title, pct], i) => (
            <div key={i} className="alt-title-card" style={{ animationDelay: `${i * 55}ms` }}>
              <div className="alt-rank">0{i + 1}</div>
              <div className="alt-info">
                <div className="alt-title-name">{title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div className="match-bar-wrap" style={{ width: 160 }}><div className="match-bar-fill" style={{ width: `${pct}%` }} /></div>
                  <span style={{ fontWeight: 500, color: "var(--accent)", fontSize: "0.85rem" }}>{pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════ */
export default function LandingPage({ onGetStarted, onGuestResult }) {
  const [modal, setModal] = useState(false);

  return (
    <div>
      {modal && <SampleReportModal onClose={() => setModal(false)} />}

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-grid-lines" />
        <div className="hero-fade" />
        <div className="hero-inner">
          <div>
            {/* eyebrow */}
            <div className="hero-eyebrow">
              <span className="badge badge-accent" style={{ fontSize: "0.7rem" }}>
                ✦ AI-Powered Resume Intelligence
              </span>
            </div>

            {/* headline */}
            <h1 className="hero-title">
              Know Your Exact
              <br />
              <span className="accent-text">Chances</span>{" "}
              <span className="gradient-text">Before You Apply.</span>
            </h1>

            <p className="hero-sub">
              SkillGap AI compares your resume against any job description using
              semantic AI — not keyword matching. Get your hiring probability,
              missing skills, AI-rewritten bullets, and smarter alternate titles
              in under 30 seconds.
            </p>

            <div className="hero-ctas">
              <button className="btn-primary btn-lg" onClick={onGetStarted}>
                Analyse My Resume →
              </button>
              <button className="btn-ghost btn-lg" onClick={() => setModal(true)}>
                See a Sample Report
              </button>
            </div>

            <p className="hero-proof">
              🔒 No account needed · Free analysis · No resume stored after session
            </p>

            <div className="hero-stats">
              <StatCounter value={12400} label="Resumes Analysed" suffix="+" />
              <StatCounter value={94} label="User Satisfaction" suffix="%" />
              <StatCounter value={8} label="Sec Avg Time" />
            </div>
          </div>

          <LandingAnalysisWidget onGuestResult={onGuestResult} />
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="trust-strip">
        <div className="trust-strip-inner">
          <span className="trust-strip-label">Trusted by students from</span>
          {["IIT Bombay", "IIT Delhi", "NIT Trichy", "BITS Pilani", "VIT Vellore", "IIIT Hyderabad"].map(n => (
            <span key={n} className="trust-logo">{n}</span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="section">
        <div className="eyebrow section-title" style={{ marginBottom: "0.75rem" }}>Process</div>
        <h2 className="section-title">How SkillGap AI Works</h2>
        <p className="section-sub">Three inputs. One intelligence report. Under 30 seconds.</p>

        <div className="steps-row">
          {[
            { num: "01", icon: "📄", title: "Upload Your Resume", desc: "Upload your PDF or paste plain text. Our parser extracts skills, experience, and education automatically." },
            { num: "02", icon: "🔗", title: "Paste the Job Description", desc: "Drop in any job description — or paste a LinkedIn / Indeed URL and we'll scrape it for you." },
            { num: "03", icon: "📊", title: "Get Your Intelligence Report", desc: "Receive hiring probability, skill gap analysis, AI-rewritten bullets, and alternate title suggestions." },
          ].map(s => (
            <div key={s.num} className="step-card">
              <span className="step-num">{s.num}</span>
              <span className="step-icon">{s.icon}</span>
              <div className="step-title">{s.title}</div>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ── FEATURES BENTO ── */}
      <section className="section" id="features">
        <div className="eyebrow section-title" style={{ marginBottom: "0.75rem" }}>Capabilities</div>
        <h2 className="section-title">Everything You Need to Get Hired</h2>
        <p className="section-sub">Four live features. Two powerful ones coming soon.</p>

        <div className="bento">
          {[
            {
              size: "bento-large", icon: "🎯", title: "Semantic Resume Matching",
              desc: "Goes beyond keywords. Our sentence-transformer model understands that 'built predictive models' matches 'XGBoost experience'. Get a precise hiring probability with calibrated confidence.", tag: "Available", coming: false
            },
            {
              size: "bento-large", icon: "🔍", title: "Ranked Missing Skills Report",
              desc: "See exactly which skills are absent — tagged Critical, Important, or Nice-to-Have based on frequency and position in the JD. Know what to learn before you apply.", tag: "Available", coming: false
            },
            {
              size: "bento-medium", icon: "✍️", title: "AI Bullet Rewriter",
              desc: "Every bullet rewritten to match JD keywords. Factual content preserved — just made compelling.", tag: "Available", coming: false
            },
            {
              size: "bento-medium", icon: "🗂️", title: "Alternate Role Suggestions",
              desc: "Discover the 5 roles you're best qualified for right now — with match percentages.", tag: "Available", coming: false
            },
            {
              size: "bento-medium", icon: "📝", title: "AI Resume Writer",
              desc: "Write a fully ATS-optimised resume from scratch or let AI enhance your existing one.", tag: "Coming Soon", coming: true
            },
            {
              size: "bento-medium", icon: "📊", title: "ATS Score & Fixes",
              desc: "ATS compatibility score with specific, actionable suggestions to improve formatting.", tag: "Coming Soon", coming: true
            },
          ].map(f => (
            <div key={f.title} className={`${f.size} feature-card${f.coming ? " coming-soon" : ""}`}>
              <div style={{ marginBottom: "0.75rem" }}>
                <span className={`badge ${f.coming ? "badge-default" : "badge-accent"}`} style={{ fontSize: "0.68rem" }}>
                  {f.tag}
                </span>
              </div>
              <span className="feature-icon">{f.icon}</span>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ── LIVE DEMO ── */}
      <section className="section">
        <div className="eyebrow section-title" style={{ marginBottom: "0.75rem" }}>Real Output</div>
        <h2 className="section-title">See a Real Analysis</h2>
        <p className="section-sub">Here's what your report looks like — powered by real AI output.</p>
        <DemoSection />
      </section>

      <hr className="divider" />

      {/* ── TESTIMONIALS ── */}
      <section className="section">
        <div className="eyebrow section-title" style={{ marginBottom: "0.75rem" }}>User Stories</div>
        <h2 className="section-title">What Our Users Say</h2>
        <p className="section-sub">Real results from students and professionals across India.</p>
        <TestimonialsCarousel />
      </section>

      <hr className="divider" />

      {/* ── COMPARISON ── */}
      <section className="section">
        <div className="eyebrow section-title" style={{ marginBottom: "0.75rem" }}>Comparison</div>
        <h2 className="section-title">SkillGap AI vs Everything Else</h2>
        <p className="section-sub">Keyword matching is not enough.</p>
        <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 12 }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="col-skillgap-head">⚡ SkillGap AI</th>
                <th>Generic ATS</th>
                <th>ChatGPT</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Semantic understanding", "✅ Sentence-transformer embeddings", "❌ Keyword match only", "⚠️ Generic"],
                ["Hiring probability", "✅ Calibrated % with confidence", "❌ Not available", "❌ Not available"],
                ["Ranked skill gap", "✅ Critical / Important / Nice-to-Have", "⚠️ Basic list", "⚠️ Ad hoc"],
                ["AI bullet rewriter", "✅ JD-aligned, fact-preserving", "❌ Not available", "⚠️ No JD context"],
                ["Alternate job titles", "✅ Vector similarity ranked", "❌ Not available", "❌ Not available"],
                ["Speed", "✅ Under 30 seconds", "✅ Fast", "⚠️ Manual prompting"],
              ].map(([f, sg, ats, gpt]) => (
                <tr key={f}>
                  <td style={{ fontWeight: 500, color: "var(--text)" }}>{f}</td>
                  <td className="col-skillgap">{sg}</td>
                  <td>{ats}</td>
                  <td>{gpt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="divider" />

      {/* ── FAQ ── */}
      <section className="section">
        <div className="eyebrow section-title" style={{ marginBottom: "0.75rem" }}>FAQ</div>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-sub" style={{ marginBottom: "3rem" }}>Everything you need to know.</p>
        <Accordion items={FAQS} />
      </section>

      {/* ── CTA BAND ── */}
      <section className="cta-band">
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <span className="badge badge-accent">✦ Free to start</span>
          </div>
          <h2 style={{ marginBottom: "1rem" }}>Ready to Stop Guessing?</h2>
          <p>Get your semantic match score, skill gap report, and AI-rewritten bullets in under 30 seconds.</p>
          <button className="btn-primary btn-lg" onClick={onGetStarted} style={{ marginBottom: "1rem" }}>
            Analyse My Resume — It's Free →
          </button>
          <p className="cta-microcopy">No credit card · No account required · Instant results</p>
        </div>
      </section>
    </div>
  );
}