import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddInternacaoModal } from "../components/organisms/AddInternacaoModal";
import { InternacoesTable } from "../components/organisms/InternacoesTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { buildInternacaoPayload, createInternacao, fetchInternacaoReferences, fetchInternacoes } from "../services/internacoesService";
import { mapInternacaoToRow } from "../utils/internacoesMapper";

function nowLocal() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

const initialForm = { pacienteId: "", statusId: "", leito: "", motivo: "", dataEntrada: "", dataSaida: "" };

export function InternacoesModalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [internacoes, setInternacoes] = useState([]);
  const [references, setReferences] = useState({ pacientes: [], status: [] });
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
        const [data, refs] = await Promise.all([fetchInternacoes(), fetchInternacaoReferences()]);
        if (!mounted) return;
        setReferences(refs);
        setInternacoes(data.map(mapInternacaoToRow));
        setForm((c) => ({
          ...c,
          pacienteId: refs.pacientes[0]?.id ? String(refs.pacientes[0].id) : "",
          statusId: refs.status[0]?.id ? String(refs.status[0].id) : "",
          dataEntrada: nowLocal(),
        }));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return internacoes;
    return internacoes.filter((i) => i.paciente.toLowerCase().includes(q) || i.leito.toLowerCase().includes(q));
  }, [internacoes, query]);

  function handleChange(field, value) { setForm((c) => ({ ...c, [field]: value })); }

  async function handleSubmit() {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const created = await createInternacao(buildInternacaoPayload(form));
      setInternacoes((c) => [mapInternacaoToRow(created), ...c]);
      navigate("/internacoes", { replace: true });
    } catch (err) {
      setSubmitError(err?.message || "Não foi possível registrar a internacao.");
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
      activeSidebar="internacoes"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Internacoes ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/internacoes")}>Voltar</button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando internacoes...</p> : <InternacoesTable internacoes={filtered} />}
      <AddInternacaoModal form={form} references={references} onChange={handleChange} onSubmit={handleSubmit} onClose={() => navigate("/internacoes")} isSubmitting={isSubmitting} error={submitError} />
    </DashboardTemplate>
  );
}


