import { toDateKey } from "../services/schedulingService";

function formatHour(dateIso) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function mapAgendamentoToEvent(agendamento) {
  const dateKey = toDateKey(agendamento.data_hora);
  return {
    id: agendamento.id,
    dateKey,
    title: agendamento?.paciente?.nome ? `Consulta ${agendamento.paciente.nome}` : "Consulta",
    subtitle: agendamento?.etapa?.nome ?? agendamento?.status?.nome ?? "Agendamento",
    time: formatHour(agendamento.data_hora),
  };
}

export function groupEventsByDay(events) {
  return events.reduce((acc, event) => {
    if (!event.dateKey) return acc;
    if (!acc[event.dateKey]) {
      acc[event.dateKey] = [];
    }
    acc[event.dateKey].push(event);
    return acc;
  }, {});
}

