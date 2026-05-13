export function LeadsConversionPanel({ conversion, showHeader = true }) {
  return (
    <article className="overview-panel">
      {showHeader ? (
        <header className="overview-panel-header">
          <h2>Conversao do funil</h2>
          <span>Etapa a etapa</span>
        </header>
      ) : null}
      <div className="overview-table-wrapper">
        <table className="overview-table">
          <thead>
            <tr>
              <th scope="col">Etapa</th>
              <th scope="col">Conversao</th>
            </tr>
          </thead>
          <tbody>
            {conversion.map((item, index) => (
              <tr key={`conv-${index}`}>
                <td>{item.etapaDe} -&gt; {item.etapaPara}</td>
                <td>{Number(item.conversaoPercentual ?? 0).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
