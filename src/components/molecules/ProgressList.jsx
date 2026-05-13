export function ProgressList({ title, items }) {
  const maxValue = items.reduce((acc, item) => Math.max(acc, item.value), 0) || 1;

  return (
    <section className="panel">
      <header className="panel-header">
        <h3>{title}</h3>
      </header>
      <div className="progress-list">
        {items.length === 0 ? <p className="empty">Sem dados disponiveis.</p> : null}
        {items.map((item) => (
          <div className="progress-row" key={item.label}>
            <div className="progress-row-labels">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${Math.round((item.value / maxValue) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
