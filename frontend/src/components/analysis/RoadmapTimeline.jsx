function ApplyNowCard({ message }) {
  return (
    <div className="panel" style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.4rem" }}>🚀</span>
        <div>
          <div className="eyebrow">Readiness</div>
          <h4 style={{ margin: 0 }}>You Are Ready to Apply</h4>
        </div>
      </div>
      <div style={{
        padding: "1.25rem",
        background: "rgba(16,185,129,0.08)",
        border: "1px solid rgba(16,185,129,0.25)",
        borderRadius: 12,
        fontSize: "0.95rem",
        color: "var(--text)",
        lineHeight: 1.7
      }}>
        {message}
      </div>
    </div>
  );
}

function SprintPlan({ plan, estimatedTime }) {
  return (
    <div className="panel" style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.4rem" }}>⚡</span>
        <div>
          <div className="eyebrow">Sprint Plan · {estimatedTime}</div>
          <h4 style={{ margin: 0 }}>Close the Gap Fast</h4>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {(plan || []).map((item, i) => (
          <div key={i} style={{
            padding: "1.25rem",
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 12
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
              flexWrap: "wrap",
              gap: "0.5rem"
            }}>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--accent)" }}>
                {item.skill}
              </span>
              <span className="badge badge-indigo" style={{ fontSize: "0.7rem" }}>
                ~{item.honest_time}
              </span>
            </div>
            <p style={{
              fontSize: "0.85rem",
              color: "var(--muted)",
              marginBottom: "0.75rem",
              lineHeight: 1.6
            }}>
              {item.why_it_matters}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: "2px" }}>📖</span>
                <div>
                  <span style={{ color: "var(--muted)", fontWeight: 600 }}>Resource: </span>
                  <span style={{ color: "var(--text)" }}>{item.resource}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--green)", flexShrink: 0, marginTop: "2px" }}>🛠️</span>
                <div>
                  <span style={{ color: "var(--muted)", fontWeight: 600 }}>Build this: </span>
                  <span style={{ color: "var(--text)" }}>{item.proof_of_work}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FocusedPlan({ plan, estimatedTime, priorityReason }) {
  return (
    <div className="panel" style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.4rem" }}>🎯</span>
        <div>
          <div className="eyebrow">Focused Plan · {estimatedTime}</div>
          <h4 style={{ margin: 0 }}>Priority Skill Plan</h4>
        </div>
      </div>
      {priorityReason && (
        <div style={{
          padding: "0.85rem 1rem",
          background: "rgba(245,158,11,0.07)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 10,
          fontSize: "0.85rem",
          color: "var(--muted)",
          marginBottom: "1rem",
          lineHeight: 1.6
        }}>
          <strong style={{ color: "var(--amber)" }}>Where to start: </strong>
          {priorityReason}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {(plan || [])
          .sort((a, b) => (a.priority || 0) - (b.priority || 0))
          .map((item, i) => (
            <div key={i} style={{
              padding: "1.25rem",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.06)"
              }}>
                {String(item.priority || i + 1).padStart(2, "0")}
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.65rem",
                flexWrap: "wrap"
              }}>
                <span style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.95rem" }}>
                  {item.skill}
                </span>
                <span className="badge badge-muted" style={{ fontSize: "0.7rem" }}>
                  ~{item.honest_time}
                </span>
              </div>
              <p style={{
                fontSize: "0.83rem",
                color: "var(--muted)",
                marginBottom: "0.75rem",
                lineHeight: 1.6
              }}>
                {item.why_it_matters}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ fontSize: "0.83rem", display: "flex", gap: "0.5rem" }}>
                  <span style={{ flexShrink: 0 }}>📖</span>
                  <span>
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}>Resource: </span>
                    <span style={{ color: "var(--text)" }}>{item.resource}</span>
                  </span>
                </div>
                <div style={{ fontSize: "0.83rem", display: "flex", gap: "0.5rem" }}>
                  <span style={{ flexShrink: 0 }}>🛠️</span>
                  <span>
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}>Build this: </span>
                    <span style={{ color: "var(--text)" }}>{item.proof_of_work}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function RedirectCard({ message, betterRole }) {
  return (
    <div className="panel" style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.4rem" }}>↩️</span>
        <div>
          <div className="eyebrow">Honest Assessment</div>
          <h4 style={{ margin: 0 }}>This Role Is Not the Right Target Yet</h4>
        </div>
      </div>
      <div style={{
        padding: "1.25rem",
        background: "rgba(239,68,68,0.06)",
        border: "1px solid rgba(239,68,68,0.18)",
        borderRadius: 12,
        fontSize: "0.9rem",
        color: "var(--text)",
        lineHeight: 1.7,
        marginBottom: "1rem"
      }}>
        {message}
      </div>
      {betterRole && (
        <div style={{
          padding: "1rem",
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: 10,
          fontSize: "0.88rem"
        }}>
          <span style={{ color: "var(--muted)", fontWeight: 600 }}>Better target right now: </span>
          <span style={{ color: "var(--green)", fontWeight: 700 }}>{betterRole}</span>
        </div>
      )}
    </div>
  );
}

export default function RoadmapTimeline({ roadmap }) {
  if (!roadmap || typeof roadmap !== "object") return null;

  const type = roadmap.type;

  if (type === "apply_now") return <ApplyNowCard message={roadmap.message} />;
  if (type === "sprint") return <SprintPlan plan={roadmap.plan} estimatedTime={roadmap.estimated_total_time} />;
  if (type === "focused") return <FocusedPlan plan={roadmap.plan} estimatedTime={roadmap.estimated_total_time} priorityReason={roadmap.priority_order_reason} />;
  if (type === "redirect") return <RedirectCard message={roadmap.message} betterRole={roadmap.better_target_role} />;

  return null;
}
