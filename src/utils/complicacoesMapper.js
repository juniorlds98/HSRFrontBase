export function mapComplicacaoToRow(item) {
  return {
    id: item?.id,
    cirurgiaId: item?.cirurgia?.id ?? '-',
    procedimento: item?.cirurgia?.procedimento?.nomeProcedimento ?? item?.cirurgia?.procedimento?.nome ?? '-',
    paciente: item?.cirurgia?.paciente?.nome ?? '-',
    descricao: item?.descricao ?? '-',
  };
}

