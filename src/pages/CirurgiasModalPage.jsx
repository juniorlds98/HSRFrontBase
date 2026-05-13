import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddCirurgiaModal } from "../components/organisms/AddCirurgiaModal";
import { CirurgiasTable } from "../components/organisms/CirurgiasTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { buildCirurgiaPayload, createCirurgia, fetchCirurgiaReferences, fetchCirurgias } from "../services/cirurgiasService";
import { mapCirurgiaToRow } from "../utils/cirurgiasMapper";

function nowLocal() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

const initialForm = {
  pacienteId: "", medicoId: "", procedimentoId: "", gravidadeId: "",
  statusId: "", risco: "MEDIO", sala: "", dataAgendada: "", dataRealizada: "",
};

export function CirurgiasModalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [cirurgias, setCirurgias] = useState([]);
  const [references, setReferences] = useState({ pacientes: [], medicos: [], procedimentos: [], gravidades: [], status: [] });
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
        const [data, refs] = await Promise.all([fetchCirurgias(), fetchCirurgiaReferences()]);
        if (!mounted) return;
        setReferences(refs);
        setCirurgias(data.map(mapCirurgiaToRow));
        setForm((c) => ({
          ...c,
          pacienteId: refs.pacientes[0]?.id ? String(refs.pacientes[0].id) : "",
          medicoId: refs.medicos[0]?.id ? String(refs.medicos[0].id) : "",
          procedimentoId: refs.procedimentos[0]?.id ? String(refs.procedimentos[0].id) : "",
          statusId: refs.status[0]?.id ? String(refs.status[0].id) : "",
          dataAgendada: nowLocal(),
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
    if (!q) return cirurgias;
    return cirurgias.filter(
      (c) => c.paciente.toLowerCase().includes(q) || c.medico.toLowerCase().includes(q) || c.procedimento.toLowerCase().includes(q),
    );
  }, [cirurgias, query]);

  function handleChange(field, value) {
    setForm((c) => ({ ...c, [field]: value }));
  }

  async function handleSubmit() {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const payload = buildCirurgiaPayload(form);
      const created = await createCirurgia(payload);
      setCirurgias((c) => [mapCirurgiaToRow(created), ...c]);
      navigate("/cirurgias", { replace: true });
    } catch (err) {
      setSubmitError(err?.message || "Nao foi possivel registrar a cirurgia.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <button type="button" className="screen-action" onClick={() => navigate("/cirurgias")}>Voltar</button>
        </div>
      </section>
      {isLoading ? <p className="loading">Carregando cirurgias...</p> : <CirurgiasTable cirurgias={filtered} />}
      <AddCirurgiaModal
        form={form}
        references={references}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={() => navigate("/cirurgias")}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </DashboardTemplate>
  );
}
