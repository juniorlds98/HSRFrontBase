import { MenuOverviewPage } from "./MenuOverviewPage";

const sources = [
  {
    key: "complicacoes",
    label: "Complicacoes",
    endpoint: "/api/v1/complicacoes",
    columns: [
      {
        label: "Tipo",
        render: (item) => item?.descricao,
      },
      {
        label: "Gravidade",
        render: (item) => item?.cirurgia?.risco ?? "Não informado",
      },
      {
        label: "Registrado",
        render: (item, helpers) => helpers.formatDateTime(item?.cirurgia?.atualizadoEm ?? item?.cirurgia?.criadoEm),
      },
    ],
  },
  {
    key: "consentimentos",
    label: "Consentimentos",
    endpoint: "/api/v1/consentimentos",
    columns: [
      {
        label: "Paciente",
        render: (item) => (item?.paciente_id ? `Paciente #${item.paciente_id}` : "-"),
      },
      {
        label: "Tipo",
        render: (item) => `${item?.finalidade ?? "-"} (${item?.canal ?? "-"})`,
      },
      {
        label: "Assinado em",
        render: (item, helpers) => helpers.formatDateTime(item?.dataConsentimento ?? item?.atualizadoEm),
      },
    ],
  },
  {
    key: "gravidades",
    label: "Niveis de Gravidade",
    endpoint: "/api/v1/gravidades",
    columns: [
      {
        label: "Nome",
        render: (item) => item?.nome,
      },
      {
        label: "Descricao",
        render: (item) => item?.descricao,
      },
      {
        label: "Prioridade",
        render: (item) => item?.descricao,
      },
    ],
  },
];

export function QualityPage() {
  return (
    <MenuOverviewPage
      title="Qualidade"
      subtitle="Monitoramento de risco, consentimento e seguranca assistencial."
      activeMenu="qualidade-menu"
      activeSidebar="qualidade"
      sources={sources}
    />
  );
}


