import { useState } from "react";

export default function CareersPage() {
  const [applied, setApplied] = useState("");
  const [form, setForm] = useState({ name: "", email: "", role: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const openings = [
    {
      role: "ML / NLP Engineer",
      type: "Part-time · Remote",
      description: "Help us improve our sentence-transformer pipeline, semantic matching accuracy, and expand language model capabilities for Indian resume formats.",
      skills: ["Python", "HuggingFace", "Sentence-Transformers", "FastAPI"],
    },
    {
      role: "Full-Stack Developer",
      type: "Part-time · Remote",
      description: "Build new features — cover letter generation, ATS score checker, and application tracking improvements. React + FastAPI stack.",
      skills: ["React", "Python", "Supabase", "CSS"],
    },
    {
      role: "Product Designer",
      type: "Freelance · Remote",
      description: "Own the visual identity and UX of SkillGap AI. Define interaction patterns, improve mobile experience, and design new features.",
      skills: ["Figma", "UI/UX", "Design Systems", "Prototyping"],
    },
    {
      role: "Growth & Content",
      type: "Part-time · Remote",
      description: "Drive awareness among Indian job seekers. Write SEO content, manage social presence, and run growth experiments.",
      skills: ["SEO", "Content Writing", "LinkedIn", "Analytics"],
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role) return;
    setSubmitted(true);
  };

  return (
    <div style={{ paddingTop: "5rem", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg,rgba(99,102,241,0.08),transparent)", borderBottom: "1px solid var(--border)", padding: "4rem 2rem 3rem" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>Join Us</div>
          <h1 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", marginBottom: "1rem" }}>
            Help us redefine how India finds jobs
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.8, maxWidth: 540, margin: "0 auto" }}>
            We're an early-stage product with big ambitions. If you want to build something meaningful
            that helps lakhs of job seekers, we'd love to talk.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "4rem 2rem" }}>
        {/* Values */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem", flexWrap: "wrap" }}>
          {["🚀 Early stage — your work ships fast", "🌏 Fully remote", "🤝 Equity conversations possible", "🧪 High ownership, low bureaucracy"].map(v => (
            <span key={v} className="badge badge-indigo" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>{v}</span>
          ))}
        </div>

        {/* Open Roles */}
        <h2 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>Open Positions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
          {openings.map((o) => (
            <div key={o.role} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{o.role}</h3>
                  <span className="badge badge-muted">{o.type}</span>
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>{o.description}</p>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {o.skills.map(s => <span key={s} className="badge badge-green" style={{ fontSize: "0.68rem" }}>{s}</span>)}
                </div>
              </div>
              <button
                className={applied === o.role ? "btn-ghost btn-sm" : "btn-primary btn-sm"}
                onClick={() => setApplied(o.role)}
                style={{ flexShrink: 0 }}
              >
                {applied === o.role ? "✓ Noted" : "Apply →"}
              </button>
            </div>
          ))}
        </div>

        {/* Application form */}
        <div className="panel" style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "0.35rem" }}>Send us a note</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Don't see a role that fits? Tell us what you can do.</p>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎉</div>
              <h3>Thanks, {form.name}!</h3>
              <p style={{ color: "var(--muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>We'll be in touch at {form.email} if there's a fit.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="field">
                  <label>Full Name</label>
                  <input type="text" placeholder="Priya Sharma" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" placeholder="priya@example.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label>Role You're Interested In</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required>
                  <option value="">Select a role…</option>
                  {openings.map(o => <option key={o.role} value={o.role}>{o.role}</option>)}
                  <option value="Other">Something else</option>
                </select>
              </div>
              <div className="field">
                <label>Tell us about yourself</label>
                <textarea rows={4} placeholder="What you've built, what you want to build, and why SkillGap AI…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ resize: "vertical" }} />
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start", padding: "0.65rem 1.5rem" }}>Send Application →</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
