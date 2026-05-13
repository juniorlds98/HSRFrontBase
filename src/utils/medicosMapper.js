export function mapMedicoToRow(item) {
  const nome = item?.nome ?? '-';
  const cpf = item?.cpf ?? '-';
  const ativo = item?.ativo === false ? 'Inativo' : 'Ativo';
  const cargo = item?.cargo?.cargo ?? item?.cargo?.nome ?? '-';
  const departamento = item?.cargo?.departamento ?? '-';
  const crmNumero = item?.crm?.crm ?? '-';
  const crmUf = item?.crm?.uf ?? '-';
  const crmDisplay = crmNumero !== '-' ? `${crmNumero}/${crmUf}` : '-';

  return { id: item?.id, nome, cpf, ativo, cargo, departamento, crmDisplay };
}
