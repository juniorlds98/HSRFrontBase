import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddFuncionarioModal } from "../components/organisms/AddFuncionarioModal";
import { FuncionariosTable } from "../components/organisms/FuncionariosTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { buildFuncionarioPayload, createFuncionario, fetchFuncionarioReferences, fetchFuncionarios } from "../services/funcionariosService";
import { mapFuncionarioToRow } from "../utils/funcionariosMapper";

const initialForm = { nome: "", cpf: "", cargoId: "", ativo: "true" };

export function FuncionariosModalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [funcionarios, setFuncionarios] = useState([]);
  const [references, setReferences] = useState({ cargos: [] });
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const [data, refs] = await Promise.all([fetchFuncionarios(), fetchFuncionarioReferences()]);
        if (!mounted) return;
        setReferences(refs);
        setFuncionarios(data.map(mapFuncionarioToRow));
        setForm((c) => ({ ...c, cargoId: refs.cargos[0]?.id ? String(refs.cargos[0].id) : "" }));
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

  function handleChange(field, value) { setForm((c) => ({ ...c, [field]: value })); }

  async function handleSubmit() {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const created = await createFuncionario(buildFuncionarioPayload(form));
      setFuncionarios((c) => [mapFuncionarioToRow(created), ...c]);
      navigate("/funcionarios", { replace: true });
    } catch (err) {
      setSubmitError(err?.message || "Nao foi possivel cadastrar o funcionario.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <button type="button" className="screen-action" onClick={() => navigate("/funcionarios")}>Voltar</button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando funcionarios...</p> : <FuncionariosTable funcionarios={filtered} />}
      <AddFuncionarioModal form={form} references={references} onChange={handleChange} onSubmit={handleSubmit} onClose={() => navigate("/funcionarios")} isSubmitting={isSubmitting} error={submitError} />
    </DashboardTemplate>
  );
}
