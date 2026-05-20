import { useState } from "react";
import ScoreGauge from "./ScoreGauge";
import AnalysisInsights from "./analysis/AnalysisInsights";

const JD_SECTION_HEADINGS = [
  "About the Company",
  "About Sarvam",
  "About the Role",
  "About Role",
  "Responsibilities",
  "Key Responsibilities",
  "What You'll Do",
  "What You Will Do",
  "Requirements",
  "Qualifications",
  "Required Qualifications",
  "Preferred Qualifications",
  "Skills",
  "Benefits",
  "Why Join Us",
  "Location",
  "Apply for this role",
];

function cleanJobDescriptionText(text = "") {
  return String(text)
    .replace(/\uFFFD+/g, " ")
    .replace(/[•●▪]/g, "\n- ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function addHeadingBreaks(text) {
  return JD_SECTION_HEADINGS.reduce((value, heading) => {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\s+(${escaped})(?=\\s|:|$)`, "gi");
    return value.replace(pattern, "\n\n$1\n");
  }, text);
}

function splitSentencesIntoParagraphs(text) {
  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(item => item.trim())
    .filter(Boolean);

  if (sentences.length <= 2) return [text];

  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 2) {
    paragraphs.push(sentences.slice(i, i + 2).join(" "));
  }
  return paragraphs;
}

function parseJobDescription(text, limit) {
  const normalized = addHeadingBreaks(cleanJobDescriptionText(text));
  const source = limit && normalized.length > limit ? normalized.slice(0, limit).trim() : normalized;
  const blocks = source.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
  const sections = [];
  let current = { title: "Role Summary", items: [] };

  blocks.forEach(block => {
    const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
    const firstLine = lines[0] || "";
    const isHeading = JD_SECTION_HEADINGS.some(h => h.toLowerCase() === firstLine.replace(/:$/, "").toLowerCase());

    if (isHeading) {
      if (current.items.length) sections.push(current);
      current = { title: firstLine.replace(/:$/, ""), items: [] };
      lines.slice(1).forEach(line => current.items.push(line));
      return;
    }

    lines.forEach(line => {
      if (line.startsWith("- ")) current.items.push(line);
      else splitSentencesIntoParagraphs(line).forEach(part => current.items.push(part));
    });
  });

  if (current.items.length) sections.push(current);
  return { sections, isTruncated: Boolean(limit && normalized.length > limit) };
}

function JobDescriptionView({ text, limit }) {
  const { sections, isTruncated } = parseJobDescription(text, limit);

  return (
    <div style={{ display: "grid", gap: "1rem", whiteSpace: "normal" }}>
      {sections.map((section, sectionIndex) => (
        <section key={`${section.title}-${sectionIndex}`}>
          <h4 style={{ margin: "0 0 0.55rem", fontSize: "1rem", color: "var(--text)" }}>{section.title}</h4>
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {section.items.map((item, index) => {
              const isBullet = item.startsWith("- ");
              if (isBullet) {
                return (
                  <div key={`${index}-${item.slice(0, 16)}`} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.55rem", alignItems: "start", color: "var(--muted)", lineHeight: 1.7 }}>
                    <span style={{ color: "var(--accent)", marginTop: "0.1rem" }}>-</span>
                    <span>{item.slice(2).trim()}</span>
                  </div>
                );
              }
              return <p key={`${index}-${item.slice(0, 16)}`} style={{ margin: 0, color: "var(--muted)", lineHeight: 1.8 }}>{item}</p>;
            })}
          </div>
        </section>
      ))}
      {isTruncated && <p style={{ margin: 0, color: "var(--accent)", fontWeight: 600 }}>Preview shortened. Open the full job description below.</p>}
    </div>
  );
}

function DetailedText({ label, text, sourceUrl, limit = 300 }) {
  const [showModal, setShowModal] = useState(false);
  const isTooLong = text?.length > limit;

  return (
    <>
      <div className="panel" style={{ background: "rgba(255,255,255,0.02)", marginBottom: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="panel-heading" style={{ marginBottom: "0.75rem" }}>
          <div>
            <div className="eyebrow">{label}</div>
          </div>
        </div>
        <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-sans)" }}>
          <JobDescriptionView text={text} limit={limit} />
        </div>
        {sourceUrl && (
          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
            <div className="eyebrow" style={{ marginBottom: "0.45rem" }}>Original Posting</div>
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: "0.9rem", lineHeight: 1.6, overflowWrap: "anywhere" }}>
              {sourceUrl}
            </a>
          </div>
        )}
        {isTooLong && (
          <button
            className="btn-ghost btn-sm"
            style={{ marginTop: "1rem", color: "var(--accent)" }}
            onClick={() => setShowModal(true)}
          >
            Read More
          </button>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", animation: "fadeSlide 0.2s ease-out"
        }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{
            background: "rgba(13, 20, 38, 0.95)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px", maxWidth: "800px", width: "100%", maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05)", animation: "modalFade 0.25s ease-out"
          }}>
            <div className="modal-header" style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{label}</h3>
              </div>
              <button className="btn-ghost btn-sm" onClick={() => setShowModal(false)} style={{ padding: "0.5rem", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: "1.5rem", overflowY: "auto", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--text)", whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)" }}>
              <JobDescriptionView text={text} />
              {sourceUrl && (
                <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", whiteSpace: "normal" }}>
                  <div className="eyebrow" style={{ marginBottom: "0.45rem" }}>Original Posting</div>
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", overflowWrap: "anywhere" }}>
                    {sourceUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RoleHero({ role, score, matchScore, company }) {
  // Strict truncation for the hero title to prevent JD-text leak
  const cleanRole = role && role.length > 80 ? role.slice(0, 80) + "..." : (role || "Candidate Role");

  return (
    <div className="role-hero">
      <div className="role-hero-content">
        <div className="eyebrow" style={{ color: "rgba(255,255,255,0.5)" }}>Target Role Matched</div>
        <h2 className="role-hero-title">{cleanRole}</h2>
        <div className="role-hero-meta">
          <span className="badge badge-indigo">AI Calibration</span>
          {company && <span>at {company}</span>}
          <span>•</span>
          <span>Analysis complete</span>
        </div>
      </div>
      <div className="role-hero-score">
        <ScoreGauge score={score} size={140} />
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
          Semantic Match: <strong style={{ color: "var(--accent)" }}>{matchScore}</strong>
        </div>
      </div>
      <div className="role-hero-blur" />
    </div>
  );
}

// Removed SuggestedJobsList as per user request to focus on primary role and resume enhancement.

function formatPercent(v) {
  if (v == null) return "—";
  return `${Math.round(Number(v) * 100)}%`;
}

function SkillPill({ skill, type }) {
  return (
    <span className={`skill-pill ${type}`}>
      {type === "found" ? "✓" : "✗"} {skill}
    </span>
  );
}

function LearnBtn({ skill }) {
  return (
    <a
      href={`https://www.google.com/search?q=${encodeURIComponent(skill + " tutorial")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="learn-btn"
    >
      Learn
    </a>
  );
}

function PriorityGroup({ label, color, dot, skills }) {
  if (!skills || skills.length === 0) return null;
  return (
    <div className="priority-group">
      <div className="priority-label" style={{ color }}>
        <span>{dot}</span> {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {skills.map((s) => (
          <span key={s} style={{ display: "inline-flex", alignItems: "center" }}>
            <span className="skill-pill missing">{s}</span>
            <LearnBtn skill={s} />
          </span>
        ))}
      </div>
    </div>
  );
}

function BulletPair({ original, rewritten, index }) {
  const jdKeywords = ["XGBoost", "Random Forest", "production", "FastAPI", "Kubernetes", "Redis", "PostgreSQL", "Docker"];

  function highlightKeywords(text) {
    if (!text) return text;
    let result = text;
    const parts = [];
    let remaining = text;
    const regex = new RegExp(`(${jdKeywords.join("|")})`, "gi");
    const segments = text.split(regex);
    return segments.map((seg, i) =>
      jdKeywords.some(kw => kw.toLowerCase() === seg.toLowerCase())
        ? <span key={i} className="kw-highlight">{seg}</span>
        : seg
    );
  }

  const handleCopy = () => navigator.clipboard.writeText(rewritten || "");

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
        Experience Bullet #{index + 1}
      </div>
      <div className="bullet-pair">
        <div className="bullet-before">
          <div className="bullet-label before-label">Original</div>
          <div>{original}</div>
        </div>
        <div className="bullet-after">
          <div className="bullet-label after-label">AI Rewritten ✦</div>
          <div>{highlightKeywords(rewritten)}</div>
        </div>
      </div>
      <button className="btn-ghost btn-sm btn-icon" onClick={handleCopy} style={{ fontSize: "0.8rem" }}>
        📋 Copy rewritten bullet
      </button>
    </div>
  );
}

function normalizePercent(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  const numeric = Number(value);
  return Math.round(numeric <= 1 ? numeric * 100 : numeric);
}

function toInsightSentence(label, rawValue) {
  const v = normalizePercent(rawValue);
  if (v == null) return null;

  if (label === "Primary Skill Match") {
    if (v >= 75) return { icon: "✓", color: "var(--green)", text: "Your skills closely match what this role requires." };
    if (v >= 50) return { icon: "~", color: "var(--amber)", text: "Your skills partially match this role — a few gaps to fill." };
    return { icon: "✗", color: "var(--red)", text: "Your skill set has significant gaps compared to this role's requirements." };
  }
  if (label === "Semantic Text Similarity") {
    if (v >= 70) return { icon: "✓", color: "var(--green)", text: "Your experience description closely matches what this role requires." };
    if (v >= 45) return { icon: "~", color: "var(--amber)", text: "Your experience description is somewhat aligned — consider stronger action verbs." };
    return { icon: "✗", color: "var(--red)", text: "Your experience description doesn't strongly align with this role's language." };
  }
  if (label === "Project Relevance") {
    if (v >= 70) return { icon: "✓", color: "var(--green)", text: "Your past projects are highly relevant to this kind of work." };
    if (v >= 40) return { icon: "~", color: "var(--amber)", text: "Some of your projects are relevant, but not all are a strong fit." };
    return { icon: "✗", color: "var(--red)", text: "Your listed projects don't closely match the work described in this JD." };
  }
  if (label === "Experience Relevance") {
    if (v >= 70) return { icon: "✓", color: "var(--green)", text: "Your work history is a strong fit for what this employer is looking for." };
    if (v >= 40) return { icon: "~", color: "var(--amber)", text: "Your background is partially relevant — framing your experience differently could help." };
    return { icon: "✗", color: "var(--red)", text: "Your work history doesn't closely match the level or domain this role expects." };
  }
  return null;
}

function InsightRow({ label, value }) {
  const insight = toInsightSentence(label, value);
  if (!insight) return null;
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontSize: "1.1rem", color: insight.color, lineHeight: 1, paddingTop: "0.1rem", flexShrink: 0 }}>{insight.icon}</span>
      <span style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{insight.text}</span>
    </div>
  );
}

