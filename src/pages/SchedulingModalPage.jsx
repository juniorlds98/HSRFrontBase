import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SchedulingCalendar } from "../components/organisms/SchedulingCalendar";
import { SchedulingModal } from "../components/organisms/SchedulingModal";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import {
  buildMonthCalendar,
  createAgendamento,
  fetchAgendamentos,
  fetchSchedulingReferences,
  toMonthLabel,
} from "../services/schedulingService";
import { groupEventsByDay, mapAgendamentoToEvent } from "../utils/schedulingMapper";

const initialForm = {
  pacienteId: "",
  medicoId: "",
  etapaId: "",
  statusId: "",
  dataHora: "",
};

export function SchedulingModalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [references, setReferences] = useState({ pacientes: [], medicos: [], etapas: [], status: [] });
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [form, setForm] = useState(initialForm);

  function getApiErrorMessage(error, fallbackMessage) {
    const serviceMessage = error?.message;
    if (typeof serviceMessage === "string" && serviceMessage.trim()) {
      return serviceMessage;
    }

    const apiMessage = error?.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return apiMessage;
    }

    return fallbackMessage;
  }

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [agData, refsData] = await Promise.all([fetchAgendamentos(), fetchSchedulingReferences()]);
        if (!mounted) return;

        setAgendamentos(agData.map(mapAgendamentoToEvent));
        setReferences(refsData);

        setForm((current) => ({
          ...current,
          pacienteId: refsData.pacientes[0]?.id ? String(refsData.pacientes[0].id) : "",
          medicoId: refsData.medicos[0]?.id ? String(refsData.medicos[0].id) : "",
          etapaId: refsData.etapas[0]?.id ? String(refsData.etapas[0].id) : "",
          statusId: refsData.status[0]?.id ? String(refsData.status[0].id) : "",
          dataHora: current.dataHora || new Date().toISOString().slice(0, 16),
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

  const filteredEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return agendamentos;
    }

    return agendamentos.filter(
      (item) => item.title.toLowerCase().includes(normalized) || item.subtitle.toLowerCase().includes(normalized),
    );
  }, [agendamentos, query]);

  const cells = useMemo(() => buildMonthCalendar(monthDate), [monthDate]);
  const eventsByDay = useMemo(() => groupEventsByDay(filteredEvents), [filteredEvents]);

  function changeMonth(delta) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  function handleFormChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateAgendamento() {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const created = await createAgendamento(form);
      setAgendamentos((current) => [mapAgendamentoToEvent(created), ...current]);
      navigate("/agendamentos", { replace: true });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Não foi possível criar o agendamento. Confira os campos selecionados."));
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
      activeMenu="gestao"
      activeSidebar="agendamentos"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Calendario</h1>
        <button type="button" className="screen-action" onClick={() => navigate("/agendamentos")}> 
          + Adicionar Evento
        </button>
      </section>

      {isLoading ? (
        <p className="loading">Carregando agendamentos...</p>
      ) : (
        <SchedulingCalendar
          monthLabel={toMonthLabel(monthDate)}
          cells={cells}
          eventsByDay={eventsByDay}
          onPrevMonth={() => changeMonth(-1)}
          onNextMonth={() => changeMonth(1)}
        />
      )}
      <SchedulingModal
        form={form}
        references={references}
        onChange={handleFormChange}
        onSubmit={handleCreateAgendamento}
        onClose={() => navigate("/agendamentos")}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </DashboardTemplate>
  );
}


