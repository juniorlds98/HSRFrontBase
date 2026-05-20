const UF_LIST = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export function AddMedicoModal({ form, references, onChange, onSubmit, onClose, isSubmitting, error }) {
  const { cargos = [] } = references;

  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="add-medico-title">
      <div className="overlay-card">
        <h2 id="add-medico-title">Cadastrar Medico</h2>

        <div className="overlay-field overlay-field--wide">
          <label htmlFor="m-nome">Nome completo *</label>
          <input
            id="m-nome"
            className="patient-input"
            type="text"
            value={form.nome}
            onChange={(e) => onChange('nome', e.target.value)}
          />
        </div>

        <div className="overlay-field">
          <label htmlFor="m-cpf">CPF *</label>
          <input
            id="m-cpf"
            className="patient-input"
            type="text"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={(e) => onChange('cpf', e.target.value)}
          />
        </div>

        <div className="overlay-field">
          <label htmlFor="m-cargo">Cargo *</label>
          <select
            id="m-cargo"
            className="patient-input"
            value={form.cargoId}
            onChange={(e) => onChange('cargoId', e.target.value)}
          >
            <option value="">Selecione</option>
            {cargos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cargo ?? c.nome ?? `Cargo #${c.id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="m-ativo">Status</label>
          <select
            id="m-ativo"
            className="patient-input"
            value={form.ativo}
            onChange={(e) => onChange('ativo', e.target.value)}
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        <div className="overlay-field">
          <label htmlFor="m-crm">Numero CRM</label>
          <input
            id="m-crm"
            className="patient-input"
            type="text"
            placeholder="123456"
            value={form.crmNumero}
            onChange={(e) => onChange('crmNumero', e.target.value)}
          />
        </div>

        <div className="overlay-field">
          <label htmlFor="m-uf">UF CRM</label>
          <select
            id="m-uf"
            className="patient-input"
            value={form.crmUf}
            onChange={(e) => onChange('crmUf', e.target.value)}
          >
            {UF_LIST.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>

        {error && <p className="overlay-error">{error}</p>}

        <div className="overlay-actions">
          <button type="button" className="submit-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="button" className="submit-button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

