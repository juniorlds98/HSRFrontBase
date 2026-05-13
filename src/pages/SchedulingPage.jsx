import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SchedulingCalendar } from "../components/organisms/SchedulingCalendar";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { buildMonthCalendar, fetchAgendamentos, toMonthLabel } from "../services/schedulingService";
import { mapAgendamentoToEvent, groupEventsByDay } from "../utils/schedulingMapper";

export function SchedulingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [monthDate, setMonthDate] = useState(() => new Date());

  useEffect(() => {
    let mounted = true;

    async function loadAgendamentos() {
      setIsLoading(true);
      try {
        const data = await fetchAgendamentos();
        if (!mounted) return;
        setAgendamentos(data.map(mapAgendamentoToEvent));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadAgendamentos();

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

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="gestao"
      activeSidebar="agendamentos"
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>Calendario</h1>
        <button type="button" className="screen-action" onClick={() => navigate("/agendamentos/modal")}> 
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
    </DashboardTemplate>
  );
}
