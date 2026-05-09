import { transformRoadmap } from "../../lib/transform";

const STEPS = [
  {
    label: "30 Days",
    key: "day30",
    icon: "🌱",
    accent: "var(--green)",
    accentBg: "rgba(16,185,129,0.08)",
    accentBorder: "rgba(16,185,129,0.25)",
    tagColor: "var(--green)",
    tagBg: "rgba(16,185,129,0.12)",
    description: "Short-term goals",
  },
  {
    label: "60 Days",
    key: "day60",
    icon: "⚡",
    accent: "var(--amber)",
    accentBg: "rgba(245,158,11,0.08)",
    accentBorder: "rgba(245,158,11,0.22)",
    tagColor: "var(--amber)",
    tagBg: "rgba(245,158,11,0.1)",
    description: "Mid-term milestones",
  },
  {
    label: "90 Days",
    key: "day90",
    icon: "🚀",
    accent: "var(--accent)",
    accentBg: "rgba(99,102,241,0.08)",
    accentBorder: "rgba(99,102,241,0.25)",
    tagColor: "var(--accent)",
    tagBg: "rgba(99,102,241,0.1)",
    description: "Long-term achievement",
  },
];

function splitActionItems(text) {
  if (!text) return [];
  const cleaned = String(text)
    .replace(/\s+/g, " ")
    .replace(/^["']|["']$/g, "")
    .trim();

  if (!cleaned) return [];

  const numbered = cleaned
    .split(/\s*(?:\d+\.|[-*])\s+/)
    .map(item => item.trim())
    .filter(Boolean);

  if (numbered.length > 1) return numbered;

  return cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(item => item.trim())
    .filter(Boolean);
}

function RoadmapText({ text, accent }) {
  const items = splitActionItems(text);

  if (items.length <= 1) return <p style={{ margin: 0 }}>{text}</p>;

  return (
    <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: "0.55rem" }}>
      {items.map((item, index) => (
        <li key={`${index}-${item.slice(0, 18)}`} style={{ paddingLeft: "0.15rem" }}>
          <span style={{ color: accent, fontWeight: 700 }}>Action {index + 1}: </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * RoadmapTimeline — displays the 30/60/90-day career roadmap as a vertical stepper.
 * Props:
 *   roadmap: object|string   — from API result (handles both key formats)
 */
export default function RoadmapTimeline({ roadmap }) {
  const { day30, day60, day90, hasContent } = transformRoadmap(roadmap);
  const values = { day30, day60, day90 };

  return (
    <div className="panel" style={{ marginBottom: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "1.4rem" }}>🗺️</span>
        <div>
          <div className="eyebrow">Career Roadmap</div>
          <h4 style={{ margin: 0 }}>Your 90-Day Action Plan</h4>
        </div>
      </div>

      {!hasContent ? (
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
          No roadmap was generated for this analysis. Run a fresh analysis with a job description to get a personalised action plan.
        </p>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Vertical connector line */}
          <div
            style={{
              position: "absolute",
              left: 19,
              top: 32,
              bottom: 32,
              width: 2,
              background:
                "linear-gradient(to bottom, rgba(16,185,129,0.4), rgba(245,158,11,0.4), rgba(99,102,241,0.4))",
              borderRadius: 2,
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {STEPS.map((step, i) => {
              const text = values[step.key];
              if (!text) return null;
              return (
                <div
                  key={step.key}
                  style={{
                    display: "flex",
                    gap: "1.1rem",
                    animation: "fadeSlide 0.4s ease both",
                    animationDelay: `${i * 120}ms`,
                  }}
                >
                  {/* Step icon bubble */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: step.accentBg,
                      border: `2px solid ${step.accentBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      boxShadow: `0 0 16px ${step.accentBorder}`,
                      zIndex: 1,
                      position: "relative",
                    }}
                  >
                    {step.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingTop: "0.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        marginBottom: "0.6rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          padding: "0.2rem 0.65rem",
                          borderRadius: "999px",
                          background: step.tagBg,
                          color: step.tagColor,
                          border: `1px solid ${step.accentBorder}`,
                        }}
                      >
                        {step.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        {step.description}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: "1rem 1.1rem",
                        background: step.accentBg,
                        border: `1px solid ${step.accentBorder}`,
                        borderRadius: 12,
                        fontSize: "0.88rem",
                        color: "var(--text)",
                        lineHeight: 1.75,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <RoadmapText text={text} accent={step.accent} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
