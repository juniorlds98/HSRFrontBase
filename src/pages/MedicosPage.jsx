import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MedicosTable } from "../components/organisms/MedicosTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { fetchMedicos } from "../services/medicosService";
import { mapMedicoToRow } from "../utils/medicosMapper";

export function MedicosPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [medicos, setMedicos] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchMedicos();
        if (mounted) setMedicos(data.map(mapMedicoToRow));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicos;
    return medicos.filter(
      (m) => m.nome.toLowerCase().includes(q) || m.cpf.toLowerCase().includes(q) || m.crmDisplay.toLowerCase().includes(q),
    );
  }, [medicos, query]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="medicos-menu"
      activeSidebar="medicos"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Medicos ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/medicos/modal")}>
            + Cadastrar Medico
          </button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando medicos...</p> : <MedicosTable medicos={filtered} />}
    </DashboardTemplate>
  );
}
