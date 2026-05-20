export function AddCaseModal({
  form,
  references,
  onChange,
  onSubmit,
  onClose,
  isSubmitting,
  error,
}) {
  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="case-modal-title">
      <div className="overlay-card">
        <button className="overlay-close" type="button" onClick={onClose}>
          x
        </button>

        <h3 id="case-modal-title">Registrar novo caso</h3>
        <p className="overlay-help">Vincule o caso as entidades do CRM para manter rastreabilidade completa.</p>

        <div className="overlay-form-grid">
          <label className="overlay-field overlay-field-wide">
            <span className="overlay-label">Titulo do caso</span>
            <input
              type="text"
              className="patient-input"
              placeholder="Ex.: Reacao adversa no pos-operatorio"
              value={form.titulo}
              onChange={(event) => onChange("titulo", event.target.value)}
            />
          </label>

          <label className="overlay-field">
            <span className="overlay-label">Paciente</span>
            <select className="patient-input" value={form.pacienteId} onChange={(event) => onChange("pacienteId", event.target.value)}>
              <option value="">Selecione um paciente</option>
              {references.pacientes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome ?? `Paciente #${item.id}`}
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
                  {item.nome ?? `Medico #${item.id}`}
                </option>
              ))}
            </select>
          </label>

          <label className="overlay-field">
            <span className="overlay-label">Agendamento relacionado</span>
            <select
              className="patient-input"
              value={form.agendamentoId}
              onChange={(event) => onChange("agendamentoId", event.target.value)}
            >
              <option value="">Nao vincular</option>
              {references.agendamentos.map((item) => (
                <option key={item.id} value={item.id}>
                  {`Agendamento #${item.id}`}
                </option>
              ))}
            </select>
          </label>

          <label className="overlay-field">
            <span className="overlay-label">Atendimento relacionado</span>
            <select
              className="patient-input"
              value={form.atendimentoId}
              onChange={(event) => onChange("atendimentoId", event.target.value)}
            >
              <option value="">Nao vincular</option>
              {references.atendimentos.map((item) => (
                <option key={item.id} value={item.id}>
                  {`Atendimento #${item.id}`}
                </option>
              ))}
            </select>
          </label>

          <label className="overlay-field">
            <span className="overlay-label">Categoria</span>
            <select className="patient-input" value={form.categoria} onChange={(event) => onChange("categoria", event.target.value)}>
              <option value="EVENTO_ASSISTENCIAL">Evento assistencial</option>
              <option value="PROCESSO">Processo</option>
              <option value="RISCO">Risco</option>
              <option value="ADMINISTRATIVO">Administrativo</option>
            </select>
          </label>

          <label className="overlay-field">
            <span className="overlay-label">Gravidade</span>
            <select className="patient-input" value={form.gravidade} onChange={(event) => onChange("gravidade", event.target.value)}>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
              <option value="CRITICA">Critica</option>
            </select>
          </label>

          <label className="overlay-field">
            <span className="overlay-label">Status</span>
            <select className="patient-input" value={form.status} onChange={(event) => onChange("status", event.target.value)}>
              <option value="ABERTO">Aberto</option>
              <option value="EM_ANALISE">Em analise</option>
              <option value="RESOLVIDO">Resolvido</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </label>

          <label className="overlay-field">
            <span className="overlay-label">Data de ocorrencia</span>
            <input
              type="datetime-local"
              className="patient-input"
              value={form.dataOcorrencia}
              onChange={(event) => onChange("dataOcorrencia", event.target.value)}
            />
          </label>

          <label className="overlay-field overlay-field-wide">
            <span className="overlay-label">Descricao</span>
            <textarea
              className="patient-input case-textarea"
              rows={4}
              placeholder="Descreva o caso e os impactos observados"
              value={form.descricao}
              onChange={(event) => onChange("descricao", event.target.value)}
            />
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="overlay-footer">
          <button type="button" className="submit-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="submit-button" disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? "Salvando..." : "Registrar caso"}
          </button>
        </div>
      </div>
    </div>
  );
}

