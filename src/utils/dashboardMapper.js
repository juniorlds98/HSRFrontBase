function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeLabel(raw, fallback = "Não informado") {
  if (!raw) {
    return fallback;
  }
  return String(raw).trim() || fallback;
}

function groupCount(items, getLabel) {
  const grouped = items.reduce((acc, item) => {
    const label = normalizeLabel(getLabel(item));
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function mapMonthlyAttendances(atendimentos) {
  const grouped = atendimentos.reduce((acc, atendimento) => {
    const date = atendimento?.dataInicio ?? atendimento?.criadoEm;
    if (!date) {
      return acc;
    }

    const current = new Date(date);
    if (Number.isNaN(current.getTime())) {
      return acc;
    }

    const month = current.toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });

    acc[month] = (acc[month] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([label, value]) => ({ label, value }));
}

export function mapDashboardMetrics(rawData) {
  const pacientes = asArray(rawData.pacientes);
  const cirurgias = asArray(rawData.cirurgias);
  const atendimentos = asArray(rawData.atendimentos);
  const agendamentos = asArray(rawData.agendamentos);
  const status = asArray(rawData.status);

  const atendimentosConcluidos = atendimentos.filter((item) => item?.dataFim);
  const npsScore = atendimentos.length
    ? Math.round((atendimentosConcluidos.length / atendimentos.length) * 100)
    : 0;

  return {
    cards: [
      { title: "Pacientes", value: pacientes.length, accent: "gold" },
      { title: "Cirurgias", value: cirurgias.length, accent: "blue" },
      { title: "Atendimentos", value: atendimentos.length, accent: "neutral" },
      { title: "Agendamentos", value: agendamentos.length, accent: "neutral" },
    ],
    npsLikeScore: npsScore,
    surgeryStatus: groupCount(cirurgias, (item) => item?.status?.nome),
    atendimentoSteps: groupCount(atendimentos, (item) => item?.etapa?.nome),
    statusCatalog: groupCount(status, (item) => item?.categoria),
    monthlyAttendances: mapMonthlyAttendances(atendimentos),
  };
}


