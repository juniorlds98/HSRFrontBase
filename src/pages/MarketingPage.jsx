import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccordionPanel } from "../components/molecules/AccordionPanel";
import { DateRangeFilters } from "../components/molecules/DateRangeFilters";
import { LeadTimelinePanel } from "../components/organisms/marketing/LeadTimelinePanel";
import { LeadsAlertsPanel } from "../components/organisms/marketing/LeadsAlertsPanel";
import { LeadsConversionPanel } from "../components/organisms/marketing/LeadsConversionPanel";
import { LeadsKanbanPanel } from "../components/organisms/marketing/LeadsKanbanPanel";
import { LeadsNextActionsPanel } from "../components/organisms/marketing/LeadsNextActionsPanel";
import { LeadsPortfolioPanel } from "../components/organisms/marketing/LeadsPortfolioPanel";
import { MarketingAdvancedFilters } from "../components/organisms/marketing/MarketingAdvancedFilters";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { httpClient } from "../services/httpClient";
import { buildDateQueryParams, formatCurrency, formatDateTime, toDateInputValue } from "../utils/analyticsFormatters";

function isOverdue(item) {
  return Boolean(item?.slaAtrasado);
}

function applyAdvancedFilters(base, filters) {
  const params = { ...base };
  const entries = Object.entries(filters);

  entries.forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined) {
      return;
    }
    params[key] = value;
  });

  return params;
}

