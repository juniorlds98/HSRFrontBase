import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateRangeFilters } from "../components/molecules/DateRangeFilters";
import { FinancePayrollPanel } from "../components/organisms/finance/FinancePayrollPanel";
import { FinanceProcedurePanel } from "../components/organisms/finance/FinanceProcedurePanel";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { httpClient } from "../services/httpClient";
import { buildDateQueryParams, formatCurrency, toDateInputValue } from "../utils/analyticsFormatters";

export function FinancePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const today = new Date();
  const [fromDate, setFromDate] = useState(toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [toDate, setToDate] = useState(toDateInputValue(today));

  const [filters, setFilters] = useState({ fromDate, toDate });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      setError("");

      try {
        const { data: response } = await httpClient.get("/api/v1/analytics/financeiro", {
          params: buildDateQueryParams(filters.fromDate, filters.toDate),
        });

        if (!mounted) return;
        setData(response);
      } catch (requestError) {
        if (!mounted) return;
        setError(requestError?.response?.data?.message ?? "Falha ao carregar dados financeiros.");
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
    setFilters({ fromDate, toDate });
  }

  const procedureRows = useMemo(() => (Array.isArray(data?.procedimentos) ? data.procedimentos : []), [data]);
  const payrollRows = useMemo(() => (Array.isArray(data?.folha) ? data.folha : []), [data]);

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuário"}
      onLogout={handleLogout}
      activeMenu="financeiro"
      activeSidebar="relatorios"
      searchValue=""
    >
      <section className="screen-heading-row">
        <h1>Financeiro Cirurgico</h1>
      </section>

      <DateRangeFilters
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onApply={applyFilters}
      />

      <p className="services-mode-indicator">
        Dados vindos do backend analytics. Valores financeiros e salariais sao estimativas para facilitar testes e visualizacao.
      </p>

      {error ? <p className="services-feedback">{error}</p> : null}

      <section className="overview-cards-grid">
        <article className="overview-card">
          <span>Cirurgias realizadas</span>
          <strong>{isLoading ? "..." : data?.cirurgiasRealizadas ?? 0}</strong>
        </article>
        <article className="overview-card">
          <span>Cirurgias agendadas</span>
          <strong>{isLoading ? "..." : data?.cirurgiasAgendadas ?? 0}</strong>
        </article>
        <article className="overview-card">
          <span>Faturamento estimado</span>
          <strong>{isLoading ? "..." : formatCurrency(data?.faturamentoEstimado)}</strong>
        </article>
        <article className="overview-card">
          <span>Custo estimado</span>
          <strong>{isLoading ? "..." : formatCurrency(data?.custoEstimado)}</strong>
        </article>
        <article className="overview-card">
          <span>Margem estimada</span>
          <strong>{isLoading ? "..." : formatCurrency(data?.margemEstimada)}</strong>
        </article>
        <article className="overview-card">
          <span>Folha mensal estimada</span>
          <strong>{isLoading ? "..." : formatCurrency(data?.folhaMensalEstimada)}</strong>
        </article>
      </section>

      {isLoading ? <p className="loading">Carregando dados financeiros...</p> : null}

      {!isLoading ? (
        <section className="overview-stack">
          <FinanceProcedurePanel rows={procedureRows} formatCurrency={formatCurrency} />
          <FinancePayrollPanel rows={payrollRows} formatCurrency={formatCurrency} />
        </section>
      ) : null}
    </DashboardTemplate>
  );
}

