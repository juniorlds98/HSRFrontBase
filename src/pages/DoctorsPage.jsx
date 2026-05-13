import { MenuOverviewPage } from "./MenuOverviewPage";

const sources = [
  {
    key: "medicos",
    label: "Medicos",
    endpoint: "/api/v1/medicos",
    columns: [
      {
        label: "Nome",
        render: (item) => item?.nome ?? item?.funcionario?.nome,
      },
      {
        label: "CRM",
        render: (item) => item?.crm?.numero ?? item?.crm,
      },
      {
        label: "Ativo",
        render: (item) => (item?.ativo === false ? "Nao" : "Sim"),
      },
    ],
  },
  {
    key: "cargos",
    label: "Cargos",
    endpoint: "/api/v1/cargos",
    columns: [
      {
        label: "Cargo",
        render: (item) => item?.nome,
      },
      {
        label: "Descricao",
        render: (item) => item?.descricao,
      },
      {
        label: "Nivel",
        render: (item) => item?.nivel,
      },
    ],
  },
  {
    key: "funcionarios",
    label: "Funcionarios",
    endpoint: "/api/v1/funcionarios",
    columns: [
      {
        label: "Nome",
        render: (item) => item?.nome,
      },
      {
        label: "Cargo",
        render: (item) => item?.cargo?.nome ?? item?.cargo,
      },
      {
        label: "Ativo",
        render: (item) => (item?.ativo === false ? "Nao" : "Sim"),
      },
    ],
  },
];

export function DoctorsPage() {
  return (
    <MenuOverviewPage
      title="Corpo Medico"
      subtitle="Estrutura de medicos, cargos e funcionarios ativos."
      activeMenu="medicos-menu"
      activeSidebar="medicos"
      sources={sources}
    />
  );
}
