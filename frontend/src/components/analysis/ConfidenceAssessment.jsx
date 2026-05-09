/**
 * ConfidenceAssessment — displays the honest assessment of hiring probability
 * and the impact of the roadmap.
 * Props:
 *   confidence_assessment: string   — one-sentence honest assessment from LLM
 *   hiring_probability: number      — current hiring probability %
 *   gap_count: number               — number of missing skills
 */
export default function ConfidenceAssessment({ confidence_assessment, hiring_probability = 0, gap_count = 0 }) {
  const isEmpty = !confidence_assessment || confidence_assessment.trim().length === 0;

  // Determine color based on probability
  const getColor = (prob) => {
    if (prob >= 75) return { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", accent: "var(--green)" };
    if (prob >= 50) return { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", accent: "var(--accent)" };
    if (prob >= 25) return { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", accent: "var(--amber)" };
    return { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.18)", accent: "var(--red)" };
  };

  const colors = getColor(hiring_probability);

  const getIcon = (prob) => {
    if (prob >= 75) return "✅";
    if (prob >= 50) return "📊";
    if (prob >= 25) return "⏳";
    return "❌";
  };

  const getLabel = (prob) => {
    if (prob >= 75) return "Strong Fit";
    if (prob >= 50) return "Moderate Fit";
    if (prob >= 25) return "Developing";
    return "Needs Work";
  };

  return (
    <div className="panel" style={{ marginBottom: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.4rem" }}>{getIcon(hiring_probability)}</span>
        <div>
          <div className="eyebrow">Realistic Assessment</div>
          <h4 style={{ margin: 0 }}>Your Hiring Probability</h4>
        </div>
        <span
          className="badge"
          style={{
            marginLeft: "auto",
            fontSize: "0.7rem",
            background: colors.accent,
            color: "white",
            padding: "0.35rem 0.75rem",
            borderRadius: "4px",
            fontWeight: 600,
          }}
        >
          {hiring_probability}%
        </span>
      </div>

      {/* Probability bar */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{
          height: "6px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "3px",
          overflow: "hidden"
        }}>
          <div style={{
            height: "100%",
            width: `${hiring_probability}%`,
            background: colors.accent,
            transition: "width 0.3s ease",
            borderRadius: "3px"
          }} />
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.4rem", display: "flex", justifyContent: "space-between" }}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Assessment message */}
      {!isEmpty ? (
        <p
          style={{
            padding: "1rem",
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            fontSize: "0.9rem",
            color: "var(--text)",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {confidence_assessment}
        </p>
      ) : (
        <p
          style={{
            padding: "1rem",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            fontSize: "0.9rem",
            color: "var(--muted)",
            lineHeight: 1.7,
            margin: 0,
            fontStyle: "italic",
          }}
        >
          No assessment available for this analysis.
        </p>
      )}

      {/* Gap summary */}
      {gap_count > 0 && (
        <div style={{
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--border)",
          fontSize: "0.85rem",
          color: "var(--muted)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Missing Skills to Close Gap:</span>
            <span style={{ fontWeight: 700, color: "var(--accent)" }}>{gap_count}</span>
          </div>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>
            Follow the roadmap above to improve your profile
          </p>
        </div>
      )}
    </div>
  );
}
