export function LeadsKanbanPanel({ kanban, onSelectLead, showHeader = true }) {
  return (
    <article className="overview-panel">
      {showHeader ? (
        <header className="overview-panel-header">
          <h2>Kanban comercial</h2>
          <span>Visao por etapa</span>
        </header>
      ) : null}
      <div className="lead-kanban-grid">
        {Object.entries(kanban).map(([column, items]) => (
          <section key={column} className="lead-kanban-column">
            <h3>{column}</h3>
            <div className="lead-kanban-list">
              {(items ?? []).map((item) => (
                <button key={`kanban-${column}-${item.pacienteId}`} type="button" className="lead-kanban-card" onClick={() => onSelectLead(item)}>
                  <strong>{item.nome}</strong>
                  <span>Score {item.score ?? 0}</span>
                  <small>{item.proximaAcao ?? "Sem acao"}</small>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

