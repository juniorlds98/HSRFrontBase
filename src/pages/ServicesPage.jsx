import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServiceDisableModal } from "../components/molecules/ServiceDisableModal";
import { ServiceControlBoard } from "../components/organisms/ServiceControlBoard";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { fetchServiceControlData, performServiceAction } from "../services/serviceControlService";

export function ServicesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [services, setServices] = useState([]);
  const [mode, setMode] = useState("stack-health");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingId, setPendingId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [modalService, setModalService] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadServices() {
      setIsLoading(true);
      setFeedback("");

      try {
        const response = await fetchServiceControlData();
        if (!mounted) return;

        setServices(response.services);
        setMode(response.mode);
      } catch {
        if (!mounted) return;
        setFeedback("Não foi possível carregar os servicos no momento.");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadServices();
    const intervalId = setInterval(loadServices, 15000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return services.filter((service) => {
      const matchesQuery = !normalizedQuery || service.name.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" || service.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, services, statusFilter]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  async function handleRestart(service) {
    setPendingId(service.id);
    setFeedback("");

    try {
      const result = await performServiceAction(service.id, "restart");

      if (result.ok) {
        setServices((current) =>
          current.map((item) => (item.id === service.id ? { ...item, status: "active", error: null } : item)),
        );
        setFeedback(result.mock ? "Reinicio simulado (modo mock)." : "Servico reiniciado com sucesso.");
      }
    } catch {
      setFeedback("Falha ao reiniciar servico.");
    } finally {
      setPendingId("");
    }
  }

  async function handleDisable(service) {
    setPendingId(service.id);
    setFeedback("");

    try {
      const result = await performServiceAction(service.id, "disable");

      if (result.ok) {
        setServices((current) =>
          current.map((item) => (item.id === service.id ? { ...item, status: "inactive" } : item)),
        );
        setFeedback(result.mock ? "Desligamento simulado (modo mock)." : "Servico desativado com sucesso.");
      }
    } catch {
      setFeedback("Falha ao desativar servico.");
    } finally {
      setPendingId("");
      setModalService(null);
    }
  }

  const activeCount = services.filter((service) => service.status === "active").length;
  const inactiveCount = services.filter((service) => service.status === "inactive").length;

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuário"}
      onLogout={handleLogout}
      activeMenu="servicos"
      searchValue={query}
      onSearchChange={setQuery}
      activeSidebar="servicos"
    >
      <section className="services-heading-row">
        <h1>Controle de Servicos ({filteredServices.length})</h1>
        <div className="services-toggle" role="tablist" aria-label="Filtro de status">
          <button
            type="button"
            className={statusFilter === "inactive" ? "active" : ""}
            onClick={() => setStatusFilter("inactive")}
          >
            Desativado ({inactiveCount})
          </button>
          <button
            type="button"
            className={statusFilter === "active" ? "active" : ""}
            onClick={() => setStatusFilter("active")}
          >
            Ativo ({activeCount})
          </button>
          <button type="button" className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}> 
            Todos
          </button>
        </div>
      </section>

      <p className="services-mode-indicator">
        Fonte: {mode === "mock-control" ? "Backend mock de operacao" : "Stack health"}
      </p>

      {isLoading ? <p className="loading">Carregando servicos...</p> : null}
      {feedback ? <p className="services-feedback">{feedback}</p> : null}

      {!isLoading ? (
        <ServiceControlBoard
          services={filteredServices}
          onRestart={handleRestart}
          onDisable={(service) => setModalService(service)}
          pendingId={pendingId}
        />
      ) : null}

      {modalService ? (
        <ServiceDisableModal
          serviceName={modalService.name}
          isLoading={pendingId === modalService.id}
          onConfirm={() => handleDisable(modalService)}
          onCancel={() => setModalService(null)}
        />
      ) : null}
    </DashboardTemplate>
  );
}


