import { useState } from "react";
import ScoreGauge from "./ScoreGauge";

const MOCK = {
  score: 73,
  matchScore: "0.74",
  completeness: 82,
  role: "Senior Backend Engineer",
  found: ["Python", "Docker", "Machine Learning", "React", "AWS"],
  critical: ["Kubernetes", "FastAPI"],
  important: ["Redis", "PostgreSQL"],
  nice: ["Terraform"],
  bullets: [
    { original: "Worked on ML models for prediction tasks", rewritten: "Architected and deployed ensemble ML models (XGBoost + Random Forest) for real-time prediction pipelines, improving model accuracy by 18% across 3 production environments" },
    { original: "Helped with backend API development", rewritten: "Engineered and maintained 12+ RESTful API endpoints serving 50K daily requests, reducing average response latency from 340ms to 85ms through query optimization and Redis caching" },
    { original: "Worked on data pipeline improvements", rewritten: "Designed and optimized ETL data pipelines processing 2M+ records/day using Apache Airflow and PostgreSQL, cutting preprocessing time by 40%" },
  ],
  altTitles: [
    { title: "AI/ML Intern", match: 91 },
    { title: "ML Engineer", match: 81 },
    { title: "Python Developer", match: 83 },
    { title: "Backend Engineer", match: 78 },
    { title: "Data Scientist", match: 74 },
  ],
};

function KwHighlight({ text }) {
  const keywords = ["XGBoost", "Random Forest", "production", "Redis", "PostgreSQL", "Airflow", "ETL"];
  const parts = text.split(new RegExp(`(${keywords.join("|")})`, "gi"));
  return <>{parts.map((p, i) => keywords.some(k => k.toLowerCase() === p.toLowerCase()) ? <span key={i} className="kw-highlight">{p}</span> : p)}</>;
}

export default function SampleReportModal({ onClose }) {
  const [tab, setTab] = useState("overview");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="eyebrow">Sample Report</div>
            <h3 style={{ margin: 0 }}>Senior Backend Engineer Analysis</h3>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Score Hero */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem", marginBottom: "2rem", alignItems: "center" }}>
            <ScoreGauge score={MOCK.score} size={160} />
            <div className="score-ribbon" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="score-box"><span>Semantic Match</span><strong style={{ color: "var(--accent)" }}>{MOCK.matchScore}</strong></div>
              <div className="score-box"><span>Resume Completeness</span><strong>{MOCK.completeness}/100</strong></div>
              <div className="score-box" style={{ gridColumn: "span 2" }}>
                <span>Role Analysed</span><strong style={{ fontSize: "1rem" }}>{MOCK.role}</strong>
              </div>
            </div>
          </div>

          <div className="tab-bar" style={{ marginBottom: "1.5rem" }}>
            {[["overview", "Match Overview"], ["skills", "Skill Gap"], ["bullets", "Rewritten Bullets"], ["titles", "Alternate Titles"]].map(([id, label]) => (
              <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="tab-content">
              <div style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {[["Strong Python background", "+12%", "pos"], ["ML project experience aligns with JD", "+9%", "pos"], ["Kubernetes not found in resume", "−8%", "neg"]].map(([label, val, type]) => (
                  <div key={label} className={`factor-row ${type}`} style={{ flex: "1 1 220px" }}>
                    <div className={`factor-dot ${type}`}>{type === "pos" ? "▲" : "▼"}</div>
                    <div className="factor-text">{label}</div>
                    <div className="factor-val">{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "10px", fontSize: "0.88rem", color: "var(--muted)", fontStyle: "italic", lineHeight: "1.7" }}>
                "Your resume shows strong alignment in backend and ML skills. The primary gaps are in container orchestration (Kubernetes) and async API frameworks (FastAPI), both critical requirements for this role."
              </div>
            </div>
          )}

          {tab === "skills" && (
            <div className="tab-content">
              <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>10 skills required · 5 found · 5 missing</p>
              <div className="skills-split">
                <div>
                  <div className="skills-col-header found-header">✓ Skills Found</div>
                  <div className="skills-found">{MOCK.found.map(s => <span key={s} className="skill-pill found">✓ {s}</span>)}</div>
                </div>
                <div>
                  <div className="skills-col-header missing-header">✗ Skills Missing</div>
                  <div className="priority-group">
                    <div className="priority-label" style={{ color: "var(--red)" }}>🔴 CRITICAL</div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>{MOCK.critical.map(s => <span key={s} className="skill-pill missing">✗ {s}</span>)}</div>
                  </div>
                  <div className="priority-group">
                    <div className="priority-label" style={{ color: "var(--amber)" }}>🟡 IMPORTANT</div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>{MOCK.important.map(s => <span key={s} className="skill-pill missing">✗ {s}</span>)}</div>
                  </div>
                  <div className="priority-group">
                    <div className="priority-label" style={{ color: "var(--green)" }}>🟢 NICE TO HAVE</div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>{MOCK.nice.map(s => <span key={s} className="skill-pill missing">✗ {s}</span>)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "bullets" && (
            <div className="tab-content">
              {MOCK.bullets.map((b, i) => (
                <div key={i} style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.73rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Bullet #{i + 1}</div>
                  <div className="bullet-pair">
                    <div className="bullet-before"><div className="bullet-label before-label">Original</div>{b.original}</div>
                    <div className="bullet-after"><div className="bullet-label after-label">AI Rewritten ✦</div><KwHighlight text={b.rewritten} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "titles" && (
            <div className="tab-content">
              {MOCK.altTitles.map((t, i) => (
                <div key={i} className="alt-title-card" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="alt-rank">0{i + 1}</div>
                  <div className="alt-info">
                    <div className="alt-title-name">{t.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div className="match-bar-wrap" style={{ width: 160 }}><div className="match-bar-fill" style={{ width: `${t.match}%` }} /></div>
                      <span style={{ fontWeight: 600, color: "var(--accent)", fontSize: "0.88rem" }}>{t.match}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: "2rem", textAlign: "center", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
            <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: "1rem" }}>Ready to see this for your own resume?</p>
            <button className="btn-primary btn-lg" onClick={onClose}>Analyse My Resume — It's Free</button>
          </div>
        </div>
      </div>
    </div>
  );
}
