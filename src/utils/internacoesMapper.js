function fmt(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d);
}

export function mapInternacaoToRow(item) {
  return {
    id: item?.id,
    paciente: item?.paciente?.nome ?? '-',
    status: item?.status?.nome ?? '-',
    leito: item?.leito ?? '-',
    motivo: item?.motivo ?? '-',
    dataEntrada: fmt(item?.dataEntrada),
    dataSaida: fmt(item?.dataSaida),
  };
}

