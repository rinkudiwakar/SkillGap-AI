import { transformRecommendedRoles } from "../../lib/transform";

/**
 * RecommendedRolesCard — displays roles the candidate is best suited for.
 * Props:
 *   recommended_roles: string[]   — raw array from API result
 */
export default function RecommendedRolesCard({ recommended_roles }) {
  const roles = transformRecommendedRoles(recommended_roles);
  const isEmpty = roles.length === 0;

  return (
    <div className="panel" style={{ marginBottom: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.4rem" }}>🚀</span>
        <div>
          <div className="eyebrow">Career Fit</div>
          <h4 style={{ margin: 0 }}>Recommended Roles</h4>
        </div>
        {!isEmpty && (
          <span className="badge badge-indigo" style={{ marginLeft: "auto", fontSize: "0.7rem" }}>
            {roles.length} roles
          </span>
        )}
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
          }}
        >
          No role recommendations were generated for this analysis.
        </p>
      ) : (
        <>
          <p style={{ color: "var(--muted)", fontSize: "0.86rem", marginBottom: "1rem" }}>
            Based on your resume's skill profile, you're a strong candidate for these roles right now.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {roles.map((item, i) => (
              <div
                key={i}
                className="alt-title-card"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="alt-rank">
                  {String(item.rank).padStart(2, "0")}
                </div>
                <div className="alt-info">
                  <div className="alt-title-name">{item.role}</div>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem" }}>
                    <a
                      href={item.searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none" }}
                    >
                      LinkedIn Jobs →
                    </a>
                    <span style={{ color: "var(--border)" }}>|</span>
                    <a
                      href={item.googleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.78rem", color: "var(--muted)", textDecoration: "none" }}
                    >
                      Explore role →
                    </a>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "999px",
                    background: "rgba(99,102,241,0.12)",
                    color: "var(--accent)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Best Fit
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
