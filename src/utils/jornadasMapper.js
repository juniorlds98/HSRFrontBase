function fmt(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d);
}

export function mapJornadaToRow(item) {
  return {
    id: item?.id,
    paciente: item?.paciente?.nome ?? '-',
    etapa: item?.etapa?.nome ?? '-',
    dataInicio: fmt(item?.dataInicio),
    dataFim: fmt(item?.dataFim),
  };
}
