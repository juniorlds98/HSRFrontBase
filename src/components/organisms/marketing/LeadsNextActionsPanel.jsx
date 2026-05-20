export function LeadsNextActionsPanel({ items, formatDateTime, isOverdue, showHeader = true }) {
  return (
    <article className="overview-panel">
      {showHeader ? (
        <header className="overview-panel-header">
          <h2>Proximas acoes</h2>
          <span>Prioridade comercial</span>
        </header>
      ) : null}

      <div className="overview-table-wrapper">
        <table className="overview-table">
          <thead>
            <tr>
              <th scope="col">Lead</th>
              <th scope="col">Proxima acao</th>
              <th scope="col">Data</th>
              <th scope="col">Responsavel</th>
              <th scope="col">SLA</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`action-${item.pacienteId}`}>
                <td>{item.nome}</td>
                <td>{item.proximaAcao}</td>
                <td>{formatDateTime(item.proximaAcaoDataHora)}</td>
                <td>{item.responsavel ?? "-"}</td>
                <td>
                  <span className={isOverdue(item) ? "lead-sla-overdue" : "lead-sla-ok"}>
                    {isOverdue(item) ? "Atrasado" : "No prazo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

