export function InternacoesTable({ internacoes }) {
  if (!internacoes.length) return <p className="loading">Nenhuma internacao encontrada.</p>;

  return (
    <div className="internacoes-table">
      {internacoes.map((i) => (
        <article key={i.id} className="internacoes-row">
          <div className="internacoes-main-col">
            <strong>{i.paciente}</strong>
            <span>Leito: {i.leito}</span>
          </div>
          <div className="internacoes-col"><span>Status</span><strong>{i.status}</strong></div>
          <div className="internacoes-col"><span>Motivo</span><strong>{i.motivo}</strong></div>
          <div className="internacoes-col"><span>Entrada</span><strong>{i.dataEntrada}</strong></div>
          <div className="internacoes-col"><span>Saida</span><strong>{i.dataSaida}</strong></div>
        </article>
      ))}
    </div>
  );
}
