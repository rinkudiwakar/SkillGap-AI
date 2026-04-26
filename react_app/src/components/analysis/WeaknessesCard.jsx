import { transformWeaknesses } from "../../lib/transform";

/**
 * WeaknessesCard — displays identified weaknesses from LLM analysis.
 * Props:
 *   weaknesses: string[]   — raw array from API result
 */
export default function WeaknessesCard({ weaknesses }) {
  const sentence = transformWeaknesses(weaknesses);
  const isEmpty = !weaknesses || weaknesses.length === 0;

  return (
    <div className="panel" style={{ marginBottom: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.4rem" }}>⚠️</span>
        <div>
          <div className="eyebrow">LLM Analysis</div>
          <h4 style={{ margin: 0 }}>Areas to Improve</h4>
        </div>
        <span
          className="badge badge-amber"
          style={{ marginLeft: "auto", fontSize: "0.7rem", opacity: isEmpty ? 0.4 : 1 }}
        >
          {isEmpty ? "No Data" : `${weaknesses.length} identified`}
        </span>
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
            : "rgba(245,158,11,0.06)",
          border: `1px solid ${isEmpty ? "var(--border)" : "rgba(245,158,11,0.2)"}`,
          borderRadius: 10,
        }}
      >
        {sentence}
      </p>

      {/* Tag list */}
      {!isEmpty && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {weaknesses.map((w, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.35rem 0.85rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: 600,
                background: "rgba(245,158,11,0.1)",
                color: "var(--amber)",
                border: "1px solid rgba(245,158,11,0.22)",
                animation: `fadeSlide 0.35s ease both`,
                animationDelay: `${i * 50}ms`,
              }}
            >
              ⚡ {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
