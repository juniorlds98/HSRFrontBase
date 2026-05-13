import { httpClient } from "./httpClient";

const CASES_ENDPOINT = "/api/v1/casos";
const LOCAL_CASES_KEY = "hsr_cases_local";

const initialLocalCases = [
  {
    id: "local-1",
    titulo: "Queda de pressao no pos-operatorio",
    descricao: "Paciente com hipotensao leve apos cirurgia.",
    pacienteId: 1,
    medicoId: 1,
    agendamentoId: null,
    atendimentoId: null,
    categoria: "EVENTO_ASSISTENCIAL",
    gravidade: "MEDIA",
    status: "ABERTO",
    dataOcorrencia: "2026-05-10T09:20:00",
  },
  {
    id: "local-2",
    titulo: "Atraso na administracao de medicacao",
    descricao: "Medicacao administrada com 30 minutos de atraso.",
    pacienteId: 2,
    medicoId: 2,
    agendamentoId: 5,
    atendimentoId: null,
    categoria: "PROCESSO",
    gravidade: "BAIXA",
    status: "EM_ANALISE",
    dataOcorrencia: "2026-05-11T14:00:00",
  },
];

function toNumberOrNull(value) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function readLocalCases() {
  if (typeof window === "undefined") return [...initialLocalCases];

  const raw = window.localStorage.getItem(LOCAL_CASES_KEY);
  if (!raw) {
    window.localStorage.setItem(LOCAL_CASES_KEY, JSON.stringify(initialLocalCases));
    return [...initialLocalCases];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...initialLocalCases];
  } catch {
    return [...initialLocalCases];
  }
}

function writeLocalCases(cases) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_CASES_KEY, JSON.stringify(cases));
}

export function buildCasePayload(form) {
  return {
    titulo: String(form.titulo ?? "").trim(),
    descricao: String(form.descricao ?? "").trim(),
    pacienteId: toNumberOrNull(form.pacienteId),
    medicoId: toNumberOrNull(form.medicoId),
    agendamentoId: toNumberOrNull(form.agendamentoId),
    atendimentoId: toNumberOrNull(form.atendimentoId),
    categoria: form.categoria,
    gravidade: form.gravidade,
    status: form.status,
    dataOcorrencia: form.dataOcorrencia,
  };
}

export function validateCasePayload(payload) {
  if (!payload.titulo) {
    throw new Error("Informe o titulo do caso.");
  }

  if (!payload.descricao) {
    throw new Error("Informe a descricao do caso.");
  }

  if (!payload.pacienteId) {
    throw new Error("Selecione um paciente relacionado ao caso.");
  }

  if (!payload.dataOcorrencia) {
    throw new Error("Informe a data de ocorrencia.");
  }
}

export async function fetchCases() {
  try {
    const { data } = await httpClient.get(CASES_ENDPOINT);
    if (Array.isArray(data)) {
      return data;
    }
  } catch {
    // Fallback to local data when the API endpoint is not available.
  }

  return readLocalCases();
}

export async function createCase(payload) {
  validateCasePayload(payload);

  try {
    const { data } = await httpClient.post(CASES_ENDPOINT, payload);
    return data;
  } catch {
    const current = readLocalCases();
    const created = {
      ...payload,
      id: `local-${Date.now()}`,
    };
    writeLocalCases([created, ...current]);
    return created;
  }
}

function settledArray(result) {
  if (result.status !== "fulfilled") return [];
  return Array.isArray(result.value.data) ? result.value.data : [];
}

export async function fetchCaseReferences() {
  const [pacientesRes, medicosRes, agendamentosRes, atendimentosRes] = await Promise.allSettled([
    httpClient.get("/api/v1/pacientes"),
    httpClient.get("/api/v1/medicos"),
    httpClient.get("/api/v1/agendamentos"),
    httpClient.get("/api/v1/atendimentos"),
  ]);

  return {
    pacientes: settledArray(pacientesRes),
    medicos: settledArray(medicosRes),
    agendamentos: settledArray(agendamentosRes),
    atendimentos: settledArray(atendimentosRes),
  };
}
