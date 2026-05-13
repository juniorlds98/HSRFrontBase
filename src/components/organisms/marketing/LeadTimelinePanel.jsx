export function LeadTimelinePanel({ lead, formatDateTime, onOpenPatient, onOpenWhatsapp, onClose }) {
  if (!lead) {
    return null;
  }

  return (
    <div className="overlay-backdrop" role="presentation" onClick={onClose}>
      <article className="lead-timeline-modal" role="dialog" aria-modal="true" aria-label={`Timeline do lead ${lead.nome}`} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="overlay-close" onClick={onClose} aria-label="Fechar timeline">
          x
        </button>

        <header className="overview-panel-header">
          <h2>Timeline do lead: {lead.nome}</h2>
          <span>{lead.responsavel ?? "Sem responsavel"}</span>
        </header>

        <div className="lead-detail-actions">
          <button type="button" className="lead-inline-button" onClick={() => onOpenPatient(lead)}>
            Abrir paciente
          </button>
          <button type="button" className="lead-inline-button" onClick={() => onOpenWhatsapp(lead)}>
            Abrir WhatsApp
          </button>
        </div>

        <ul className="lead-timeline-list">
          {(lead.timeline ?? []).map((event, index) => (
            <li key={`timeline-${index}`}>
              <time>{formatDateTime(event.dataHora)}</time>
              <strong>{event.tipo}</strong>
              <p>{event.descricao}</p>
              <small>{event.detalhe}</small>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
