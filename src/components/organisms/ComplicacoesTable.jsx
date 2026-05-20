export function ComplicacoesTable({ complicacoes }) {
  if (!complicacoes.length) return <p className="loading">Nenhuma complicacao encontrada.</p>;

  return (
    <div className="complicacoes-table">
      {complicacoes.map((c) => (
        <article key={c.id} className="complicacoes-row">
          <div className="complicacoes-main-col">
            <strong>{c.descricao}</strong>
            <span>Cirurgia #{c.cirurgiaId}</span>
          </div>
          <div className="complicacoes-col"><span>Paciente</span><strong>{c.paciente}</strong></div>
          <div className="complicacoes-col"><span>Procedimento</span><strong>{c.procedimento}</strong></div>
        </article>
      ))}
    </div>
  );
}

