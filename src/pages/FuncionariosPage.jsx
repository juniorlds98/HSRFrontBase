import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FuncionariosTable } from "../components/organisms/FuncionariosTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { fetchFuncionarios } from "../services/funcionariosService";
import { mapFuncionarioToRow } from "../utils/funcionariosMapper";

export function FuncionariosPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [funcionarios, setFuncionarios] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchFuncionarios();
        if (mounted) setFuncionarios(data.map(mapFuncionarioToRow));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return funcionarios;
    return funcionarios.filter((f) => f.nome.toLowerCase().includes(q) || f.cpf.toLowerCase().includes(q));
  }, [funcionarios, query]);

  async function handleLogout() { await logout(); navigate("/", { replace: true }); }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="gestao"
      activeSidebar="funcionarios"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Funcionarios ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/funcionarios/modal")}>
            + Cadastrar Funcionario
          </button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando funcionarios...</p> : <FuncionariosTable funcionarios={filtered} />}
    </DashboardTemplate>
  );
}
