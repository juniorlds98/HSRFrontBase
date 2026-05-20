export function FinancePayrollPanel({ rows, formatCurrency }) {
  return (
    <article className="overview-panel">
      <header className="overview-panel-header">
        <h2>Folha salarial estimada por funcionario ativo</h2>
        <span>{rows.length} colaboradores</span>
      </header>

      {rows.length === 0 ? (
        <p className="loading">Nenhum funcionario ativo encontrado.</p>
      ) : (
        <div className="overview-table-wrapper">
          <table className="overview-table">
            <thead>
              <tr>
                <th scope="col">Funcionario</th>
                <th scope="col">Cargo</th>
                <th scope="col">Departamento</th>
                <th scope="col">Salario est.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => (
                <tr key={`${item?.funcionarioId ?? "f"}-${index}`}>
                  <td>{item?.funcionario ?? "-"}</td>
                  <td>{item?.cargo ?? "-"}</td>
                  <td>{item?.departamento ?? "-"}</td>
                  <td>{formatCurrency(item?.salarioEstimado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

