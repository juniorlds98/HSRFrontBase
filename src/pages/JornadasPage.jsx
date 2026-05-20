import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JornadasTable } from "../components/organisms/JornadasTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { fetchJornadas } from "../services/jornadasService";
import { mapJornadaToRow } from "../utils/jornadasMapper";

export function JornadasPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [jornadas, setJornadas] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchJornadas();
        if (mounted) setJornadas(data.map(mapJornadaToRow));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jornadas;
    return jornadas.filter((j) => j.paciente.toLowerCase().includes(q) || j.etapa.toLowerCase().includes(q));
  }, [jornadas, query]);

  async function handleLogout() { await logout(); navigate("/", { replace: true }); }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuário"}
      onLogout={handleLogout}
      activeMenu="pacientes-menu"
      activeSidebar="jornadas"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Jornadas do Paciente ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/jornadas/modal")}>
            + Registrar Jornada
          </button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando jornadas...</p> : <JornadasTable jornadas={filtered} />}
    </DashboardTemplate>
  );
}

