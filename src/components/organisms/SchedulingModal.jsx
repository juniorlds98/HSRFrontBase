export function SchedulingModal({
  form,
  references,
  onChange,
  onSubmit,
  onClose,
  isSubmitting,
  error,
}) {
  const hasReferences =
    references.pacientes.length > 0 &&
    references.medicos.length > 0 &&
    references.etapas.length > 0 &&
    references.status.length > 0;

  function setNowDateTime() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    onChange("dataHora", local.toISOString().slice(0, 16));
  }

  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
      <div className="overlay-card">
        <button className="overlay-close" type="button" onClick={onClose}>
          x
        </button>

        <h3 id="event-modal-title">Novo agendamento</h3>

        <p className="overlay-help">Preencha os campos abaixo para criar um agendamento no sistema.</p>

        <div className="overlay-form-grid">
          <label className="overlay-field">
            <span className="overlay-label">Paciente</span>
            <select className="patient-input" value={form.pacienteId} onChange={(event) => onChange("pacienteId", event.target.value)}>
              <option value="">Selecione um paciente</option>
              {references.pacientes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="overlay-field">
            <span className="overlay-label">Medico responsavel</span>
            <select className="patient-input" value={form.medicoId} onChange={(event) => onChange("medicoId", event.target.value)}>
              <option value="">Selecione um medico</option>
              {references.medicos.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome ?? `Medico ${item.id}`}
                </option>
              ))}
            </select>
          </label>

          <label className="overlay-field">
            <span className="overlay-label">Etapa do atendimento</span>
            <select className="patient-input" value={form.etapaId} onChange={(event) => onChange("etapaId", event.target.value)}>
              <option value="">Selecione a etapa</option>
              {references.etapas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="overlay-field">
            <span className="overlay-label">Status do agendamento</span>
            <select className="patient-input" value={form.statusId} onChange={(event) => onChange("statusId", event.target.value)}>
              <option value="">Selecione o status</option>
              {references.status.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="overlay-field overlay-field-wide">
            <span className="overlay-label">Data e hora</span>
            <div className="overlay-inline-actions">
              <input
                type="datetime-local"
                className="patient-input"
                value={form.dataHora}
                onChange={(event) => onChange("dataHora", event.target.value)}
              />
              <button type="button" className="submit-secondary" onClick={setNowDateTime}>
                Agora
              </button>
            </div>
          </label>
        </div>

        {!hasReferences ? (
          <p className="form-error">Cadastre pacientes, medicos, etapas e status para liberar o agendamento.</p>
        ) : null}

        <div className="overlay-footer">
          <button type="button" className="submit-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="submit-button" disabled={isSubmitting || !hasReferences} onClick={onSubmit}>
            {isSubmitting ? "Salvando..." : "Adicionar evento"}
          </button>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
      </div>
    </div>
  );
}

