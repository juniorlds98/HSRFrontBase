import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcedimentosTable } from "../components/organisms/ProcedimentosTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { fetchProcedimentos } from "../services/procedimentosService";
import { mapProcedimentoToRow } from "../utils/procedimentosMapper";

export function ProcedimentosPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [procedimentos, setProcedimentos] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchProcedimentos();
        if (mounted) setProcedimentos(data.map(mapProcedimentoToRow));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return procedimentos;
    return procedimentos.filter((p) => p.nome.toLowerCase().includes(q));
  }, [procedimentos, query]);

  async function handleLogout() { await logout(); navigate("/", { replace: true }); }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuário"}
      onLogout={handleLogout}
      activeMenu="gestao"
      activeSidebar="procedimentos"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Procedimentos ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/procedimentos/modal")}>
            + Cadastrar Procedimento
          </button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando procedimentos...</p> : <ProcedimentosTable procedimentos={filtered} />}
    </DashboardTemplate>
  );
}

