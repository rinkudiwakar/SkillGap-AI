export default function HowItWorksPage({ onGetStarted }) {
  const steps = [
    {
      num: "01",
      icon: "📄",
      title: "Upload Your Resume",
      desc: "Drop your PDF resume directly on the page — no account required. We extract the text on the spot and process it entirely in-session. Nothing is stored on our servers after your analysis completes.",
      detail: [
        "Accepts any PDF resume up to 5 MB",
        "Text is extracted using a PDF parser, not OCR — so formatting doesn't matter",
        "Raw text is never written to a database",
      ],
    },
    {
      num: "02",
      icon: "📋",
      title: "Paste or Link the Job Description",
      desc: "Either paste the full JD text or drop in a LinkedIn / Indeed / Naukri URL. We fetch and parse the JD, identify the role, required skills, seniority level, and years of experience expected.",
      detail: [
        "Works with plain-text paste or live job URLs",
        "Extracts role title, required skills, seniority, and years of experience",
        "Handles India-specific JD formats from Naukri, LinkedIn, and Internshala",
      ],
    },
    {
      num: "03",
      icon: "🧠",
      title: "AI Semantic Matching",
      desc: "Our pipeline uses sentence-transformer models to compute semantic similarity between your resume and the JD. This is not keyword counting — it understands meaning. \"Built REST APIs\" and \"developed backend services\" are treated as equivalent.",
      detail: [
        "Sentence-transformer embeddings (not TF-IDF or keyword frequency)",
        "Cosine similarity across skills, experience, and project sections",
        "Granular scoring: skill match, semantic similarity, project relevance, experience relevance",
      ],
    },
    {
      num: "04",
      icon: "📊",
      title: "Get Your Full Report",
      desc: "In ~30 seconds you get a complete breakdown: hiring probability score, plain-English insights, a visual skill gap (green/red pills), AI-rewritten resume bullets, alternate job titles you qualify for, and a learning roadmap for missing skills.",
      detail: [
        "Hiring probability score (0–100%) with thresholded confidence",
        "Green pills for skills you have · Red pills for skills you're missing",
        "AI-rewritten bullet points tailored to the specific JD",
        "Alternate job titles based on your current skill profile",
        "Prioritised learning roadmap for skill gaps",
      ],
    },
    {
      num: "05",
      icon: "💾",
      title: "Save & Track (Optional)",
      desc: "If you create a free account, your analysis is saved to your dashboard. Track multiple applications, compare results across JDs, and monitor how your profile improves over time.",
      detail: [
        "Unlimited saved analyses on the free plan",
        "Application tracker with Kanban board (Applied → Interview → Offer)",
        "Dashboard shows score trends across applications",
      ],
    },
  ];

  return (
    <div style={{ paddingTop: "5rem", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg,rgba(99,102,241,0.09),transparent)", borderBottom: "1px solid var(--border)", padding: "4rem 2rem 3.5rem" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>Under the Hood</div>
          <h1 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", marginBottom: "1rem" }}>
            From PDF to Hiring Probability<br />in 30 Seconds
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.8, maxWidth: 540, margin: "0 auto 2rem" }}>
            SkillGap AI uses semantic AI — not keyword matching — to give you an honest,
            data-driven picture of how well your resume fits any job description.
          </p>
          <button className="btn-primary btn-lg" onClick={onGetStarted}>
            Try It Free — No Account Needed →
          </button>
        </div>
      </div>

      {/* Step-by-step */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {steps.map((step, i) => (
            <div
              key={step.num}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: "2rem",
                padding: "2.5rem 0",
                borderBottom: i < steps.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "flex-start",
              }}
            >
              {/* Step number */}
              <div style={{ textAlign: "center", paddingTop: "0.25rem" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 700, color: "rgba(99,102,241,0.18)", lineHeight: 1 }}>
                  {step.num}
                </div>
                <div style={{ fontSize: "1.5rem", marginTop: "0.4rem" }}>{step.icon}</div>
              </div>
              {/* Content */}
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.6rem" }}>{step.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "1rem" }}>{step.desc}</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {step.detail.map((d, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)" }}>
                      <span style={{ color: "var(--green)", flexShrink: 0, marginTop: "0.15rem" }}>✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Tech callout */}
        <div className="panel" style={{ marginTop: "3rem", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.2)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: "0.6rem" }}>What powers it</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {["Sentence-Transformers", "FastAPI", "Celery", "Supabase", "React", "Python"].map(t => (
                <span key={t} className="badge badge-indigo">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: "0.6rem" }}>Privacy guarantees</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {["Resume text never stored in database", "Processed ephemerally — deleted after response", "No third-party LLMs (OpenAI, Anthropic) for core matching"].map(t => (
                <li key={t} style={{ fontSize: "0.78rem", color: "var(--muted)", display: "flex", gap: "0.4rem" }}>
                  <span style={{ color: "var(--green)" }}>🔒</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <p style={{ color: "var(--muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>Ready to see your score?</p>
          <button className="btn-primary btn-lg" onClick={onGetStarted}>Analyse My Resume — Free →</button>
        </div>
      </div>
    </div>
  );
}
