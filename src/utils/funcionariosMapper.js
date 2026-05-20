export function mapFuncionarioToRow(item) {
  return {
    id: item?.id,
    nome: item?.nome ?? '-',
    cpf: item?.cpf ?? '-',
    cargo: item?.cargo?.cargo ?? item?.cargo?.nome ?? '-',
    departamento: item?.cargo?.departamento ?? '-',
    ativo: item?.ativo === false ? 'Inativo' : 'Ativo',
  };
}

