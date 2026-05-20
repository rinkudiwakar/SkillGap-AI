import { useEffect, useRef, useState } from "react";

/* ══════════════════════════════════════════
   STITCH LANDING PAGE — SkillGap AI v3
   Source: Stitch Project 12721994372912798182
   Screen: "Skillgap AI - Refined Brand Landing Page"
   Props preserved: onGetStarted, onGuestResult
══════════════════════════════════════════ */

/* ── Scroll reveal hook ── */
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ── Animated counter ── */
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
    <div ref={ref}>
      <div className="stitch-stat-num">{count.toLocaleString()}{suffix}</div>
      <div className="stitch-stat-label">{label}</div>
    </div>
  );
}

/* ── Hero Widget (live analysis preview) ── */
function HeroWidget() {
  const [phase, setPhase] = useState(0); // 0 = scanning, 1 = result
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2400);
    const t2 = setTimeout(() => setPhase(0), 7000);
    const t3 = setInterval(() => { setPhase(0); setTimeout(() => setPhase(1), 2400); }, 9000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(t3); };
  }, []);

  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (73 / 100) * circumference;

  return (
    <div className="stitch-hero-widget">
      {/* topbar */}
      <div className="stitch-widget-topbar">
        <span className="stitch-widget-label">LIVE_ANALYSIS_PREVIEW</span>
        <span className="stitch-widget-badge">
          {phase === 0 ? "In Progress..." : "Complete ✓"}
        </span>
      </div>

      {/* gauge + insight row */}
      <div className="stitch-gauge-row">
        <div className="stitch-gauge-wrap">
          <svg className="stitch-gauge-svg" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r="56" fill="transparent" stroke="var(--bg3)" strokeWidth="8" />
            <circle
              cx="64" cy="64" r="56" fill="transparent"
              stroke={phase === 0 ? "var(--border)" : "var(--accent-2)"}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={phase === 0 ? circumference * 0.7 : offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1.2s ease, stroke 0.6s ease" }}
            />
          </svg>
          <div className="stitch-gauge-center">
            <span className="stitch-gauge-num" style={{ color: phase === 0 ? "var(--text-3)" : "var(--accent-2)" }}>
              {phase === 0 ? "—" : "73%"}
            </span>
            <span className="stitch-gauge-sub">MATCH</span>
          </div>
        </div>

        <div className="stitch-widget-insight">
          <div className="stitch-widget-bar-wrap">
            <div
              className="stitch-widget-bar-fill"
              style={{
                width: phase === 0 ? "35%" : "73%",
                transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)"
              }}
            />
          </div>
          <p className="stitch-widget-desc">
            {phase === 0
              ? "Semantic matching in progress…"
              : <>Current profile is missing key <span style={{ color: "var(--accent-2)" }}>infrastructure-as-code</span> keywords required for this Senior DevOps role.</>
            }
          </p>
        </div>
      </div>

      {/* skill pills */}
      {phase === 1 && (
        <div className="stitch-widget-pills" style={{ animation: "fadeSlideUp 0.35s ease" }}>
          <span className="stitch-wpill-found"><i className="ti ti-check" style={{ fontSize: "0.7rem" }} /> Python</span>
          <span className="stitch-wpill-found"><i className="ti ti-check" style={{ fontSize: "0.7rem" }} /> Docker</span>
          <span className="stitch-wpill-missing"><i className="ti ti-x" style={{ fontSize: "0.7rem" }} /> Kubernetes</span>
          <span className="stitch-wpill-missing"><i className="ti ti-x" style={{ fontSize: "0.7rem" }} /> Terraform</span>
        </div>
      )}
    </div>
  );
}

