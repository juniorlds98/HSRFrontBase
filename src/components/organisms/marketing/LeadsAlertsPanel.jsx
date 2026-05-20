export function LeadsAlertsPanel({ alerts, showHeader = true }) {
  return (
    <article className="overview-panel">
      {showHeader ? (
        <header className="overview-panel-header">
          <h2>Alertas automaticos</h2>
          <span>Monitoramento</span>
        </header>
      ) : null}
      {alerts.length === 0 ? (
        <p className="loading">Sem alertas no periodo.</p>
      ) : (
        <ul className="lead-alert-list">
          {alerts.map((item, index) => (
            <li key={`alert-${item.pacienteId}-${index}`} className={item.severidade === "ALTA" ? "alert-high" : ""}>
              <strong>{item.leadNome}</strong>
              <span>{item.mensagem}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

