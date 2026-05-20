export function MedicosTable({ medicos }) {
  if (!medicos.length) {
    return <p className="loading">Nenhum medico encontrado.</p>;
  }

  return (
    <div className="medicos-table">
      {medicos.map((m) => (
        <article key={m.id} className="medicos-row">
          <div className="medicos-main-col">
            <strong>{m.nome}</strong>
            <span>CPF: {m.cpf}</span>
          </div>
          <div className="medicos-col">
            <span>CRM</span>
            <strong>{m.crmDisplay}</strong>
          </div>
          <div className="medicos-col">
            <span>Cargo</span>
            <strong>{m.cargo}</strong>
          </div>
          <div className="medicos-col">
            <span>Departamento</span>
            <strong>{m.departamento}</strong>
          </div>
          <div className="medicos-col">
            <span>Status</span>
            <strong>{m.ativo}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}

