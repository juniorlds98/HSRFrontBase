export function CirurgiasTable({ cirurgias }) {
  if (!cirurgias.length) {
    return <p className="loading">Nenhuma cirurgia encontrada.</p>;
  }

  return (
    <div className="cirurgias-table">
      {cirurgias.map((c) => (
        <article key={c.id} className="cirurgias-row">
          <div className="cirurgias-main-col">
            <strong>{c.procedimento}</strong>
            <span>Sala: {c.sala}</span>
          </div>
          <div className="cirurgias-col">
            <span>Paciente</span>
            <strong>{c.paciente}</strong>
          </div>
          <div className="cirurgias-col">
            <span>Medico</span>
            <strong>{c.medico}</strong>
          </div>
          <div className="cirurgias-col">
            <span>Risco</span>
            <strong>{c.risco}</strong>
          </div>
          <div className="cirurgias-col">
            <span>Status</span>
            <strong>{c.status}</strong>
          </div>
          <div className="cirurgias-col">
            <span>Agendada</span>
            <strong>{c.dataAgendada}</strong>
          </div>
          <div className="cirurgias-col">
            <span>Realizada</span>
            <strong>{c.dataRealizada}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}
