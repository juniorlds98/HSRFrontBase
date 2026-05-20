export function FinanceProcedurePanel({ rows, formatCurrency }) {
  return (
    <article className="overview-panel">
      <header className="overview-panel-header">
        <h2>Producao por tipo de cirurgia</h2>
        <span>{rows.length} tipos</span>
      </header>

      {rows.length === 0 ? (
        <p className="loading">Nenhum registro encontrado.</p>
      ) : (
        <div className="overview-table-wrapper">
          <table className="overview-table">
            <thead>
              <tr>
                <th scope="col">Procedimento</th>
                <th scope="col">Realizadas</th>
                <th scope="col">Agendadas</th>
                <th scope="col">Receita est.</th>
                <th scope="col">Custo est.</th>
                <th scope="col">Margem est.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => (
                <tr key={`${item?.procedimento ?? "proc"}-${index}`}>
                  <td>{item?.procedimento ?? "-"}</td>
                  <td>{item?.realizadas ?? 0}</td>
                  <td>{item?.agendadas ?? 0}</td>
                  <td>{formatCurrency(item?.receitaEstimada)}</td>
                  <td>{formatCurrency(item?.custoEstimado)}</td>
                  <td>{formatCurrency(item?.margemEstimada)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

