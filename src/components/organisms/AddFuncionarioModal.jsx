export function AddFuncionarioModal({ form, references, onChange, onSubmit, onClose, isSubmitting, error }) {
  const { cargos = [] } = references;

  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-func-title">
      <div className="overlay-card">
        <h2 id="add-func-title">Cadastrar Funcionario</h2>

        <div className="overlay-field overlay-field--wide">
          <label htmlFor="f-nome">Nome completo *</label>
          <input id="f-nome" className="patient-input" type="text" value={form.nome} onChange={(e) => onChange('nome', e.target.value)} />
        </div>

        <div className="overlay-field">
          <label htmlFor="f-cpf">CPF *</label>
          <input id="f-cpf" className="patient-input" type="text" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => onChange('cpf', e.target.value)} />
        </div>

        <div className="overlay-field">
          <label htmlFor="f-cargo">Cargo *</label>
          <select id="f-cargo" className="patient-input" value={form.cargoId} onChange={(e) => onChange('cargoId', e.target.value)}>
            <option value="">Selecione</option>
            {cargos.map((c) => <option key={c.id} value={c.id}>{c.cargo ?? c.nome ?? `Cargo #${c.id}`}</option>)}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="f-ativo">Status</label>
          <select id="f-ativo" className="patient-input" value={form.ativo} onChange={(e) => onChange('ativo', e.target.value)}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
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

