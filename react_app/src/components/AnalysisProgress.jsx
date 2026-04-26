import { useEffect, useState } from "react";

const STEPS = [
  "Resume parsed successfully",
  "Parsing job description…",
  "Generating semantic embeddings…",
  "Computing match score…",
  "Identifying skill gaps…",
  "Rewriting resume bullets…",
  "Finding alternate job titles…",
];

export default function AnalysisProgress({ active }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) { setCurrent(0); return; }
    setCurrent(1);
    const timers = [];
    [1400, 2600, 3800, 5000, 6000, 7000].forEach((delay, i) => {
      timers.push(setTimeout(() => setCurrent(i + 2), delay));
    });
    return () => timers.forEach(clearTimeout);
  }, [active]);

  if (!active && current === 0) return null;

  return (
    <div className="progress-steps" style={{ margin: "1rem 0" }}>
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const running = current === idx;
        return (
          <div key={label} className={`step-row${done ? " done" : running ? " active" : ""}`}>
            <div className="step-icon">
              {done ? "✓" : running ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> : ""}
            </div>
            <span>{label}</span>
          </div>
        );
      })}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