/* ── FAQ Item ── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="stitch-faq-item">
      <button className={`stitch-faq-trigger${open ? " open" : ""}`} onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <i className="ti ti-plus" />
      </button>
      {open && <div className="stitch-faq-body">{a}</div>}
    </div>
  );
}

/* ── Testimonials Row (marquee) ── */
const TESTIMONIALS_ROW1 = [
  { verdict: "VERDICT: HIRED",   pct: "94%", quote: "\"The tool spotted that I wasn't emphasizing 'Scale' enough for the Netflix role.\"",        author: "— CS Student @ Stanford" },
  { verdict: "VERDICT: HIRED",   pct: "88%", quote: "\"From 0 interviews to 3 in a week after one optimization cycle.\"",                         author: "— SWE @ Meta" },
  { verdict: "VERDICT: OFFER",   pct: "91%", quote: "\"Actually useful feedback instead of generic 'use strong verbs' fluff.\"",                  author: "— Product Lead @ Airbnb" },
  { verdict: "VERDICT: HIRED",   pct: "96%", quote: "\"The semantic analysis is terrifyingly accurate. It found gaps I didn't even see.\"",       author: "— Senior Dev @ Stripe" },
];
const TESTIMONIALS_ROW2 = [
  { verdict: "VERDICT: PASSED",  pct: "82%", quote: "\"Finally understood why I was getting auto-rejected by the ATS.\"",                       author: "— Analyst @ Goldman" },
  { verdict: "VERDICT: HIRED",   pct: "96%", quote: "\"The semantic analysis is terrifyingly accurate. It found gaps I didn't even see.\"",      author: "— Senior Dev @ Stripe" },
  { verdict: "VERDICT: OFFER",   pct: "89%", quote: "\"Highest ROI of any career tool I've used this year.\"",                                  author: "— Manager @ Uber" },
  { verdict: "VERDICT: HIRED",   pct: "94%", quote: "\"The bullet rewriter kept my real metrics intact but finally made them land.\"",            author: "— PM @ Notion" },
];

