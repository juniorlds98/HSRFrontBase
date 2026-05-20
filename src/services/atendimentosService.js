import { httpClient } from "./httpClient";

function formatDateTimeForApi(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export async function createAtendimento(payload) {
  const { data } = await httpClient.post("/api/v1/atendimentos", payload);
  return data;
}

export function buildAtendimentoPayload({ pacienteId, medicoId, agendamentoId, etapaId, observacoes }) {
  const now = new Date();

  return {
    paciente: { id: Number(pacienteId) },
    medico: { id: Number(medicoId) },
    agendamento: { id: Number(agendamentoId) },
    etapa: { id: Number(etapaId) },
    dataInicio: formatDateTimeForApi(now),
    observacoes: String(observacoes || "").slice(0, 800),
  };
}

