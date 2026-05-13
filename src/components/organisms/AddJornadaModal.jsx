export function AddJornadaModal({ form, references, onChange, onSubmit, onClose, isSubmitting, error }) {
  const { pacientes = [], etapas = [] } = references;

  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-jorn-title">
      <div className="overlay-card">
        <h2 id="add-jorn-title">Registrar Jornada do Paciente</h2>

        <div className="overlay-field">
          <label htmlFor="j-paciente">Paciente *</label>
          <select id="j-paciente" className="patient-input" value={form.pacienteId} onChange={(e) => onChange('pacienteId', e.target.value)}>
            <option value="">Selecione</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome ?? `Paciente #${p.id}`}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="j-etapa">Etapa *</label>
          <select id="j-etapa" className="patient-input" value={form.etapaId} onChange={(e) => onChange('etapaId', e.target.value)}>
            <option value="">Selecione</option>
            {etapas.map((e) => <option key={e.id} value={e.id}>{e.nome ?? `Etapa #${e.id}`}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="j-inicio">Data de Inicio *</label>
          <input id="j-inicio" className="patient-input" type="datetime-local" value={form.dataInicio} onChange={(e) => onChange('dataInicio', e.target.value)} />
        </div>

        <div className="overlay-field">
          <label htmlFor="j-fim">Data de Fim</label>
          <input id="j-fim" className="patient-input" type="datetime-local" value={form.dataFim} onChange={(e) => onChange('dataFim', e.target.value)} />
        </div>

        {error && <p className="overlay-error">{error}</p>}

        <div className="overlay-actions">
          <button type="button" className="submit-secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
          <button type="button" className="submit-button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
