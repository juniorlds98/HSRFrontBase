import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddComplicacaoModal } from "../components/organisms/AddComplicacaoModal";
import { ComplicacoesTable } from "../components/organisms/ComplicacoesTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { buildComplicacaoPayload, createComplicacao, fetchComplicacaoReferences, fetchComplicacoes } from "../services/complicacoesService";
import { mapComplicacaoToRow } from "../utils/complicacoesMapper";

const initialForm = { cirurgiaId: "", descricao: "" };

export function ComplicacoesModalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [complicacoes, setComplicacoes] = useState([]);
  const [references, setReferences] = useState({ cirurgias: [] });
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
        const [data, refs] = await Promise.all([fetchComplicacoes(), fetchComplicacaoReferences()]);
        if (!mounted) return;
        setReferences(refs);
        setComplicacoes(data.map(mapComplicacaoToRow));
        setForm((c) => ({ ...c, cirurgiaId: refs.cirurgias[0]?.id ? String(refs.cirurgias[0].id) : "" }));
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

  function handleChange(field, value) { setForm((c) => ({ ...c, [field]: value })); }

  async function handleSubmit() {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const created = await createComplicacao(buildComplicacaoPayload(form));
      setComplicacoes((c) => [mapComplicacaoToRow(created), ...c]);
      navigate("/complicacoes", { replace: true });
    } catch (err) {
      setSubmitError(err?.message || "Nao foi possivel registrar a complicacao.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() { await logout(); navigate("/", { replace: true }); }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="qualidade-menu"
      activeSidebar="complicacoes"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Complicacoes ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/complicacoes")}>Voltar</button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando complicacoes...</p> : <ComplicacoesTable complicacoes={filtered} />}
      <AddComplicacaoModal form={form} references={references} onChange={handleChange} onSubmit={handleSubmit} onClose={() => navigate("/complicacoes")} isSubmitting={isSubmitting} error={submitError} />
    </DashboardTemplate>
  );
}
