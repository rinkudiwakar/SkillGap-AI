/**
 * RewrittenBullets — displays optimized resume bullets from LLM analysis.
 * Props:
 *   rewritten_bullets: string[]   — raw array from API result
 */
export default function RewrittenBullets({ rewritten_bullets }) {
  const isEmpty = !rewritten_bullets || rewritten_bullets.length === 0;

  return (
    <div className="panel" style={{ marginBottom: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.4rem" }}>✏️</span>
        <div>
          <div className="eyebrow">Resume Optimization</div>
          <h4 style={{ margin: 0 }}>Rewritten Bullets</h4>
        </div>
        <span
          className="badge badge-purple"
          style={{ marginLeft: "auto", fontSize: "0.7rem", opacity: isEmpty ? 0.4 : 1 }}
        >
          {isEmpty ? "No Data" : `${rewritten_bullets.length} optimized`}
        </span>
      </div>

      {isEmpty ? (
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            fontStyle: "italic",
            padding: "0.85rem 1rem",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            margin: 0,
          }}
        >
          No optimized bullets were generated for this analysis.
        </p>
      ) : (
        <>
          <p style={{
            color: "var(--muted)",
            fontSize: "0.85rem",
            lineHeight: 1.6,
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            background: "rgba(168,85,247,0.06)",
            border: "1px solid rgba(168,85,247,0.15)",
            borderRadius: 10,
          }}>
            These resume bullets have been rewritten to highlight relevant skills and quantified achievements. Copy and paste them into your resume to improve your match score.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {rewritten_bullets.map((bullet, i) => (
              <div
                key={i}
                style={{
                  padding: "1rem",
                  background: "rgba(168,85,247,0.04)",
                  border: "1px solid rgba(168,85,247,0.12)",
                  borderRadius: 12,
                  position: "relative",
                  animation: `fadeSlide 0.35s ease both`,
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {/* Bullet indicator */}
                <div style={{
                  position: "absolute",
                  top: "1rem",
                  left: "1rem",
                  fontSize: "1.2rem",
                  opacity: 0.6,
                }}>
                  •
                </div>

                {/* Bullet text */}
                <p
                  style={{
                    margin: 0,
                    marginLeft: "1.8rem",
                    fontSize: "0.9rem",
                    color: "var(--text)",
                    lineHeight: 1.7,
                  }}
                >
                  {bullet}
                </p>

                {/* Copy button */}
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(bullet);
                    // Optional: show toast notification
                  }}
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    padding: "0.4rem 0.6rem",
                    fontSize: "0.7rem",
                    opacity: 0.6,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = "1"}
                  onMouseLeave={(e) => e.target.style.opacity = "0.6"}
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
            fontSize: "0.85rem",
            color: "var(--muted)",
            textAlign: "center",
          }}>
            💡 <span>Update your resume with these bullets to increase your match score</span>
          </div>
        </>
      )}
    </div>
  );
}
