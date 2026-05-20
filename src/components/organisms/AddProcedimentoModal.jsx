const STATUS_OPTIONS = ['ATIVO', 'INATIVO', 'SUSPENSO'];

export function AddProcedimentoModal({ form, onChange, onSubmit, onClose, isSubmitting, error }) {
  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-proc-title">
      <div className="overlay-card">
        <h2 id="add-proc-title">Cadastrar Procedimento</h2>

        <div className="overlay-field overlay-field--wide">
          <label htmlFor="p-nome">Nome do procedimento *</label>
          <input id="p-nome" className="patient-input" type="text" value={form.nomeProcedimento} onChange={(e) => onChange('nomeProcedimento', e.target.value)} />
        </div>

        <div className="overlay-field">
          <label htmlFor="p-status">Status *</label>
          <select id="p-status" className="patient-input" value={form.status} onChange={(e) => onChange('status', e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {error && <p className="overlay-error">{error}</p>}

        <div className="overlay-actions">
          <button type="button" className="submit-secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
          <button type="button" className="submit-button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

