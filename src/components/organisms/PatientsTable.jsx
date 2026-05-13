import { useState } from "react";

function PatientRow({ patient, highlighted, onOpenConversation, onDeactivate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <article className={`patients-row ${highlighted ? "patients-row-highlight" : ""}`}>
      <div className="patients-name-block">
        <div className="patient-avatar" aria-hidden="true">
          {patient.name[0]}
        </div>
        <div>
          <strong>{patient.name}</strong>
          <span>{patient.email}</span>
        </div>
      </div>

      <div className="patients-col">
        <span>Genero</span>
        <strong>{patient.gender}</strong>
      </div>
      <div className="patients-col">
        <span>Aniversario</span>
        <strong>{patient.birthday}</strong>
      </div>
      <div className="patients-col">
        <span>Idade completa</span>
        <strong>{patient.age}</strong>
      </div>
      <div className="patients-col">
        <span>Telefone</span>
        <strong>{patient.telefone}</strong>
      </div>

      <span className="patients-level">{patient.cpf}</span>

      <div className="patients-more-wrap">
        <button
          type="button"
          className="patients-more"
          aria-label="Mais opcoes"
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          ⋮
        </button>

        {isMenuOpen ? (
          <div className="patients-more-menu" role="menu">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenConversation?.(patient);
              }}
            >
              Ir para conversa
            </button>
            <button
              type="button"
              disabled={!patient.active}
              onClick={() => {
                setIsMenuOpen(false);
                onDeactivate?.(patient);
              }}
            >
              {patient.active ? "Desativar paciente" : "Paciente desativado"}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function PatientsTable({ patients, highlightPatientId = null, onOpenConversation, onDeactivate }) {
  return (
    <section className="patients-table" id="pacientes">
      {patients.map((patient) => (
        <PatientRow
          key={patient.id ?? patient.email}
          patient={patient}
          highlighted={highlightPatientId != null && patient.id === highlightPatientId}
          onOpenConversation={onOpenConversation}
          onDeactivate={onDeactivate}
        />
      ))}
    </section>
  );
}
