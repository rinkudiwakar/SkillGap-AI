import { useEffect, useRef } from "react";

const CIRCUMFERENCE = 2 * Math.PI * 70; // r=70

function gaugeColor(score) {
  if (score >= 85) return "#10B981";
  if (score >= 70) return "#6366F1";
  if (score >= 55) return "#F59E0B";
  if (score >= 40) return "#F97316";
  return "#EF4444";
}

export default function ScoreGauge({ score = 0, size = 180, animate = true }) {
  const fillRef = useRef(null);
  const numRef = useRef(null);
  const r = 70;
  const cx = 90;
  const circ = 2 * Math.PI * r;
  const color = gaugeColor(score);

  useEffect(() => {
    if (!animate) return;
    const fill = fillRef.current;
    const num = numRef.current;
    if (!fill || !num) return;

    // Start hidden
    fill.style.strokeDashoffset = circ;
    num.textContent = "0%";

    const start = performance.now();
    const dur = 1500;

    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const val = Math.round(ease * score);
      fill.style.strokeDashoffset = circ - (circ * ease * score) / 100;
      num.textContent = val + "%";
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [score]);

  return (
    <div className="gauge-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 180 180" style={{ transform: "rotate(-90deg)" }}>
        <circle className="gauge-track" cx={cx} cy={cx} r={r} strokeWidth="12" />
        <circle
          ref={fillRef}
          className="gauge-fill"
          cx={cx}
          cy={cx}
          r={r}
          strokeWidth="12"
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={circ}
        />
      </svg>
      <div className="gauge-center">
        <span ref={numRef} className="gauge-score" style={{ color, fontFamily: "var(--font-display)" }}>{score}%</span>
        <span className="gauge-label" style={{ fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.65rem", opacity: 0.6 }}>Hiring<br />Probability</span>
      </div>
    </div>
  );
}