function TestimonialCard({ verdict, pct, quote, author }) {
  return (
    <div className="stitch-testimonial-card">
      <div className="stitch-testimonial-top">
        <span className="stitch-verdict-pill">{verdict}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-2)" }}>{pct} MATCH</span>
      </div>
      <p className="stitch-testimonial-quote">{quote}</p>
      <div className="stitch-testimonial-author">{author}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
═══════════════════════════════════════════════════════ */
export default function LandingPage({ onGetStarted, onGuestResult }) {
  useReveal();

  const FAQS = [
    { q: "How is this different from generic \"Resume Checkers\"?", a: "Generic checkers just count keywords. We use LLMs to perform semantic gap analysis — meaning we understand if your experience in \"Distributed Systems\" implies knowledge of \"Concurrency\" even if the word isn't there." },
    { q: "Is my data secure?", a: "We operate a Zero Persistence Model. Your resume is parsed in memory and destroyed once the report is generated. We don't sell your data or use it to train our own base models." },
    { q: "Does this work for non-tech roles?", a: "While we specialize in high-stakes tech and finance roles where ATS filters are most aggressive, the logic works for any structured job description and professional resume." },
    { q: "Can the AI write the resume for me?", a: "We provide \"suggested rewrites\" for specific bullets, but we don't generate full resumes. We believe in high-agency applications where you remain the editor-in-chief of your own career story." },
    { q: "How accurate is the \"Verdict\" score?", a: "The score represents how closely your semantic profile aligns with the explicit and implicit requirements of the job post. It's an indicator of your chance to pass the automated screen, not a guarantee of a hire." },
    { q: "What file formats are supported?", a: "We support PDF, DOCX, and TXT files. For best results, we recommend standard single-column PDF layouts which are most readable by both our AI and recruiter ATS systems." },
    { q: "Can I use this for free?", a: "Yes. Every user gets 1 full intelligence report for free. Pro plans offer unlimited analyses, API access, and deep-dive company cultural alignment reports." },
    { q: "Is there a bulk API?", a: "Yes, we offer a JSON API for university career centers and recruitment agencies. Contact our enterprise team for documentation and volume pricing." },
  ];

  return (
    <div style={{ paddingTop: 64, background: "var(--bg)" }}>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section>
        <div className="stitch-hero">
          {/* Left */}
          <div className="stitch-hero-left">
            <span className="stitch-eyebrow-pill animate-fade-up">
              AI-POWERED RESUME INTELLIGENCE
            </span>

            <h1 className="stitch-h1 animate-fade-up delay-100">
              Know Your Exact Chances Before You Apply.
            </h1>

            <p className="stitch-hero-sub animate-fade-up delay-200">
              Skillgap AI reverse-engineers Applicant Tracking Systems to show you exactly where
              your resume fails. Get recruiter-level insights in 30 seconds.
            </p>

            <div className="stitch-cta-row animate-fade-up delay-300">
              <button id="hero-cta-primary" className="stitch-btn-primary" onClick={onGetStarted}>
                Analyse My Resume <i className="ti ti-arrow-right" />
              </button>
              <button id="hero-cta-sample" className="stitch-btn-outline">
                See Sample Report
              </button>
            </div>

            <p className="stitch-hero-proof animate-fade-up delay-300">
              <i className="ti ti-users" style={{ color: "var(--accent)" }} />
              Join 50,000+ job seekers
            </p>

            <div className="stitch-hero-stats animate-fade-up delay-400">
              <StatCounter value={2400000} label="Resumes Processed" suffix="+" />
              <div className="stitch-stat-divider" />
              <StatCounter value={150} label="Job Roles Covered" suffix="+" />
            </div>

            {/* Floating verdict badge */}
            <div className="stitch-verdict-float animate-float-right">
              <div className="stitch-verdict-card">
                <div className="stitch-verdict-icon">
                  <i className="ti ti-check" />
                </div>
                <div>
                  <div className="stitch-verdict-label">VERDICT</div>
                  <div className="stitch-verdict-value">Apply · 87% Match</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — live analysis widget */}
          <div className="stitch-hero-right animate-fade-up delay-300">
            <HeroWidget />
          </div>
        </div>
      </section>

      {/* ══ METRICS BAR ═══════════════════════════════════════ */}
      <div className="stitch-metrics-bar">
        <div className="stitch-metrics-inner">
          <div>
            <div className="stitch-metric-num">50,000+</div>
            <div className="stitch-metric-label">Resumes Analyzed</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)", padding: "0 32px" }}>
            <div className="stitch-metric-num">+19pts</div>
            <div className="stitch-metric-label">Avg. Score Boost</div>
          </div>
          <div>
            <div className="stitch-metric-num">30s</div>
            <div className="stitch-metric-label">Time to Verdict</div>
          </div>
        </div>
      </div>

      {/* ══ SOCIAL PROOF MARQUEE ══════════════════════════════ */}
      <div className="stitch-marquee-section">
        <div className="stitch-marquee-label">Trusted by job seekers at</div>
        <div className="stitch-marquee-row">
          <div className="marquee-track">
            <div className="stitch-marquee-items">
              {["Google", "Meta", "Stripe", "Notion", "Linear", "Figma", "Airbnb", "Uber", "Netflix", "OpenAI"].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            <div className="stitch-marquee-items">
              {["Google", "Meta", "Stripe", "Notion", "Linear", "Figma", "Airbnb", "Uber", "Netflix", "OpenAI"].map((n) => (
                <span key={n + "2"}>{n}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ FEATURES GRID ════════════════════════════════════ */}
      <section className="stitch-features-section" id="features">
        <div className="stitch-section-inner">
          <div className="stitch-section-head reveal-on-scroll">
            <h2>Intelligence, not just keywords.</h2>
            <p>Designed for the modern, high-stakes application process.</p>
          </div>
          <div className="stitch-features-grid">
            {[
              { icon: "ti-brain",       title: "Semantic Accuracy",    desc: "We don't just match words. Our engine understands context, tech stacks, and implied skills.",                              featured: false },
              { icon: "ti-bolt",        title: "30s Speed",            desc: "Upload a PDF and get a comprehensive breakdown faster than a recruiter skims your header.",                               featured: false },
              { icon: "ti-target",      title: "Actionable Verdicts",  desc: "Verdict, not just a score. Get a clear Go/No-Go signal with exactly what to rewrite before you apply.",                  featured: true  },
              { icon: "ti-shield-lock", title: "Privacy First",        desc: "Zero persistence. Your resume is parsed in memory and destroyed instantly after analysis.",                               featured: false },
            ].map((f) => (
              <div key={f.title} className={`stitch-feature-card reveal-on-scroll${f.featured ? " featured" : ""}`}>
                {f.featured && <div className="stitch-feature-badge">KEY FEATURE</div>}
                <div className="stitch-feature-icon">
                  <i className={`ti ${f.icon}`} style={{ fontSize: "1.4rem" }} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════ */}
      <section className="stitch-hiw-section" id="how-it-works">
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="stitch-section-head reveal-on-scroll">
            <h2>From job post to decision in 30 seconds</h2>
            <p>A clinical process for high-stakes applications.</p>
          </div>
          <div className="stitch-steps-grid">
            {[
              { num: "STEP_01", title: "Upload Resume",     desc: "Drop your technical PDF. We extract semantic vectors, not just keywords." },
              { num: "STEP_02", title: "Analysis",          desc: "Our engine cross-references your profile against the job's hidden requirements." },
              { num: "STEP_03", title: "Verdict",           desc: "Get a final go/no-go score with bullet-by-bullet optimization suggestions." },
            ].map((s) => (
              <div key={s.num} className="stitch-step-card reveal-on-scroll">
                <div className="stitch-step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SAMPLE REPORT PREVIEW ════════════════════════════ */}
      <section className="stitch-sample-section reveal-on-scroll">
        <div className="stitch-sample-header">
          <div style={{ maxWidth: 480 }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", marginBottom: 12 }}>
              What your report looks like.
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: "0.95rem" }}>
              Comprehensive, technical, and actionable. No generic fluff — just the data you need to win.
            </p>
          </div>
          <div className="stitch-sample-tags">
            <span className="stitch-tag">PDF EXPORT</span>
            <span className="stitch-tag">JSON API</span>
          </div>
        </div>

        <div className="stitch-sample-grid">
          {/* Column 1 — Score */}
          <div className="stitch-sample-col">
            <div className="stitch-sample-col-header">MATCH_STRENGTH</div>
            <div className="stitch-score-big">88</div>
            <div className="stitch-score-verdict">Strong Fit</div>
            <p className="stitch-score-desc">Top 5% of all applicants for this specific role and seniority.</p>
            <div className="stitch-subscores">
              <div className="stitch-subscore-row">
                <span>Skills Match</span>
                <span style={{ color: "var(--accent)" }}>92%</span>
              </div>
              <div className="stitch-subscore-row">
                <span>Experience Depth</span>
                <span style={{ color: "var(--accent-2)" }}>74%</span>
              </div>
            </div>
          </div>

          {/* Column 2 — Skill Gap */}
          <div className="stitch-sample-col" style={{ background: "var(--bg2)" }}>
            <div className="stitch-sample-col-header">SEMANTIC_GAP_ANALYSIS</div>
            <div className="stitch-found-label"><i className="ti ti-circle-check" /> FOUND COMPETENCIES (12)</div>
            <div>
              {["React/Next.js", "TypeScript", "GraphQL", "Node.js", "PostgreSQL"].map((s) => (
                <span key={s} className="stitch-chip-found">{s}</span>
              ))}
            </div>
            <div className="stitch-missing-label"><i className="ti ti-alert-circle" /> MISSING KEYWORDS (4)</div>
            <div>
              {["Serverless", "E2E Testing", "Terraform"].map((s) => (
                <span key={s} className="stitch-chip-missing">{s}</span>
              ))}
            </div>
          </div>

          {/* Column 3 — Bullet Rewrite Lab */}
          <div className="stitch-sample-col">
            <div className="stitch-sample-col-header">BULLET_REWRITE_LAB</div>
            <div className="stitch-bullet-before">
              <p>"Responsible for building the frontend components using React."</p>
            </div>
            <div className="stitch-bullet-after">
              <p>"Engineered a scalable component library using React/TypeScript, improving design-to-code efficiency by 30%."</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS MARQUEE ════════════════════════════ */}
      <section className="stitch-testimonials-section">
        <div style={{ maxWidth: 1440, margin: "0 auto", textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", marginBottom: 10 }}>
            Outcome reports
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: "0.95rem" }}>Measured success from our early cohort.</p>
        </div>

        {/* Row 1 — left scroll */}
        <div style={{ overflow: "hidden", marginBottom: 16 }}>
          <div className="marquee-track" style={{ gap: 16 }}>
            {[...TESTIMONIALS_ROW1, ...TESTIMONIALS_ROW1].map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </div>

        {/* Row 2 — right scroll */}
        <div style={{ overflow: "hidden" }}>
          <div className="marquee-track-reverse" style={{ gap: 16 }}>
            {[...TESTIMONIALS_ROW2, ...TESTIMONIALS_ROW2].map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══════════════════════════════════════════ */}
      <section className="stitch-pricing-section" id="pricing">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="stitch-section-head reveal-on-scroll">
            <h2>Simple, transparent pricing.</h2>
            <p>Invest in your career trajectory.</p>
          </div>
          <div className="stitch-pricing-grid">
            {/* Free */}
            <div className="stitch-pricing-card reveal-on-scroll">
              <h3>Free Forever</h3>
              <p className="sub">For job seekers testing the waters.</p>
              <div className="stitch-price-num">$0</div>
              <ul className="stitch-pricing-list">
                <li><i className="ti ti-check" /> 3 Scans per month</li>
                <li><i className="ti ti-check" /> Basic gap analysis</li>
                <li><i className="ti ti-check" /> PDF export</li>
              </ul>
              <button id="pricing-free-btn" className="stitch-pricing-btn-free" onClick={onGetStarted}>
                Get Started Free
              </button>
            </div>

            {/* Pro */}
            <div className="stitch-pricing-card popular reveal-on-scroll">
              <div className="stitch-popular-pill">POPULAR</div>
              <h3>Pro</h3>
              <p className="sub">For serious applicants optimizing every application.</p>
              <div className="stitch-price-num">
                ₹299 <span style={{ fontSize: "1rem", color: "var(--text-2)", fontFamily: "var(--font-sans)" }}>/mo</span>
              </div>
              <ul className="stitch-pricing-list">
                <li><i className="ti ti-check" /> Unlimited Scans</li>
                <li><i className="ti ti-check" /> AI Bullet Rewriter</li>
                <li><i className="ti ti-check" /> Career Pathing insights</li>
                <li><i className="ti ti-check" /> Priority support</li>
              </ul>
              <button id="pricing-pro-btn" className="stitch-pricing-btn-pro" onClick={onGetStarted}>
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════ */}
      <section className="stitch-faq-section" id="faq">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
            textAlign: "center",
            marginBottom: 48
          }}>
            Frequently asked questions
          </h2>
          <div className="stitch-faq-list">
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA BAND ═══════════════════════════════════ */}
      <div className="stitch-cta-band">
        <div className="stitch-cta-inner reveal-on-scroll">
          <h2>Stop applying blind. Start applying smarter.</h2>
          <p>Get your first deep-dive gap analysis report for free today.</p>
          <button id="final-cta-btn" className="stitch-cta-btn" onClick={onGetStarted}>
            Analyse My Resume <i className="ti ti-rocket" />
          </button>
        </div>
      </div>

    </div>
  );
}