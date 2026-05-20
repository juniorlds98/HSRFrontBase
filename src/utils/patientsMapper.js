import { computeAge } from "../services/patientsService";

function formatDate(dateIso) {
  if (!dateIso) return "-";
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function genderLabel(gender) {
  if (!gender) return "-";
  const normalized = String(gender).toUpperCase();
  if (normalized === "MASCULINO") return "Masculino";
  if (normalized === "FEMININO") return "Feminino";
  return "Outro";
}

export function mapPatientToRow(patient) {
  return {
    id: patient.id,
    name: patient.nome ?? "Sem nome",
    email: patient.email ?? "-",
    gender: genderLabel(patient.sexo),
    birthday: formatDate(patient.dataNascimento),
    age: computeAge(patient.dataNascimento),
    telefone: patient.telefone ?? "-",
    cpf: patient.cpf ?? "-",
    active: patient.ativo !== false,
  };
}

