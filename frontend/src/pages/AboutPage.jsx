export default function AboutPage({ onGetStarted }) {
  return (
    <div style={{ paddingTop: "5rem", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg,rgba(99,102,241,0.08),transparent)", borderBottom: "1px solid var(--border)", padding: "4rem 2rem 3rem" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>Our Story</div>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", marginBottom: "1.25rem" }}>
            Built for every job seeker who ever wondered<br />"Am I a good fit?"
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.8, maxWidth: 580, margin: "0 auto" }}>
            SkillGap AI was built to give every candidate the honest, data-driven feedback
            that only a seasoned recruiter or career coach could previously provide — instantly, for free.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
          {[
            { icon: "🎯", title: "Our Mission", body: "Democratise career intelligence. Every job seeker — not just those with expensive coaches — deserves to know exactly where they stand before they apply." },
            { icon: "🇮🇳", title: "Built for India", body: "The Indian job market moves fast. Naukri, LinkedIn, Internshala — we understand the resume formats, skill expectations, and hiring patterns that matter here." },
            { icon: "🔒", title: "Privacy First", body: "Your resume is yours. We process it ephemerally — it's analysed and then discarded. We never store raw resume text on our servers." },
            { icon: "🤖", title: "How It Works", body: "We use sentence-transformer models and semantic similarity algorithms to match your resume against any JD — no generic keyword counting, real semantic understanding." },
          ].map(c => (
            <div key={c.title} className="panel" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ fontSize: "1.75rem" }}>{c.icon}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{c.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.7 }}>{c.body}</p>
            </div>
          ))}
        </div>

        {/* Founder */}
        <div className="panel" style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>👨‍💻</div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>Founder</div>
            <h3 style={{ marginBottom: "0.4rem" }}>Rinku Diwakar</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.7 }}>
              Full-stack developer based in Bengaluru. Built SkillGap AI after watching talented friends get filtered out by ATS systems
              not because they lacked skills, but because they didn't know how to present them. This tool exists to fix that.
            </p>
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["Python", "FastAPI", "React", "Supabase", "Sentence-Transformers"].map(t => (
                <span key={t} className="badge badge-indigo">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <p style={{ color: "var(--muted)", marginBottom: "1.25rem" }}>Ready to see where you stand?</p>
          <button className="btn-primary btn-lg" onClick={onGetStarted}>
            Analyse My Resume — Free →
          </button>
        </div>
      </div>
    </div>
  );
}
