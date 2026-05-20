import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddConsentimentoModal } from "../components/organisms/AddConsentimentoModal";
import { ConsentimentosTable } from "../components/organisms/ConsentimentosTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { buildConsentimentoPayload, createConsentimento, fetchConsentimentoReferences, fetchConsentimentos } from "../services/consentimentosService";
import { fetchHostedFiles } from "../services/reportsService";
import { mapConsentimentoToRow } from "../utils/consentimentosMapper";

function nowLocal() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

const initialForm = {
  pacienteId: "",
  concedido: "true",
  canal: "EMAIL",
  finalidade: "LEMBRETE_CONSULTA",
  origemAtendimento: "",
  dataConsentimento: "",
  linkedFilePath: "",
};

export function ConsentimentosModalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [consentimentos, setConsentimentos] = useState([]);
  const [references, setReferences] = useState({ pacientes: [], arquivosRelatorios: [] });
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
        const [data, refs, arquivosRelatorios] = await Promise.all([
          fetchConsentimentos(),
          fetchConsentimentoReferences(),
          fetchHostedFiles(),
        ]);
        if (!mounted) return;
        setReferences({ ...refs, arquivosRelatorios });
        setConsentimentos(data.map(mapConsentimentoToRow));
        setForm((c) => ({
          ...c,
          pacienteId: refs.pacientes[0]?.id ? String(refs.pacientes[0].id) : "",
          dataConsentimento: nowLocal(),
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
    if (!q) return consentimentos;
    return consentimentos.filter(
      (c) =>
        c.pacienteId.toLowerCase().includes(q) ||
        c.canal.toLowerCase().includes(q) ||
        String(c.arquivoRelatorioNome || "").toLowerCase().includes(q),
    );
  }, [consentimentos, query]);

  function handleOpenReportFile(file) {
    navigate("/relatorios", {
      state: {
        selectedFilePath: file?.path ?? "",
        selectedFileName: file?.name ?? "",
      },
    });
  }

  function handleChange(field, value) { setForm((c) => ({ ...c, [field]: value })); }

  async function handleSubmit() {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const linkedFile = references.arquivosRelatorios.find((item) => item.path === form.linkedFilePath) ?? null;
      const created = await createConsentimento(buildConsentimentoPayload(form), linkedFile);
      setConsentimentos((c) => [mapConsentimentoToRow(created), ...c]);
      navigate("/consentimentos", { replace: true });
    } catch (err) {
      setSubmitError(err?.message || "Não foi possível registrar o consentimento.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() { await logout(); navigate("/", { replace: true }); }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuário"}
      onLogout={handleLogout}
      activeMenu="qualidade-menu"
      activeSidebar="consentimentos"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Consentimentos ({filtered.length})</h1>
        <div className="patients-toolbar">
          <button type="button" className="screen-action" onClick={() => navigate("/consentimentos")}>Voltar</button>
        </div>
      </section>
      {isLoading ? (
        <p className="loading">Carregando consentimentos...</p>
      ) : (
        <ConsentimentosTable consentimentos={filtered} onOpenReportFile={handleOpenReportFile} />
      )}
      <AddConsentimentoModal form={form} references={references} onChange={handleChange} onSubmit={handleSubmit} onClose={() => navigate("/consentimentos")} isSubmitting={isSubmitting} error={submitError} />
    </DashboardTemplate>
  );
}


