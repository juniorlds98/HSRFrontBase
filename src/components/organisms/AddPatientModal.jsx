import supportIllustration from "../../assets/images/icone fundo transparente.png";

export function AddPatientModal({ form, onChange, onSubmit, onClose, isSubmitting, error }) {
  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="patient-modal-title">
      <div className="patient-modal-card">
        <button className="overlay-close" type="button" onClick={onClose}>
          x
        </button>

        <h3 id="patient-modal-title">Adicione um paciente</h3>

        <div className="patient-hero">
          <img src={supportIllustration} alt="Paciente" />
        </div>

        <label htmlFor="patient-email" className="overlay-label">
          Email
        </label>
        <input
          id="patient-email"
          type="email"
          placeholder="memberemail@gmail.com"
          className="patient-input"
          value={form.email}
          onChange={(event) => onChange("email", event.target.value)}
        />

        <div className="patient-form-grid">
          <input
            type="text"
            className="patient-input"
            placeholder="Nome completo"
            value={form.nome}
            onChange={(event) => onChange("nome", event.target.value)}
          />
          <select className="patient-input" value={form.sexo} onChange={(event) => onChange("sexo", event.target.value)}>
            <option value="FEMININO">Feminino</option>
            <option value="MASCULINO">Masculino</option>
            <option value="OUTRO">Outro</option>
          </select>
          <input
            type="text"
            className="patient-input"
            placeholder="CPF (somente numeros)"
            value={form.cpf}
            onChange={(event) => onChange("cpf", event.target.value)}
          />
          <input
            type="text"
            className="patient-input"
            placeholder="Telefone"
            value={form.telefone}
            onChange={(event) => onChange("telefone", event.target.value)}
          />
          <input
            type="date"
            className="patient-input"
            value={form.dataNascimento}
            onChange={(event) => onChange("dataNascimento", event.target.value)}
          />
          <input
            type="number"
            className="patient-input"
            placeholder="Altura cm"
            value={form.alturaCm}
            onChange={(event) => onChange("alturaCm", event.target.value)}
          />
          <input
            type="number"
            className="patient-input"
            placeholder="Peso kg"
            value={form.pesoKg}
            onChange={(event) => onChange("pesoKg", event.target.value)}
          />
        </div>

        <button type="button" className="patient-link-button">
          + Formulario conectado a API
        </button>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="overlay-footer">
          <span />
          <button type="button" className="submit-button" disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? "Salvando..." : "Aprovar"}
          </button>
        </div>
      </div>
    </div>
  );
}
