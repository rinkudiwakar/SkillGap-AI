import StrengthsCard from "./StrengthsCard";
import WeaknessesCard from "./WeaknessesCard";
import MissingSkillsCard from "./MissingSkillsCard";
import RecommendedRolesCard from "./RecommendedRolesCard";
import RoadmapTimeline from "./RoadmapTimeline";
import ConfidenceAssessment from "./ConfidenceAssessment";
import RewrittenBullets from "./RewrittenBullets";
import { hasLLMAnalysis } from "../../lib/transform";

/**
 * AnalysisInsights — container component for all LLM analysis cards.
 * Receives the full result object and renders appropriate sub-components.
 * Props:
 *   result: object   — full API result from /api/result/{task_id}
 */
export default function AnalysisInsights({ result }) {
  if (!result) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🧠</div>
        <p>No result selected.</p>
      </div>
    );
  }

  const hasContent = hasLLMAnalysis(result);

  return (
    <div style={{ animation: "fadeSlide 0.3s ease" }}>
      {/* Banner if LLM analysis is empty (e.g., API key missing during that run) */}
      {!hasContent && (
        <div
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            background: "rgba(245,158,11,0.07)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
              LLM analysis unavailable for this result
            </div>
            <div style={{ fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.6 }}>
              The AI insights (strengths, weaknesses, roadmap) were not generated — this typically
              means the LLM API was not configured when this analysis was run. Run a new analysis to
              get full insights.
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout on large screens, single on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          gap: "1.25rem",
        }}
      >
        {/* Left column: Strengths + Weaknesses + Missing Skills + Confidence */}
        <div>
          <StrengthsCard strengths={result.strengths || []} />
          <WeaknessesCard weaknesses={result.weaknesses || []} />
          <MissingSkillsCard missing_skills={result.missing_skills || []} />
          <ConfidenceAssessment
            confidence_assessment={result.confidence_assessment || ''}
            hiring_probability={result.hiring_probability || 0}
            gap_count={result.missing_skills?.length || 0}
          />
        </div>

        {/* Right column: Recommended Roles + Roadmap + Rewritten Bullets */}
        <div>
          <RecommendedRolesCard recommended_roles={result.recommended_roles || []} />
          <RoadmapTimeline roadmap={result.roadmap} />
          <RewrittenBullets rewritten_bullets={result.rewritten_bullets || []} />
        </div>
      </div>
    </div>
  );
}
