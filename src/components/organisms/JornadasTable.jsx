export function JornadasTable({ jornadas }) {
  if (!jornadas.length) return <p className="loading">Nenhuma jornada encontrada.</p>;

  return (
    <div className="jornadas-table">
      {jornadas.map((j) => (
        <article key={j.id} className="jornadas-row">
          <div className="jornadas-main-col">
            <strong>{j.paciente}</strong>
            <span>Etapa: {j.etapa}</span>
          </div>
          <div className="jornadas-col"><span>Inicio</span><strong>{j.dataInicio}</strong></div>
          <div className="jornadas-col"><span>Fim</span><strong>{j.dataFim}</strong></div>
        </article>
      ))}
    </div>
  );
}
