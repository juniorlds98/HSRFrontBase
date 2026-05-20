export function ProcedimentosTable({ procedimentos }) {
  if (!procedimentos.length) return <p className="loading">Nenhum procedimento encontrado.</p>;

  return (
    <div className="procedimentos-table">
      {procedimentos.map((p) => (
        <article key={p.id} className="procedimentos-row">
          <div className="procedimentos-main-col">
            <strong>{p.nome}</strong>
          </div>
          <div className="procedimentos-col"><span>Status</span><strong>{p.status}</strong></div>
        </article>
      ))}
    </div>
  );
}

