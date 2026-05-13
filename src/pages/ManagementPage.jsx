import { MenuOverviewPage } from "./MenuOverviewPage";

const sources = [
  {
    key: "cirurgias",
    label: "Cirurgias",
    endpoint: "/api/v1/cirurgias",
    columns: [
      {
        label: "Paciente",
        render: (item) => item?.paciente?.nome ?? item?.pacienteNome,
      },
      {
        label: "Procedimento",
        render: (item) => item?.procedimento?.nomeProcedimento ?? item?.procedimento,
      },
      {
        label: "Data",
        render: (item, helpers) => helpers.formatDateTime(item?.dataRealizada ?? item?.dataAgendada),
      },
    ],
  },
  {
    key: "agendamentos",
    label: "Agendamentos",
    endpoint: "/api/v1/agendamentos",
    columns: [
      {
        label: "Paciente",
        render: (item) => item?.paciente?.nome,
      },
      {
        label: "Medico",
        render: (item) => item?.medico?.nome ?? item?.medico?.funcionario?.nome,
      },
      {
        label: "Data/Hora",
        render: (item, helpers) => helpers.formatDateTime(item?.data_hora),
      },
    ],
  },
  {
    key: "atendimentos",
    label: "Atendimentos",
    endpoint: "/api/v1/atendimentos",
    columns: [
      {
        label: "Paciente",
        render: (item) => item?.paciente?.nome ?? item?.pacienteNome,
      },
      {
        label: "Status",
        render: (item) => item?.etapa?.nome ?? "Em atendimento",
      },
      {
        label: "Atualizado",
        render: (item, helpers) => helpers.formatDateTime(item?.dataFim ?? item?.dataInicio ?? item?.atualizadoEm ?? item?.criadoEm),
      },
    ],
  },
];

export function ManagementPage() {
  return (
    <MenuOverviewPage
      title="Gestao"
      subtitle="Visao consolidada da operacao assistencial e agenda."
      activeMenu="gestao"
      activeSidebar="cirurgias"
      sources={sources}
    />
  );
}
