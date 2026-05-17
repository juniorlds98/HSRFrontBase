import { Link, useLocation } from "react-router-dom";
import { Button } from "../atoms/Button";
import logo from "../../assets/images/logo-login.png";
import searchIcon from "../../assets/icons/buscar.svg";
import whatsappIcon from "../../assets/icons/whatsapp.svg";
import supportIllustration from "../../assets/icons/suport.svg";
import { canAccessScreen } from "../../services/permissionService";

const topMenuItems = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard" },
  { key: "relatorios", label: "Relatorios", to: "/relatorios", permission: "relatorio" },
  { key: "financeiro", label: "Financeiro", to: "/financeiro", permission: "financeiro" },
  { key: "marketing", label: "Marketing", to: "/marketing" },
  { key: "pacientes", label: "Pacientes", to: "/pacientes" },
  { key: "casos", label: "Casos", to: "/casos" },
  { key: "medicos", label: "Medicos", to: "/medicos" },
  { key: "gestao", label: "Gestao", to: "/gestao" },
  { key: "qualidade", label: "Qualidade", to: "/qualidade" },
  { key: "servicos", label: "Servicos", to: "/services", permission: "servicos" },
  { key: "conversas", label: "Conversas", to: "/mensagens" },
];

const defaultSidebarItems = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard" },
  { key: "relatorios", label: "Relatorios", to: "/relatorios", permission: "relatorio" },
  { key: "financeiro", label: "Financeiro", to: "/financeiro", permission: "financeiro" },
  { key: "marketing", label: "Marketing", to: "/marketing" },
  { key: "conversas", label: "Conversas", to: "/mensagens" },
  { key: "pacientes", label: "Pacientes", to: "/pacientes" },
  { key: "jornadas", label: "Jornadas", to: "/jornadas" },
  { key: "casos", label: "Casos", to: "/casos" },
  { key: "agendamentos", label: "Agendamentos", to: "/agendamentos" },
  { key: "internacoes", label: "Internacoes", to: "/internacoes" },
  { key: "cirurgias", label: "Cirurgias", to: "/cirurgias" },
  { key: "procedimentos", label: "Procedimentos", to: "/procedimentos" },
  { key: "complicacoes", label: "Complicacoes", to: "/complicacoes" },
  { key: "consentimentos", label: "Consentimentos", to: "/consentimentos" },
  { key: "medicos", label: "Medicos", to: "/medicos" },
  { key: "funcionarios", label: "Funcionarios", to: "/funcionarios" },
  { key: "qualidade", label: "Qualidade", to: "/qualidade" },
  { key: "servicos", label: "Servicos", to: "/services", permission: "servicos" },
];

const routeStateMap = [
  { prefix: "/relatorios", menu: "relatorios", sidebar: "relatorios" },
  { prefix: "/financeiro", menu: "financeiro", sidebar: "financeiro" },
  { prefix: "/marketing", menu: "marketing", sidebar: "marketing" },
  { prefix: "/mensagens", menu: "conversas", sidebar: "conversas" },
  { prefix: "/pacientes", menu: "pacientes", sidebar: "pacientes" },
  { prefix: "/jornadas", menu: "pacientes", sidebar: "jornadas" },
  { prefix: "/casos", menu: "casos", sidebar: "casos" },
  { prefix: "/medicos", menu: "medicos", sidebar: "medicos" },
  { prefix: "/cirurgias", menu: "gestao", sidebar: "cirurgias" },
  { prefix: "/internacoes", menu: "gestao", sidebar: "internacoes" },
  { prefix: "/procedimentos", menu: "gestao", sidebar: "procedimentos" },
  { prefix: "/funcionarios", menu: "gestao", sidebar: "funcionarios" },
  { prefix: "/agendamentos", menu: "gestao", sidebar: "agendamentos" },
  { prefix: "/consentimentos", menu: "qualidade", sidebar: "consentimentos" },
  { prefix: "/complicacoes", menu: "qualidade", sidebar: "complicacoes" },
  { prefix: "/qualidade", menu: "qualidade", sidebar: "qualidade" },
  { prefix: "/gestao", menu: "gestao", sidebar: "cirurgias" },
  { prefix: "/services", menu: "servicos", sidebar: "servicos" },
  { prefix: "/dashboard", menu: "dashboard", sidebar: "dashboard" },
];

function getTopLinkClass(activeMenu, currentKey) {
  return activeMenu === currentKey ? "menu-active" : "";
}

export function DashboardTemplate({
  userName,
  onLogout,
  children,
  activeMenu = "dashboard",
  searchValue = "",
  onSearchChange,
  activeSidebar = "pacientes",
  sidebarItems = defaultSidebarItems,
  hideSidebar = false,
}) {
  const location = useLocation();
  const routeState = routeStateMap.find((item) => location.pathname.startsWith(item.prefix));
  const currentActiveMenu = routeState?.menu ?? activeMenu;
  const currentActiveSidebar = routeState?.sidebar ?? activeSidebar;

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <img src={logo} alt="Hospital Sao Rafael" className="brand-logo" />
        <nav className="top-menu">
          {topMenuItems
            .filter((item) => !item.permission || canAccessScreen(item.permission))
            .map((item) => {
              const className = `top-menu-item ${getTopLinkClass(currentActiveMenu, item.key)}`.trim();

              if (item.to.startsWith("/")) {
                return (
                  <Link key={item.key} className={className} to={item.to}>
                    <span>{item.label}</span>
                    <span className="menu-caret" aria-hidden="true">
                      v
                    </span>
                  </Link>
                );
              }

              return (
                <a key={item.key} className={className} href={item.to}>
                  <span>{item.label}</span>
                  <span className="menu-caret" aria-hidden="true">
                    v
                  </span>
                </a>
              );
            })}
        </nav>
        <div className="top-actions">
          <span>Ola, {userName}</span>
          <Button variant="ghost" onClick={onLogout}>
            Sair
          </Button>
        </div>
      </header>

      <section className="dashboard-shell">
        {!hideSidebar ? (
          <aside className="dashboard-sidebar">
            <label className="sidebar-search" htmlFor="dashboard-search">
              <img src={searchIcon} alt="" />
              <input
                id="dashboard-search"
                type="search"
                placeholder="Buscar"
                value={searchValue}
                readOnly={!onSearchChange}
                onChange={(event) => onSearchChange?.(event.target.value)}
              />
            </label>

            <nav className="sidebar-menu">
              {sidebarItems
                .filter((item) => !item.permission || canAccessScreen(item.permission))
                .map((item) => {
                  const className = currentActiveSidebar === item.key ? "sidebar-active" : "";

                  if (item.to) {
                    return (
                      <Link key={item.key} className={className} to={item.to}>
                        {item.label}
                      </Link>
                    );
                  }

                  return (
                    <a key={item.key} className={className} href={`#${item.key}`}>
                      {item.label}
                    </a>
                  );
                })}
            </nav>

            <div className="support-card">
              <img src={supportIllustration} alt="Suporte" />
              <button type="button">Suporte</button>
            </div>
          </aside>
        ) : null}

        <section className={`dashboard-content ${hideSidebar ? "dashboard-content-full" : ""}`}>{children}</section>
      </section>

      <button className="whatsapp-fab" type="button" aria-label="WhatsApp">
        <img src={whatsappIcon} alt="" />
      </button>
    </main>
  );
}
