export function AddComplicacaoModal({ form, references, onChange, onSubmit, onClose, isSubmitting, error }) {
  const { cirurgias = [] } = references;

  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-compl-title">
      <div className="overlay-card">
        <h2 id="add-compl-title">Registrar Complicacao</h2>

        <div className="overlay-field">
          <label htmlFor="co-cirurgia">Cirurgia *</label>
          <select id="co-cirurgia" className="patient-input" value={form.cirurgiaId} onChange={(e) => onChange('cirurgiaId', e.target.value)}>
            <option value="">Selecione</option>
            {cirurgias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.procedimento?.nomeProcedimento ?? c.procedimento?.nome ?? `Cirurgia #${c.id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="overlay-field overlay-field--wide">
          <label htmlFor="co-desc">Descricao *</label>
          <textarea
            id="co-desc"
            className="patient-input case-textarea"
            value={form.descricao}
            onChange={(e) => onChange('descricao', e.target.value)}
          />
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
