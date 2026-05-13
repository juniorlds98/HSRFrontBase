const RISCOS = ['BAIXO', 'MEDIO', 'ALTO', 'CRITICO'];

export function AddCirurgiaModal({ form, references, onChange, onSubmit, onClose, isSubmitting, error }) {
  const { pacientes = [], medicos = [], procedimentos = [], gravidades = [], status = [] } = references;

  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-cirurgia-title">
      <div className="overlay-card">
        <h2 id="add-cirurgia-title">Registrar Cirurgia</h2>

        <div className="overlay-field">
          <label htmlFor="c-paciente">Paciente *</label>
          <select id="c-paciente" className="patient-input" value={form.pacienteId} onChange={(e) => onChange('pacienteId', e.target.value)}>
            <option value="">Selecione</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome ?? `Paciente #${p.id}`}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="c-medico">Medico *</label>
          <select id="c-medico" className="patient-input" value={form.medicoId} onChange={(e) => onChange('medicoId', e.target.value)}>
            <option value="">Selecione</option>
            {medicos.map((m) => <option key={m.id} value={m.id}>{m.nome ?? `Medico #${m.id}`}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="c-procedimento">Procedimento *</label>
          <select id="c-procedimento" className="patient-input" value={form.procedimentoId} onChange={(e) => onChange('procedimentoId', e.target.value)}>
            <option value="">Selecione</option>
            {procedimentos.map((p) => <option key={p.id} value={p.id}>{p.nomeProcedimento ?? p.nome ?? `Procedimento #${p.id}`}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="c-gravidade">Gravidade</label>
          <select id="c-gravidade" className="patient-input" value={form.gravidadeId} onChange={(e) => onChange('gravidadeId', e.target.value)}>
            <option value="">Nenhuma</option>
            {gravidades.map((g) => <option key={g.id} value={g.id}>{g.nome ?? `Gravidade #${g.id}`}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="c-status">Status *</label>
          <select id="c-status" className="patient-input" value={form.statusId} onChange={(e) => onChange('statusId', e.target.value)}>
            <option value="">Selecione</option>
            {status.map((s) => <option key={s.id} value={s.id}>{s.nome ?? `Status #${s.id}`}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="c-risco">Risco *</label>
          <select id="c-risco" className="patient-input" value={form.risco} onChange={(e) => onChange('risco', e.target.value)}>
            {RISCOS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="c-sala">Sala *</label>
          <input id="c-sala" className="patient-input" type="text" value={form.sala} onChange={(e) => onChange('sala', e.target.value)} />
        </div>

        <div className="overlay-field">
          <label htmlFor="c-data-agendada">Data Agendada *</label>
          <input id="c-data-agendada" className="patient-input" type="datetime-local" value={form.dataAgendada} onChange={(e) => onChange('dataAgendada', e.target.value)} />
        </div>

        <div className="overlay-field">
          <label htmlFor="c-data-realizada">Data Realizada</label>
          <input id="c-data-realizada" className="patient-input" type="datetime-local" value={form.dataRealizada} onChange={(e) => onChange('dataRealizada', e.target.value)} />
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
