export function ConsentimentosTable({ consentimentos }) {
  if (!consentimentos.length) return <p className="loading">Nenhum consentimento encontrado.</p>;

  return (
    <div className="consentimentos-table">
      {consentimentos.map((c) => (
        <article key={c.id} className="consentimentos-row">
          <div className="consentimentos-main-col">
            <strong>{c.pacienteId}</strong>
            <span>{c.canal}</span>
          </div>
          <div className="consentimentos-col"><span>Finalidade</span><strong>{c.finalidade}</strong></div>
          <div className="consentimentos-col"><span>Concedido</span><strong>{c.concedido}</strong></div>
          <div className="consentimentos-col"><span>Origem</span><strong>{c.origemAtendimento}</strong></div>
          <div className="consentimentos-col"><span>Data</span><strong>{c.dataConsentimento}</strong></div>
        </article>
      ))}
    </div>
  );
}
