import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ComplicacoesTable } from "../components/organisms/ComplicacoesTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { fetchComplicacoes } from "../services/complicacoesService";
import { mapComplicacaoToRow } from "../utils/complicacoesMapper";

export function ComplicacoesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [complicacoes, setComplicacoes] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchComplicacoes();
        if (mounted) setComplicacoes(data.map(mapComplicacaoToRow));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return complicacoes;
    return complicacoes.filter((c) => c.descricao.toLowerCase().includes(q) || c.paciente.toLowerCase().includes(q));
  }, [complicacoes, query]);

  async function handleLogout() { await logout(); navigate("/", { replace: true }); }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuário"}
      onLogout={handleLogout}
      activeMenu="qualidade-menu"
      activeSidebar="complicacoes"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Complicacoes ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/complicacoes/modal")}>
            + Registrar Complicacao
          </button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando complicacoes...</p> : <ComplicacoesTable complicacoes={filtered} />}
    </DashboardTemplate>
  );
}

