import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InternacoesTable } from "../components/organisms/InternacoesTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { fetchInternacoes } from "../services/internacoesService";
import { mapInternacaoToRow } from "../utils/internacoesMapper";

export function InternacoesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [internacoes, setInternacoes] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchInternacoes();
        if (mounted) setInternacoes(data.map(mapInternacaoToRow));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return internacoes;
    return internacoes.filter((i) => i.paciente.toLowerCase().includes(q) || i.leito.toLowerCase().includes(q) || i.motivo.toLowerCase().includes(q));
  }, [internacoes, query]);

  async function handleLogout() { await logout(); navigate("/", { replace: true }); }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="gestao"
      activeSidebar="internacoes"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Internacoes ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/internacoes/modal")}>
            + Registrar Internacao
          </button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando internacoes...</p> : <InternacoesTable internacoes={filtered} />}
    </DashboardTemplate>
  );
}
