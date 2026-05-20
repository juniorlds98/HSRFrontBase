function CaseRow({ item }) {
  return (
    <article className="cases-row">
      <div className="cases-main-col">
        <strong>{item.title}</strong>
        <span>{item.description}</span>
      </div>

      <div className="cases-col">
        <span>Paciente</span>
        <strong>{item.patient}</strong>
      </div>

      <div className="cases-col">
        <span>Medico</span>
        <strong>{item.doctor}</strong>
      </div>

      <div className="cases-col">
        <span>Categoria</span>
        <strong>{item.category}</strong>
      </div>

      <div className="cases-col">
        <span>Gravidade</span>
        <strong>{item.severity}</strong>
      </div>

      <div className="cases-col">
        <span>Status</span>
        <strong>{item.status}</strong>
      </div>

      <div className="cases-col">
        <span>Correlacoes</span>
        <strong>{item.links}</strong>
      </div>

      <div className="cases-col">
        <span>Ocorrido em</span>
        <strong>{item.occurredAt}</strong>
      </div>
    </article>
  );
}

export function CasesTable({ cases }) {
  if (!cases.length) {
    return <p className="loading">Nenhum caso registrado.</p>;
  }

  return (
    <section className="cases-table" id="casos">
      {cases.map((item) => (
        <CaseRow key={item.id ?? `${item.title}-${item.occurredAt}`} item={item} />
      ))}
    </section>
  );
}

