import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConsentimentosTable } from "../components/organisms/ConsentimentosTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { fetchConsentimentos } from "../services/consentimentosService";
import { mapConsentimentoToRow } from "../utils/consentimentosMapper";

export function ConsentimentosPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [consentimentos, setConsentimentos] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchConsentimentos();
        if (mounted) setConsentimentos(data.map(mapConsentimentoToRow));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return consentimentos;
    return consentimentos.filter((c) => c.pacienteId.toLowerCase().includes(q) || c.canal.toLowerCase().includes(q));
  }, [consentimentos, query]);

  async function handleLogout() { await logout(); navigate("/", { replace: true }); }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="qualidade-menu"
      activeSidebar="consentimentos"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Consentimentos ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/consentimentos/modal")}>
            + Registrar Consentimento
          </button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando consentimentos...</p> : <ConsentimentosTable consentimentos={filtered} />}
    </DashboardTemplate>
  );
}
