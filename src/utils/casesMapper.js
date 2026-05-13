function formatDateTime(dateIso) {
  if (!dateIso) return "-";
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toLabelById(collection, id, fallbackPrefix) {
  if (!id) return "-";
  const found = collection.find((item) => Number(item?.id) === Number(id));
  if (!found) return `#${id}`;

  return found.nome ?? found.titulo ?? `${fallbackPrefix} #${id}`;
}

function severityLabel(value) {
  const normalized = String(value ?? "").toUpperCase();
  if (normalized === "BAIXA") return "Baixa";
  if (normalized === "MEDIA") return "Media";
  if (normalized === "ALTA") return "Alta";
  if (normalized === "CRITICA") return "Critica";
  return "-";
}

function statusLabel(value) {
  const normalized = String(value ?? "").toUpperCase();
  if (normalized === "ABERTO") return "Aberto";
  if (normalized === "EM_ANALISE") return "Em analise";
  if (normalized === "RESOLVIDO") return "Resolvido";
  if (normalized === "CANCELADO") return "Cancelado";
  return "-";
}

export function mapCaseToRow(caseItem, references) {
  const pacientes = references?.pacientes ?? [];
  const medicos = references?.medicos ?? [];

  return {
    id: caseItem?.id,
    title: caseItem?.titulo ?? "Caso sem titulo",
    description: caseItem?.descricao ?? "Sem descricao",
    patient: toLabelById(pacientes, caseItem?.pacienteId, "Paciente"),
    doctor: toLabelById(medicos, caseItem?.medicoId, "Medico"),
    category: caseItem?.categoria ?? "-",
    severity: severityLabel(caseItem?.gravidade),
    status: statusLabel(caseItem?.status),
    occurredAt: formatDateTime(caseItem?.dataOcorrencia),
    links: [
      caseItem?.agendamentoId ? `Ag. #${caseItem.agendamentoId}` : null,
      caseItem?.atendimentoId ? `At. #${caseItem.atendimentoId}` : null,
    ]
      .filter(Boolean)
      .join(" | ") || "-",
  };
}
