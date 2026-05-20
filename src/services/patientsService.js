import { httpClient } from "./httpClient";

export async function fetchPatients() {
  const { data } = await httpClient.get("/api/v1/pacientes");
  return Array.isArray(data) ? data : [];
}

export async function createPatient(payload) {
  const { data } = await httpClient.post("/api/v1/pacientes", payload);
  return data;
}

export async function deactivatePatient(patientId) {
  const { data } = await httpClient.patch(`/api/v1/pacientes/${patientId}/desativar`);
  return data;
}

export function buildPatientPayload(form) {
  return {
    nome: form.nome,
    cpf: form.cpf,
    email: form.email,
    dataNascimento: form.dataNascimento,
    sexo: form.sexo,
    telefone: form.telefone,
    alturaCm: Number(form.alturaCm),
    pesoKg: Number(form.pesoKg),
    enderecos: [],
    ativo: true,
  };
}

export function formatCpf(value) {
  const digits = String(value).replace(/\D/g, "").slice(0, 11);
  if (digits.length < 11) return digits;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function computeAge(dateIso) {
  if (!dateIso) return "-";
  const birth = new Date(dateIso);
  if (Number.isNaN(birth.getTime())) return "-";

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const birthdayPassed =
    now.getMonth() > birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());

  if (!birthdayPassed) {
    age -= 1;
  }

  return age;
}