export default function ResultDetail({ result }) {
  const [tab, setTab] = useState("overview");
  if (!result) return null;

  const score = Math.round(Number(result.hiring_probability || 0));
  const matchScore = result.match_score != null ? Number(result.match_score).toFixed(2) : "—";
  const completeness = result.resume_completeness_score || 82;

  const foundSkills = result.found_skills || [];
  const missingSkills = result.missing_skills || {};
  const criticalSkills = Array.isArray(missingSkills) ? [] : (missingSkills.critical || []);
  const importantSkills = Array.isArray(missingSkills) ? [] : (missingSkills.important || []);
  const niceSkills = Array.isArray(missingSkills) ? [] : (missingSkills.nice_to_have || []);
  const allMissing = Array.isArray(missingSkills) ? missingSkills : [...criticalSkills, ...importantSkills, ...niceSkills];

  const bullets = result.rewritten_bullets || [];
  const altTitles = result.alternate_job_titles || [];
  const factors = result.score_factors || {};

  const totalFound = foundSkills.length;
  const totalMissing = allMissing.length;
  const totalSkills = totalFound + totalMissing;
  const skillMatchScore = result.skill_match_score ?? result.granular_scores?.skill_match;
  const semanticSimilarity = result.cosine_similarity;
  const projectRelevance = result.project_relevance_score ?? result.granular_scores?.project_relevance;
  const experienceRelevance = result.experience_relevance_score ?? result.granular_scores?.experience_relevance;
  const finalAccuracyScore = normalizePercent(result.hiring_probability ?? result.match_score) ?? 0;

  const copyAll = () => {
    const text = bullets.map((b, i) => `${i + 1}. ${b.rewritten || b}`).join("\n");
    navigator.clipboard.writeText(text);
  };

  const downloadTxt = () => {
    const text = bullets.map((b, i) => `${i + 1}. ${b.rewritten || b}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "rewritten-bullets.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Role Hero (New Interactive Top Component) */}
      <RoleHero
        role={result.jd_role}
        score={score}
        matchScore={matchScore}
        company={result.company_name}
      />

      {/* Score Hero (Minimized) */}
      <div className="result-summary-grid">
        <div className="stack">
          <div className="score-box" style={{ background: "rgba(99, 102, 241, 0.05)" }}>
            <span>Resume Completeness</span>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <strong style={{ fontSize: "1.2rem" }}>{completeness}/100</strong>
              <div className="progress-bar-wrap" style={{ flex: 1 }}>
                <div className="progress-bar-fill" style={{ width: `${completeness}%` }} />
              </div>
            </div>
          </div>
          {result.summary && (
            <div style={{ padding: "1.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "16px", fontSize: "0.9rem", color: "var(--muted)", lineHeight: "1.7", fontStyle: "italic" }}>
              <div className="eyebrow" style={{ fontStyle: "normal", marginBottom: "0.5rem" }}>A-I SUMMARY</div>
              "{result.summary}"
            </div>
          )}
        </div>

        <div className="panel" style={{ height: "100%" }}>
          <div className="eyebrow" style={{ marginBottom: "1rem" }}>Top Factors</div>
          <div className="stack" style={{ gap: "0.5rem" }}>
            {(factors.positive || []).slice(0, 2).map((f, i) => (
              <div key={i} className="factor-row pos">
                <div className="factor-dot pos">▲</div>
                <div className="factor-text">{f.label || f}</div>
                <div className="factor-val">{f.impact ? `+${f.impact}%` : ""}</div>
              </div>
            ))}
            {(factors.negative || []).slice(0, 2).map((f, i) => (
              <div key={i} className="factor-row neg">
                <div className="factor-dot neg">▼</div>
                <div className="factor-text">{f.label || f}</div>
                <div className="factor-val">{f.impact ? `−${Math.abs(f.impact)}%` : ""}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar" style={{ marginBottom: "1.5rem" }}>
        {[["overview", "Match Overview"], ["skills", "Skill Gap"], ["bullets", "Rewritten Bullets (AI Coach)"], ["insights", "🧠 AI Insights"]].map(([id, label]) => (
          <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* OVERVIEW SECTION REDESIGN */}
      {tab === "overview" && (
        <div className="tab-content">
          <div className="inner-workspace-grid">
            <div className="stack">
              <DetailedText label="Analyzed Job Description" text={result.jd_text || "No description provided."} sourceUrl={result.jd_source_url} limit={800} />

              <div className="panel">
                <div className="eyebrow" style={{ marginBottom: "1rem" }}>Actionable Insights</div>
                <div className="stack" style={{ gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.4rem" }}>Resume Suitability</div>
                      <div className="progress-bar-wrap" style={{ height: "10px" }}>
                        <div className="progress-bar-fill" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.4rem" }}>Market Competitiveness</div>
                      <div className="progress-bar-wrap" style={{ height: "10px" }}>
                        <div className="progress-bar-fill" style={{ width: `${completeness}%`, background: "var(--green)" }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.92rem", color: "var(--muted)", lineHeight: 1.7 }}>
                    {result.summary ? `✦ ${result.summary}` : "Analysis complete. Switch to the Skill Gap or AI Insights tab for a deeper breakdown of your profile."}
                  </div>
                </div>
              </div>
            </div>

            <div className="stack">
              <div className="panel" style={{ background: "rgba(13, 20, 38, 0.4)" }}>
                <div className="eyebrow" style={{ marginBottom: "1rem" }}>What This Score Means</div>
                <InsightRow label="Primary Skill Match" value={skillMatchScore} />
                <InsightRow label="Semantic Text Similarity" value={semanticSimilarity} />
                <InsightRow label="Project Relevance" value={projectRelevance} />
                <InsightRow label="Experience Relevance" value={experienceRelevance} />
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
                  <span style={{ fontSize: "0.88rem" }}>Overall Hiring Probability</span>
                  <span style={{ color: "var(--accent)", fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>{finalAccuracyScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SKILL GAP */}
      {tab === "skills" && (
        <div className="tab-content">
          <div className="skills-split">
            {/* Left: green pills */}
            <div>
              <div className="skills-col-header found-header" style={{ marginBottom: "1rem" }}>✓ Skills You Have</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {foundSkills.length > 0
                  ? foundSkills.map((s) => <SkillPill key={s} skill={s} type="found" />)
                  : <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>No matched skills found.</span>}
              </div>
            </div>
            {/* Right: red pills */}
            <div>
              <div className="skills-col-header missing-header" style={{ marginBottom: "1rem" }}>✗ Skills You're Missing</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {allMissing.length > 0
                  ? allMissing.map((s) => (
                    <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                      <span className="skill-pill missing">✗ {s}</span>
                      <LearnBtn skill={s} />
                    </span>
                  ))
                  : <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>No missing skills — great fit!</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULLETS / RESUME ENHANCER */}
      {tab === "bullets" && (
        <div className="tab-content">
          <div className="panel" style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ fontSize: "2rem" }}>🚀</div>
              <div>
                <h4 style={{ color: "white", marginBottom: "0.25rem" }}>Resume Enhancer (AI Coach)</h4>
                <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>
                  We've analyzed your experience against {result.jd_role && result.jd_role.length > 60 ? "the target role" : (result.jd_role || "the target role")}. Use these high-impact bullets to replace your current ones for a massive match boost.
                </p>
              </div>
            </div>
          </div>

          <div className="stack" style={{ gap: "2rem" }}>
            {bullets.length > 0 ? (
              bullets.map((b, i) => (
                <div key={i} className="panel" style={{ background: "rgba(255,255,255,0.02)", position: "relative" }}>
                  <div style={{ position: "absolute", left: "-10px", top: "20px", width: "4px", height: "40px", background: "var(--accent)", borderRadius: "2px" }} />
                  <div className="eyebrow" style={{ marginBottom: "1rem", color: "var(--accent)" }}>Replacement Strategy #{i + 1}</div>
                  <div style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "var(--text)", fontWeight: 500, marginBottom: "1.5rem" }}>
                    {typeof b === "string" ? b : (b.rewritten || "No content")}
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button className="btn-primary btn-sm" onClick={() => navigator.clipboard.writeText(typeof b === "string" ? b : b.rewritten)}>
                      📋 Copy Strategy
                    </button>
                    <div style={{ flex: 1, fontSize: "0.8rem", color: "var(--muted)", fontStyle: "italic", textAlign: "right" }}>
                      Impact: Focuses on {result.found_skills?.[i % result.found_skills.length] || "key technical outcomes"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state"><div className="empty-icon">✍️</div><p>No rewritten bullets available. Run a fresh analysis to generate coaching.</p></div>
            )}
          </div>

          {bullets.length > 0 && (
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
              <button className="btn-ghost btn-sm" onClick={copyAll}>📋 Copy All Rewritten Bullets</button>
              <button className="btn-ghost btn-sm" onClick={downloadTxt}>⬇ Download Summary</button>
            </div>
          )}
        </div>
      )}


      {/* AI INSIGHTS */}
      {tab === "insights" && (
        <div className="tab-content">
          <AnalysisInsights result={result} />
        </div>
      )}

      {/* Action Strip */}
      <div className="action-strip">
        <h4>What to do next</h4>
        <div className="action-steps">
          <div className="action-step">
            <div className="action-step-num">Step 1</div>
            Learn your top missing skill →
            {allMissing[0] && <a href={`https://www.google.com/search?q=${encodeURIComponent(allMissing[0] + " tutorial")}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", marginLeft: "0.3rem" }}>{allMissing[0]}</a>}
          </div>
          <div className="action-step">
            <div className="action-step-num">Step 2</div>
            Update your resume with the rewritten bullets
            {bullets.length > 0 && <button className="btn-primary btn-sm" style={{ display: "block", marginTop: "0.5rem" }} onClick={copyAll}>Copy Bullets</button>}
          </div>
          <div className="action-step">
            <div className="action-step-num">Step 3</div>
            Improve other qualified skills →
            <a href="#skills" onClick={() => setTab("skills")} style={{ color: "var(--accent)", marginLeft: "0.3rem" }}>Skill Analysis</a>
          </div>
          <div className="action-step">
            <div className="action-step-num">Step 4 — Coming Soon</div>
            Generate a cover letter tailored to this JD
            <span className="badge badge-amber" style={{ display: "inline-block", marginTop: "0.4rem" }}>Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
