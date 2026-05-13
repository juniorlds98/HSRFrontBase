import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PatientsTable } from "../components/organisms/PatientsTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { deactivatePatient, fetchPatients } from "../services/patientsService";
import { mapPatientToRow } from "../utils/patientsMapper";

export function PatientsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState(location?.state?.query ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [page, setPage] = useState(1);
  const [highlightPatientId, setHighlightPatientId] = useState(location?.state?.highlightPatientId ?? null);
  const [actionFeedback, setActionFeedback] = useState("");

  const pageSize = 6;

  useEffect(() => {
    let mounted = true;

    async function loadPatients() {
      setIsLoading(true);
      try {
        const data = await fetchPatients();
        if (!mounted) return;
        setPatients(data.map(mapPatientToRow));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadPatients();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredPatients = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return patients.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.active) ||
        (statusFilter === "inactive" && !item.active);

      if (!matchesStatus) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return item.name.toLowerCase().includes(normalized) || item.email.toLowerCase().includes(normalized);
    });
  }, [patients, query, statusFilter]);

  const activeCount = useMemo(() => patients.filter((item) => item.active).length, [patients]);
  const inactiveCount = useMemo(() => patients.filter((item) => !item.active).length, [patients]);

  useEffect(() => {
    if (!location?.state) {
      return;
    }

    if (typeof location.state.query === "string") {
      setQuery(location.state.query);
      setPage(1);
    }

    setHighlightPatientId(location.state.highlightPatientId ?? null);
  }, [location]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedPatients = filteredPatients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  function handleOpenConversation(patient) {
    navigate("/mensagens", {
      state: {
        patientId: patient.id,
        phone: patient.telefone,
      },
    });
  }

  async function handleDeactivate(patient) {
    if (!patient?.id || !patient.active) {
      return;
    }

    try {
      await deactivatePatient(patient.id);
      setPatients((current) => current.map((item) => (item.id === patient.id ? { ...item, active: false } : item)));
      setActionFeedback("Paciente desativado com sucesso.");
    } catch {
      setActionFeedback("Falha ao desativar paciente.");
    }
  }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="pacientes-menu"
      activeSidebar="pacientes"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Pacientes ({filteredPatients.length})</h1>

        <div className="patients-toolbar">
          <div className="services-toggle">
            <button type="button" className={statusFilter === "inactive" ? "active" : ""} onClick={() => setStatusFilter("inactive")}>
              Desativado ({inactiveCount})
            </button>
            <button type="button" className={statusFilter === "active" ? "active" : ""} onClick={() => setStatusFilter("active")}>
              Ativo ({activeCount})
            </button>
            <button type="button" className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>
              Todos
            </button>
          </div>

          <button type="button" className="screen-action" onClick={() => navigate("/pacientes/modal")}>
            + Adicionar Paciente
          </button>
        </div>
      </section>

      {isLoading ? (
        <p className="loading">Carregando pacientes...</p>
      ) : (
        <PatientsTable
          patients={pagedPatients}
          highlightPatientId={highlightPatientId}
          onOpenConversation={handleOpenConversation}
          onDeactivate={handleDeactivate}
        />
      )}

      {actionFeedback ? <p className="services-feedback">{actionFeedback}</p> : null}

      <footer className="patients-footer-pagination">
        <span>
          {filteredPatients.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredPatients.length)} of{" "}
          {filteredPatients.length}
        </span>
        <div>
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))}>
            &lt;-
          </button>
          <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
            -&gt;
          </button>
        </div>
      </footer>
    </DashboardTemplate>
  );
}
