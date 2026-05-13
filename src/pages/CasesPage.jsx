import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CasesTable } from "../components/organisms/CasesTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { fetchCaseReferences, fetchCases } from "../services/casesService";
import { mapCaseToRow } from "../utils/casesMapper";

export function CasesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [references, setReferences] = useState({ pacientes: [], medicos: [], agendamentos: [], atendimentos: [] });
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCases() {
      setIsLoading(true);
      try {
        const [casesData, refsData] = await Promise.all([fetchCases(), fetchCaseReferences()]);
        if (!mounted) return;
        setReferences(refsData);
        setCases(casesData.map((item) => mapCaseToRow(item, refsData)));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadCases();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return cases;
    }

    return cases.filter((item) => {
      return (
        item.title.toLowerCase().includes(normalized) ||
        item.patient.toLowerCase().includes(normalized) ||
        item.doctor.toLowerCase().includes(normalized) ||
        item.status.toLowerCase().includes(normalized)
      );
    });
  }, [cases, query]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="casos-menu"
      activeSidebar="casos"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Casos ({filteredCases.length})</h1>

        <div className="patients-toolbar">
          <div className="services-toggle">
            <button type="button" disabled>
              Registrados
            </button>
            <button type="button" className="active">
              Ativos
            </button>
          </div>

          <button type="button" className="screen-action" onClick={() => navigate("/casos/modal")}> 
            + Registrar Caso
          </button>
        </div>
      </section>

      {isLoading ? <p className="loading">Carregando casos...</p> : <CasesTable cases={filteredCases} references={references} />}
    </DashboardTemplate>
  );
}
