import { httpClient } from "./httpClient";

async function getSafe(endpoint) {
  try {
    const { data } = await httpClient.get(endpoint);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchDashboardData() {
  const [pacientes, cirurgias, atendimentos, agendamentos, status] = await Promise.all([
    getSafe("/api/v1/pacientes"),
    getSafe("/api/v1/cirurgias"),
    getSafe("/api/v1/atendimentos"),
    getSafe("/api/v1/agendamentos"),
    getSafe("/api/v1/status"),
  ]);

  return {
    pacientes,
    cirurgias,
    atendimentos,
    agendamentos,
    status,
  };
}

