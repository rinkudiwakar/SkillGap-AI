import { transformMissingSkills } from "../../lib/transform";

/**
 * MissingSkillsCard — displays missing skills with actionable learn links.
 * Props:
 *   missing_skills: string[]   — raw array from API result
 */
export default function MissingSkillsCard({ missing_skills }) {
  let items = [];
  if (Array.isArray(missing_skills)) {
    items = missing_skills;
  } else if (missing_skills && typeof missing_skills === "object") {
    items = [
      ...(missing_skills.critical || []),
      ...(missing_skills.important || []),
      ...(missing_skills.nice_to_have || [])
    ];
  }
  const sentence = transformMissingSkills(items);
  const isEmpty = items.length === 0;

  return (
    <div className="panel" style={{ marginBottom: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.4rem" }}>🎯</span>
        <div>
          <div className="eyebrow">Skill Gap</div>
          <h4 style={{ margin: 0 }}>Skills to Learn</h4>
        </div>
        {!isEmpty && (
          <span className="badge badge-red" style={{ marginLeft: "auto", fontSize: "0.7rem" }}>
            {items.length} missing
          </span>
        )}
      </div>

      {/* Readable sentence */}
      <p
        style={{
          color: "var(--muted)",
          fontSize: "0.9rem",
          lineHeight: 1.7,
          marginBottom: isEmpty ? 0 : "1.25rem",
          fontStyle: isEmpty ? "italic" : "normal",
          padding: "0.85rem 1rem",
          background: isEmpty
            ? "rgba(255,255,255,0.02)"
            : "rgba(239,68,68,0.06)",
          border: `1px solid ${isEmpty ? "var(--border)" : "rgba(239,68,68,0.18)"}`,
          borderRadius: 10,
        }}
      >
        {sentence}
      </p>

      {/* Skill pills with learn links */}
      {!isEmpty && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {items.map((skill, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                animation: `fadeSlide 0.35s ease both`,
                animationDelay: `${i * 40}ms`,
              }}
            >
              <span className="skill-pill missing">✗ {skill}</span>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(skill + " tutorial")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="learn-btn"
              >
                Learn
              </a>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
