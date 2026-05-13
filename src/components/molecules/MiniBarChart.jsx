export function MiniBarChart({ title, points }) {
  const maxValue = points.reduce((acc, point) => Math.max(acc, point.value), 0) || 1;

  return (
    <section className="panel">
      <header className="panel-header">
        <h3>{title}</h3>
      </header>
      <div className="mini-chart">
        {points.length === 0 ? <p className="empty">Sem dados disponiveis.</p> : null}
        {points.map((point) => (
          <div className="mini-bar" key={point.label}>
            <div className="mini-bar-column">
              <span
                className="mini-bar-fill"
                style={{ height: `${Math.max(12, Math.round((point.value / maxValue) * 120))}px` }}
              />
            </div>
            <span className="mini-bar-label">{point.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
