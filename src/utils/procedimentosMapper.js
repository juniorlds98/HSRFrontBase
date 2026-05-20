export function mapProcedimentoToRow(item) {
  return {
    id: item?.id,
    nome: item?.nomeProcedimento ?? item?.nome ?? '-',
    status: item?.status ?? '-',
  };
}

