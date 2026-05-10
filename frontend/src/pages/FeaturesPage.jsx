export default function FeaturesPage({ onGetStarted }) {
  const features = [
    {
      icon: "🎯",
      tag: "Core",
      title: "Semantic Resume Matching",
      desc: "Upload your resume and paste any job description. Our sentence-transformer pipeline computes true semantic similarity — not keyword frequency. It understands that 'built REST APIs' and 'developed backend services' mean the same thing.",
      bullets: [
        "Sentence-transformer embeddings (not TF-IDF)",
        "Cosine similarity across resume sections",
        "Works with any tech role, domain, or seniority level",
        "Handles India-specific JD formats",
      ],
      color: "rgba(99,102,241,0.08)",
      border: "rgba(99,102,241,0.25)",
    },
    {
      icon: "📊",
      tag: "Core",
      title: "Hiring Probability Score",
      desc: "A single number (0–100%) that estimates how likely a recruiter would shortlist your resume for this specific role. Built on a calibrated weighted model using skill match, semantic alignment, project relevance, and experience fit.",
      bullets: [
        "Calibrated on real hiring patterns — not hardcoded thresholds",
        "Granular sub-scores: skill match, semantic similarity, project relevance, experience relevance",
        "Plain-English interpretation of each sub-score",
        "Color-coded for instant comprehension (green / amber / red)",
      ],
      color: "rgba(16,185,129,0.06)",
      border: "rgba(16,185,129,0.2)",
    },
    {
      icon: "🟢",
      tag: "Core",
      title: "Visual Skill Gap Report",
      desc: "No tables. No percentages. Just two columns: green pills for skills you have, red pills for skills you're missing. Your gap is visible in under 3 seconds.",
      bullets: [
        "Green pills — skills found in your resume",
        "Red pills — skills missing vs. the JD",
        "Skills extracted semantically, not just by exact text match",
        "Each missing skill links to a learning resource",
      ],
      color: "rgba(16,185,129,0.06)",
      border: "rgba(16,185,129,0.2)",
    },
    {
      icon: "✍️",
      tag: "AI Writing",
      title: "AI Resume Bullet Rewriter",
      desc: "Paste a weak bullet and get a rewritten version tuned specifically to the job description you're targeting. The rewrites use the JD's vocabulary and prioritise quantifiable impact.",
      bullets: [
        "Before/after comparison for each bullet",
        "Rewritten bullets match JD-specific language",
        "Uses Result + Action + Context + Metric formula",
        "Works on any bullet — projects, experience, internships",
      ],
      color: "rgba(245,158,11,0.06)",
      border: "rgba(245,158,11,0.2)",
    },
    {
      icon: "🗺️",
      tag: "Career",
      title: "Personalised Learning Roadmap",
      desc: "For every missing skill, we generate a prioritised, week-by-week roadmap: what to learn, in what order, and where. Not generic advice — specific to your gap vs. this JD.",
      bullets: [
        "Prioritised by impact on hiring probability",
        "Week-by-week milestones",
        "Curated resource links for each skill",
        "Updates automatically when you run a new analysis",
      ],
      color: "rgba(99,102,241,0.06)",
      border: "rgba(99,102,241,0.2)",
    },
    {
      icon: "🔀",
      tag: "Career",
      title: "Alternate Job Titles",
      desc: "Based on your current skill profile, we suggest roles you're already qualified for — even if the target JD was out of reach. Helps you find adjacent opportunities faster.",
      bullets: [
        "Derived from actual skill overlap with JD variants",
        "Sorted by match confidence",
        "Includes both lateral moves and step-up roles",
        "Useful when you're pivoting or early in your career",
      ],
      color: "rgba(245,158,11,0.06)",
      border: "rgba(245,158,11,0.2)",
    },
    {
      icon: "📈",
      tag: "Dashboard",
      title: "Application Tracker",
      desc: "A Kanban board to track every job you've applied to — from Applied → Shortlisted → Interview → Offer → Rejected. See your match score next to every application at a glance.",
      bullets: [
        "Drag-and-drop Kanban columns",
        "Score + role title per application card",
        "Notes and status per application",
        "Filter and search across all applications",
      ],
      color: "rgba(99,102,241,0.06)",
      border: "rgba(99,102,241,0.2)",
    },
    {
      icon: "🔒",
      tag: "Privacy",
      title: "No Resume Storage — Ever",
      desc: "Your resume is processed ephemerally. It's sent to the analysis pipeline, matched, and discarded. We never write raw resume text to a database. Only structured result data (scores, skill lists) is saved — and only if you're logged in.",
      bullets: [
        "Raw PDF never stored on our servers",
        "Extracted text discarded after analysis completes",
        "Structured results (scores, skills) saved only when you're logged in",
        "Delete all your data at any time from profile settings",
      ],
      color: "rgba(16,185,129,0.06)",
      border: "rgba(16,185,129,0.2)",
    },
  ];

  const TAG_COLORS = {
    "Core": "badge-indigo",
    "AI Writing": "badge-amber",
    "Career": "badge-green",
    "Dashboard": "badge-indigo",
    "Privacy": "badge-green",
  };

  return (
    <div style={{ paddingTop: "5rem", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg,rgba(99,102,241,0.09),transparent)", borderBottom: "1px solid var(--border)", padding: "4rem 2rem 3.5rem" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>Everything Included, Free</div>
          <h1 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", marginBottom: "1rem" }}>
            Every feature built to get you<br />shortlisted faster
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.8, maxWidth: 520, margin: "0 auto 2rem" }}>
            From semantic AI matching to AI-rewritten bullets, visual skill gaps, learning roadmaps,
            and an application tracker — everything you need in one tool.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary btn-lg" onClick={onGetStarted}>Try It Free →</button>
            <a href="#features-grid" className="btn-ghost btn-lg" style={{ display: "inline-flex", alignItems: "center" }}>See All Features ↓</a>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
          {[
            ["~30s", "Analysis time"],
            ["8+", "AI-powered features"],
            ["0", "Resume data stored"],
            ["100%", "Free to start"],
          ].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.35rem" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards grid */}
      <div id="features-grid" style={{ maxWidth: 1080, margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: f.color,
                border: `1px solid ${f.border}`,
                borderRadius: 14,
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                transition: "transform 200ms, border-color 200ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = f.border.replace("0.2", "0.45").replace("0.25", "0.5"); }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = f.border; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.75rem" }}>{f.icon}</span>
                <span className={`badge ${TAG_COLORS[f.tag]}`}>{f.tag}</span>
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.3 }}>{f.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.7, flex: 1 }}>{f.desc}</p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {f.bullets.map((b, i) => (
                  <li key={i} style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                    <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "4rem" }}>
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>All of this, completely free</h2>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem", maxWidth: 440, margin: "0 auto 1.5rem", fontSize: "0.9rem", lineHeight: 1.7 }}>
            No credit card. No account required to get your first analysis. Start in 30 seconds.
          </p>
          <button className="btn-primary btn-lg" onClick={onGetStarted}>Analyse My Resume →</button>
        </div>
      </div>
    </div>
  );
}
