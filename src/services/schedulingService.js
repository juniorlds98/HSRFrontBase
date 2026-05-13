import { httpClient } from "./httpClient";

export async function fetchAgendamentos() {
  const { data } = await httpClient.get("/api/v1/agendamentos");
  return Array.isArray(data) ? data : [];
}

export async function fetchSchedulingReferences() {
  const [pacientesRes, medicosRes, etapasRes, statusRes] = await Promise.all([
    httpClient.get("/api/v1/pacientes"),
    httpClient.get("/api/v1/medicos"),
    httpClient.get("/api/v1/etapas"),
    httpClient.get("/api/v1/status"),
  ]);

  return {
    pacientes: Array.isArray(pacientesRes.data) ? pacientesRes.data : [],
    medicos: Array.isArray(medicosRes.data) ? medicosRes.data : [],
    etapas: Array.isArray(etapasRes.data) ? etapasRes.data : [],
    status: Array.isArray(statusRes.data) ? statusRes.data : [],
  };
}

export async function createAgendamento(form) {
  const pacienteId = Number(form.pacienteId);
  const medicoId = Number(form.medicoId);
  const etapaId = Number(form.etapaId);
  const statusId = Number(form.statusId);

  if (!Number.isFinite(pacienteId) || pacienteId <= 0) {
    throw new Error("Selecione um paciente valido.");
  }

  if (!Number.isFinite(medicoId) || medicoId <= 0) {
    throw new Error("Selecione um medico valido.");
  }

  if (!Number.isFinite(etapaId) || etapaId <= 0) {
    throw new Error("Selecione uma etapa valida.");
  }

  if (!Number.isFinite(statusId) || statusId <= 0) {
    throw new Error("Selecione um status valido.");
  }

  const normalizedDateTime = normalizeDateTimeForApi(form.dataHora);
  if (!normalizedDateTime) {
    throw new Error("Informe uma data e hora validas.");
  }

  const payload = {
    paciente: { id: pacienteId },
    medico: { id: medicoId },
    etapa: { id: etapaId },
    status: { id: statusId },
    data_hora: normalizedDateTime,
  };

  const { data } = await httpClient.post("/api/v1/agendamentos", payload);
  return data;
}

export function toMonthLabel(date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

export function toDateKey(dateIso) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return "";
  return formatLocalDateKey(date);
}

export function buildMonthCalendar(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayWeekIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let index = 0; index < firstDayWeekIndex; index += 1) {
    cells.push({
      day: null,
      dateKey: `empty-start-${index}`,
      muted: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({
      day,
      dateKey: formatLocalDateKey(date),
      muted: false,
    });
  }

  while (cells.length % 7 !== 0) {
    const endIndex = cells.length;
    cells.push({
      day: null,
      dateKey: `empty-end-${endIndex}`,
      muted: true,
    });
  }

  return cells;
}

export function buildWeekdayCalendar(monthDate) {
  return buildMonthCalendar(monthDate);
}

function normalizeDateTimeForApi(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  const normalized = value.trim();
  if (!normalized) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalized)) {
    return normalized;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
    return `${normalized}:00`;
  }

  return "";
}

function formatLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
