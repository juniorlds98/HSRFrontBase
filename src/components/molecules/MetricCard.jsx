export function MetricCard({ title, value, accent = "neutral" }) {
  return (
    <article className={`metric-card metric-${accent}`}>
      <p className="metric-title">{title}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}

