export function LeadsPortfolioPanel({ leads, formatCurrency, formatDateTime, isOverdue, onTimeline, onOpenPatient, showHeader = true }) {
  return (
    <article className="overview-panel">
      {showHeader ? (
        <header className="overview-panel-header">
          <h2>Carteira de leads</h2>
          <span>{leads.length} registros</span>
        </header>
      ) : null}

      {leads.length === 0 ? (
        <p className="loading">Nenhum lead encontrado.</p>
      ) : (
        <div className="overview-table-wrapper">
          <table className="overview-table">
            <thead>
              <tr>
                <th scope="col">Lead</th>
                <th scope="col">Responsavel</th>
                <th scope="col">Origem</th>
                <th scope="col">Etapa</th>
                <th scope="col">Score</th>
                <th scope="col">Proxima acao</th>
                <th scope="col">Valor ponderado</th>
                <th scope="col">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((item, index) => (
                <tr key={`${item?.pacienteId ?? "lead"}-${index}`}>
                  <td>
                    <strong>{item?.nome ?? "-"}</strong>
                    <div>{item?.email ?? "-"}</div>
                  </td>
                  <td>{item?.responsavel ?? "-"}</td>
                  <td>{item?.origem ?? item?.canal ?? "-"}</td>
                  <td>{item?.etapa ?? "-"}</td>
                  <td>
                    <strong>{item?.score ?? 0}</strong>
                  </td>
                  <td>
                    <div>{item?.proximaAcao ?? "-"}</div>
                    <small className={isOverdue(item) ? "lead-sla-overdue" : ""}>{formatDateTime(item?.proximaAcaoDataHora)}</small>
                  </td>
                  <td>{formatCurrency(item?.valorPonderado)}</td>
                  <td>
                    <div className="lead-row-actions">
                      <button type="button" className="lead-inline-button" onClick={() => onTimeline(item)}>
                        Timeline
                      </button>
                      <button type="button" className="lead-inline-button" onClick={() => onOpenPatient(item)}>
                        Paciente
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
