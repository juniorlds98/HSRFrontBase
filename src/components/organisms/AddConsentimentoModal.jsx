const CANAIS = ['EMAIL', 'SMS', 'WHATSAPP', 'TELEFONE'];
const FINALIDADES = ['MARKETING', 'LEMBRETE_CONSULTA', 'RESULTADO_EXAME', 'COBRANCA'];

export function AddConsentimentoModal({ form, references, onChange, onSubmit, onClose, isSubmitting, error }) {
  const { pacientes = [] } = references;

  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-cons-title">
      <div className="overlay-card">
        <h2 id="add-cons-title">Registrar Consentimento</h2>

        <div className="overlay-field">
          <label htmlFor="cs-paciente">Paciente *</label>
          <select id="cs-paciente" className="patient-input" value={form.pacienteId} onChange={(e) => onChange('pacienteId', e.target.value)}>
            <option value="">Selecione</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome ?? `Paciente #${p.id}`}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="cs-canal">Canal *</label>
          <select id="cs-canal" className="patient-input" value={form.canal} onChange={(e) => onChange('canal', e.target.value)}>
            {CANAIS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="cs-finalidade">Finalidade *</label>
          <select id="cs-finalidade" className="patient-input" value={form.finalidade} onChange={(e) => onChange('finalidade', e.target.value)}>
            {FINALIDADES.map((f) => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="cs-concedido">Concedido *</label>
          <select id="cs-concedido" className="patient-input" value={form.concedido} onChange={(e) => onChange('concedido', e.target.value)}>
            <option value="true">Sim</option>
            <option value="false">Nao</option>
          </select>
        </div>

        <div className="overlay-field overlay-field--wide">
          <label htmlFor="cs-origem">Origem do Atendimento *</label>
          <input id="cs-origem" className="patient-input" type="text" value={form.origemAtendimento} onChange={(e) => onChange('origemAtendimento', e.target.value)} />
        </div>

        <div className="overlay-field">
          <label htmlFor="cs-data">Data do Consentimento *</label>
          <input id="cs-data" className="patient-input" type="datetime-local" value={form.dataConsentimento} onChange={(e) => onChange('dataConsentimento', e.target.value)} />
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
