import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CirurgiasTable } from "../components/organisms/CirurgiasTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { fetchCirurgias } from "../services/cirurgiasService";
import { mapCirurgiaToRow } from "../utils/cirurgiasMapper";

export function CirurgiasPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [cirurgias, setCirurgias] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchCirurgias();
        if (mounted) setCirurgias(data.map(mapCirurgiaToRow));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cirurgias;
    return cirurgias.filter(
      (c) => c.paciente.toLowerCase().includes(q) || c.medico.toLowerCase().includes(q) || c.procedimento.toLowerCase().includes(q),
    );
  }, [cirurgias, query]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="gestao"
      activeSidebar="cirurgias"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Cirurgias ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/cirurgias/modal")}>
            + Registrar Cirurgia
          </button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando cirurgias...</p> : <CirurgiasTable cirurgias={filtered} />}
    </DashboardTemplate>
  );
}
