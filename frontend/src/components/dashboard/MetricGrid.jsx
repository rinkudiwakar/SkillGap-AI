export default function MetricGrid({ items }) {
  return (
    <div className="metric-grid">
      {items.map(([label, value]) => (
        <div key={label} className="score-box">
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