export function MarketingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const today = new Date();
  const [fromDate, setFromDate] = useState(toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [toDate, setToDate] = useState(toDateInputValue(today));

  const [advancedFilters, setAdvancedFilters] = useState({
    canal: "",
    origem: "",
    responsavel: "",
    etapa: "",
    status: "",
    cidade: "",
    tag: "",
    scoreMin: "",
    scoreMax: "",
    valorMin: "",
    valorMax: "",
  });

  const [filters, setFilters] = useState({ fromDate, toDate, ...advancedFilters });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      setError("");

      try {
        const params = applyAdvancedFilters(buildDateQueryParams(filters.fromDate, filters.toDate), {
          canal: filters.canal,
          origem: filters.origem,
          responsavel: filters.responsavel,
          etapa: filters.etapa,
          status: filters.status,
          cidade: filters.cidade,
          tag: filters.tag,
          scoreMin: filters.scoreMin,
          scoreMax: filters.scoreMax,
          valorMin: filters.valorMin,
          valorMax: filters.valorMax,
        });

        const { data: response } = await httpClient.get("/api/v1/analytics/leads", {
          params,
        });

        if (!mounted) return;
        setData(response);
        setSelectedLead((current) => {
          if (!current?.pacienteId) return null;
          return (response?.leads ?? []).find((item) => item.pacienteId === current.pacienteId) ?? null;
        });
      } catch (requestError) {
        if (!mounted) return;
        setError(requestError?.response?.data?.message ?? "Falha ao carregar dados de leads.");
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
  }, [filters]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  function applyFilters() {
    setFilters({
      fromDate,
      toDate,
      ...advancedFilters,
    });
  }

  const leads = useMemo(() => (Array.isArray(data?.leads) ? data.leads : []), [data]);
  const kanban = useMemo(() => data?.kanban ?? {}, [data]);
  const conversion = useMemo(() => (Array.isArray(data?.conversoesFunil) ? data.conversoesFunil : []), [data]);

  const nextActions = useMemo(() => {
    return [...leads]
      .filter((item) => item?.proximaAcaoDataHora)
      .sort((left, right) => new Date(left.proximaAcaoDataHora).getTime() - new Date(right.proximaAcaoDataHora).getTime())
      .slice(0, 8);
  }, [leads]);

  const alerts = useMemo(() => {
    const rows = [];
    leads.forEach((lead) => {
      (lead?.alertas ?? []).forEach((alert) => {
        rows.push({
          pacienteId: lead.pacienteId,
          leadNome: lead.nome,
          ...alert,
        });
      });
    });
    return rows.slice(0, 10);
  }, [leads]);

  function updateAdvancedFilter(key, value) {
    setAdvancedFilters((current) => ({ ...current, [key]: value }));
  }

  function openPatient(lead) {
    navigate("/pacientes", {
      state: {
        query: lead?.nome ?? "",
        highlightPatientId: lead?.pacienteId ?? null,
      },
    });
  }

  function openWhatsapp(lead) {
    navigate("/mensagens", {
      state: {
        patientId: lead?.pacienteId ?? null,
        phone: lead?.telefone ?? "",
      },
    });
  }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuário"}
      onLogout={handleLogout}
      activeMenu="marketing"
      activeSidebar="relatorios"
      searchValue=""
    >
      <section className="screen-heading-row">
        <h1>Leads e Funil Comercial</h1>
      </section>

      <DateRangeFilters
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onApply={applyFilters}
      />

      <MarketingAdvancedFilters filters={advancedFilters} onChange={updateAdvancedFilter} />

      <p className="services-mode-indicator">
        Operacao comercial unificada com score, SLA, timeline, conversao e visao Kanban.
      </p>

      {error ? <p className="services-feedback">{error}</p> : null}

      <section className="overview-cards-grid">
        <article className="overview-card">
          <span>Total de leads</span>
          <strong>{isLoading ? "..." : data?.totalLeads ?? 0}</strong>
        </article>
        <article className="overview-card">
          <span>Novos</span>
          <strong>{isLoading ? "..." : data?.novos ?? 0}</strong>
        </article>
        <article className="overview-card">
          <span>Contato</span>
          <strong>{isLoading ? "..." : data?.contato ?? 0}</strong>
        </article>
        <article className="overview-card">
          <span>Triagem</span>
          <strong>{isLoading ? "..." : data?.triagem ?? 0}</strong>
        </article>
        <article className="overview-card">
          <span>Qualificados</span>
          <strong>{isLoading ? "..." : data?.qualificados ?? 0}</strong>
        </article>
        <article className="overview-card">
          <span>Pipeline bruto</span>
          <strong>{isLoading ? "..." : formatCurrency(data?.pipelineBruto)}</strong>
        </article>
        <article className="overview-card">
          <span>Pipeline ponderado</span>
          <strong>{isLoading ? "..." : formatCurrency(data?.pipelinePonderado)}</strong>
        </article>
        <article className="overview-card">
          <span>SLA atrasado</span>
          <strong>{isLoading ? "..." : data?.slaAtrasados ?? 0}</strong>
        </article>
        <article className="overview-card">
          <span>Sem follow-up</span>
          <strong>{isLoading ? "..." : data?.semFollowUp ?? 0}</strong>
        </article>
      </section>

      {isLoading ? <p className="loading">Carregando funil de leads...</p> : null}

      {!isLoading ? (
        <section className="overview-stack">
          <AccordionPanel title="Proximas acoes" subtitle="Prioridade comercial" defaultOpen>
            <LeadsNextActionsPanel items={nextActions} formatDateTime={formatDateTime} isOverdue={isOverdue} showHeader={false} />
          </AccordionPanel>

          <AccordionPanel title="Carteira de leads" subtitle={`${leads.length} registros`} defaultOpen>
            <LeadsPortfolioPanel
              leads={leads}
              formatCurrency={formatCurrency}
              formatDateTime={formatDateTime}
              isOverdue={isOverdue}
              onTimeline={setSelectedLead}
              onOpenPatient={openPatient}
              showHeader={false}
            />
          </AccordionPanel>

          <AccordionPanel title="Conversao do funil" subtitle="Etapa a etapa">
            <LeadsConversionPanel conversion={conversion} showHeader={false} />
          </AccordionPanel>

          <AccordionPanel title="Kanban comercial" subtitle="Visao por etapa">
            <LeadsKanbanPanel kanban={kanban} onSelectLead={setSelectedLead} showHeader={false} />
          </AccordionPanel>

          <AccordionPanel title="Alertas automaticos" subtitle="Monitoramento">
            <LeadsAlertsPanel alerts={alerts} showHeader={false} />
          </AccordionPanel>

          <LeadTimelinePanel
            lead={selectedLead}
            formatDateTime={formatDateTime}
            onOpenPatient={openPatient}
            onOpenWhatsapp={openWhatsapp}
            onClose={() => setSelectedLead(null)}
          />
        </section>
      ) : null}
    </DashboardTemplate>
  );
}

