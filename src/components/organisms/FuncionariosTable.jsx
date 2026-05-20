export function FuncionariosTable({ funcionarios }) {
  if (!funcionarios.length) return <p className="loading">Nenhum funcionario encontrado.</p>;

  return (
    <div className="funcionarios-table">
      {funcionarios.map((f) => (
        <article key={f.id} className="funcionarios-row">
          <div className="funcionarios-main-col">
            <strong>{f.nome}</strong>
            <span>CPF: {f.cpf}</span>
          </div>
          <div className="funcionarios-col"><span>Cargo</span><strong>{f.cargo}</strong></div>
          <div className="funcionarios-col"><span>Departamento</span><strong>{f.departamento}</strong></div>
          <div className="funcionarios-col"><span>Status</span><strong>{f.ativo}</strong></div>
        </article>
      ))}
    </div>
  );
}

