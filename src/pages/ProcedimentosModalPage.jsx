import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddProcedimentoModal } from "../components/organisms/AddProcedimentoModal";
import { ProcedimentosTable } from "../components/organisms/ProcedimentosTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { buildProcedimentoPayload, createProcedimento, fetchProcedimentos } from "../services/procedimentosService";
import { mapProcedimentoToRow } from "../utils/procedimentosMapper";

const initialForm = { nomeProcedimento: "", status: "ATIVO" };

export function ProcedimentosModalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [procedimentos, setProcedimentos] = useState([]);
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

  function handleChange(field, value) { setForm((c) => ({ ...c, [field]: value })); }

  async function handleSubmit() {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const created = await createProcedimento(buildProcedimentoPayload(form));
      setProcedimentos((c) => [mapProcedimentoToRow(created), ...c]);
      navigate("/procedimentos", { replace: true });
    } catch (err) {
      setSubmitError(err?.message || "Não foi possível cadastrar o procedimento.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <button type="button" className="screen-action" onClick={() => navigate("/procedimentos")}>Voltar</button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando procedimentos...</p> : <ProcedimentosTable procedimentos={filtered} />}
      <AddProcedimentoModal form={form} onChange={handleChange} onSubmit={handleSubmit} onClose={() => navigate("/procedimentos")} isSubmitting={isSubmitting} error={submitError} />
    </DashboardTemplate>
  );
}


