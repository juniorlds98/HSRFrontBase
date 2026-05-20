export function AddInternacaoModal({ form, references, onChange, onSubmit, onClose, isSubmitting, error }) {
  const { pacientes = [], status = [] } = references;

  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-intern-title">
      <div className="overlay-card">
        <h2 id="add-intern-title">Registrar Internacao</h2>

        <div className="overlay-field">
          <label htmlFor="i-paciente">Paciente *</label>
          <select id="i-paciente" className="patient-input" value={form.pacienteId} onChange={(e) => onChange('pacienteId', e.target.value)}>
            <option value="">Selecione</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome ?? `Paciente #${p.id}`}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="i-status">Status *</label>
          <select id="i-status" className="patient-input" value={form.statusId} onChange={(e) => onChange('statusId', e.target.value)}>
            <option value="">Selecione</option>
            {status.map((s) => <option key={s.id} value={s.id}>{s.nome ?? `Status #${s.id}`}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="i-leito">Leito *</label>
          <input id="i-leito" className="patient-input" type="text" value={form.leito} onChange={(e) => onChange('leito', e.target.value)} />
        </div>

        <div className="overlay-field overlay-field--wide">
          <label htmlFor="i-motivo">Motivo *</label>
          <input id="i-motivo" className="patient-input" type="text" value={form.motivo} onChange={(e) => onChange('motivo', e.target.value)} />
        </div>

        <div className="overlay-field">
          <label htmlFor="i-entrada">Data de Entrada *</label>
          <input id="i-entrada" className="patient-input" type="datetime-local" value={form.dataEntrada} onChange={(e) => onChange('dataEntrada', e.target.value)} />
        </div>

        <div className="overlay-field">
          <label htmlFor="i-saida">Data de Saida</label>
          <input id="i-saida" className="patient-input" type="datetime-local" value={form.dataSaida} onChange={(e) => onChange('dataSaida', e.target.value)} />
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

