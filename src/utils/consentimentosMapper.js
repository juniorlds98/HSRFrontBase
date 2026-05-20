function fmt(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d);
}

export function mapConsentimentoToRow(item) {
  const linkedReportFile = item?.linkedReportFile ?? null;
  return {
    id: item?.id,
    pacienteId: item?.paciente_id ? `Paciente #${item.paciente_id}` : '-',
    concedido: item?.concedido ? 'Sim' : 'Nao',
    canal: item?.canal ?? '-',
    finalidade: item?.finalidade ?? '-',
    origemAtendimento: item?.origemAtendimento ?? '-',
    dataConsentimento: fmt(item?.dataConsentimento),
    arquivoRelatorioNome: linkedReportFile?.name ?? '-',
    arquivoRelatorioPath: linkedReportFile?.path ?? '',
  };
}

