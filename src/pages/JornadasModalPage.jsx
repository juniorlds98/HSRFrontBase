import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddJornadaModal } from "../components/organisms/AddJornadaModal";
import { JornadasTable } from "../components/organisms/JornadasTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { buildJornadaPayload, createJornada, fetchJornadaReferences, fetchJornadas } from "../services/jornadasService";
import { mapJornadaToRow } from "../utils/jornadasMapper";

function nowLocal() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

const initialForm = { pacienteId: "", etapaId: "", dataInicio: "", dataFim: "" };

export function JornadasModalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [jornadas, setJornadas] = useState([]);
  const [references, setReferences] = useState({ pacientes: [], etapas: [] });
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
        const [data, refs] = await Promise.all([fetchJornadas(), fetchJornadaReferences()]);
        if (!mounted) return;
        setReferences(refs);
        setJornadas(data.map(mapJornadaToRow));
        setForm((c) => ({
          ...c,
          pacienteId: refs.pacientes[0]?.id ? String(refs.pacientes[0].id) : "",
          etapaId: refs.etapas[0]?.id ? String(refs.etapas[0].id) : "",
          dataInicio: nowLocal(),
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
    if (!q) return jornadas;
    return jornadas.filter((j) => j.paciente.toLowerCase().includes(q) || j.etapa.toLowerCase().includes(q));
  }, [jornadas, query]);

  function handleChange(field, value) { setForm((c) => ({ ...c, [field]: value })); }

  async function handleSubmit() {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const created = await createJornada(buildJornadaPayload(form));
      setJornadas((c) => [mapJornadaToRow(created), ...c]);
      navigate("/jornadas", { replace: true });
    } catch (err) {
      setSubmitError(err?.message || "Nao foi possivel registrar a jornada.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() { await logout(); navigate("/", { replace: true }); }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="pacientes-menu"
      activeSidebar="jornadas"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Jornadas do Paciente ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/jornadas")}>Voltar</button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando jornadas...</p> : <JornadasTable jornadas={filtered} />}
      <AddJornadaModal form={form} references={references} onChange={handleChange} onSubmit={handleSubmit} onClose={() => navigate("/jornadas")} isSubmitting={isSubmitting} error={submitError} />
    </DashboardTemplate>
  );
}
