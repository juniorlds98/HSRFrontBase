import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddCaseModal } from "../components/organisms/AddCaseModal";
import { CasesTable } from "../components/organisms/CasesTable";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { buildCasePayload, createCase, fetchCaseReferences, fetchCases } from "../services/casesService";
import { mapCaseToRow } from "../utils/casesMapper";

const initialForm = {
  titulo: "",
  descricao: "",
  pacienteId: "",
  medicoId: "",
  agendamentoId: "",
  atendimentoId: "",
  categoria: "EVENTO_ASSISTENCIAL",
  gravidade: "MEDIA",
  status: "ABERTO",
  dataOcorrencia: "",
};

function nowLocalDateTime() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function CasesModalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [references, setReferences] = useState({ pacientes: [], medicos: [], agendamentos: [], atendimentos: [] });
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [casesData, refsData] = await Promise.all([fetchCases(), fetchCaseReferences()]);
        if (!mounted) return;

        setReferences(refsData);
        setCases(casesData.map((item) => mapCaseToRow(item, refsData)));
        setForm((current) => ({
          ...current,
          pacienteId: refsData.pacientes[0]?.id ? String(refsData.pacientes[0].id) : "",
          medicoId: refsData.medicos[0]?.id ? String(refsData.medicos[0].id) : "",
          agendamentoId: refsData.agendamentos[0]?.id ? String(refsData.agendamentos[0].id) : "",
          atendimentoId: refsData.atendimentos[0]?.id ? String(refsData.atendimentos[0].id) : "",
          dataOcorrencia: current.dataOcorrencia || nowLocalDateTime(),
        }));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCases = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return cases;
    }

    return cases.filter((item) => {
      return (
        item.title.toLowerCase().includes(normalized) ||
        item.patient.toLowerCase().includes(normalized) ||
        item.doctor.toLowerCase().includes(normalized) ||
        item.status.toLowerCase().includes(normalized)
      );
    });
  }, [cases, query]);

  function handleFormChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateCase() {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const payload = buildCasePayload(form);
      const created = await createCase(payload);
      setCases((current) => [mapCaseToRow(created, references), ...current]);
      navigate("/casos", { replace: true });
    } catch (error) {
      const message = error?.message;
      setSubmitError(
        typeof message === "string" && message.trim()
          ? message
          : "Não foi possível registrar o caso. Verifique os campos e tente novamente.",
      );
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
      userName={user?.name ?? user?.username ?? "Usuário"}
      onLogout={handleLogout}
      activeMenu="casos-menu"
      activeSidebar="casos"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Casos ({filteredCases.length})</h1>

        <div className="patients-toolbar">
          <div className="services-toggle">
            <button type="button">Rascunho</button>
            <button type="button" className="active">
              Em fluxo
            </button>
          </div>

          <button type="button" className="screen-action" onClick={() => navigate("/casos")}> 
            + Registrar Caso
          </button>
        </div>
      </section>

      {isLoading ? <p className="loading">Carregando casos...</p> : <CasesTable cases={filteredCases} />}

      <AddCaseModal
        form={form}
        references={references}
        onChange={handleFormChange}
        onSubmit={handleCreateCase}
        onClose={() => navigate("/casos")}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </DashboardTemplate>
  );
}


