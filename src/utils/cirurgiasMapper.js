function fmt(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d);
}

export function mapCirurgiaToRow(item) {
  return {
    id: item?.id,
    paciente: item?.paciente?.nome ?? '-',
    medico: item?.medico?.nome ?? '-',
    procedimento: item?.procedimento?.nomeProcedimento ?? item?.procedimento?.nome ?? '-',
    gravidade: item?.gravidade?.nome ?? '-',
    status: item?.status?.nome ?? '-',
    sala: item?.sala ?? '-',
    risco: item?.risco ?? '-',
    dataAgendada: fmt(item?.dataAgendada),
    dataRealizada: fmt(item?.dataRealizada),
  };
}

