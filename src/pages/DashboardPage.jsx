import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardInsights } from "../components/organisms/DashboardInsights";
import { DashboardSummary } from "../components/organisms/DashboardSummary";
import { DynamicDashboard } from "../components/organisms/DynamicDashboard";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { fetchDashboardData } from "../services/dashboardService";
import { mapDashboardMetrics } from "../utils/dashboardMapper";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      const apiData = await fetchDashboardData();
      if (mounted) {
        setData(apiData);
        setIsLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(() => mapDashboardMetrics(data ?? {}), [data]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuario"}
      onLogout={handleLogout}
      activeMenu="dashboard"
      activeSidebar="pacientes"
    >
      {isLoading ? <p className="loading">Carregando metricas...</p> : null}
      {!isLoading ? (
        <>
          <DashboardSummary cards={metrics.cards} score={metrics.npsLikeScore} />
          <DashboardInsights
            surgeryStatus={metrics.surgeryStatus}
            atendimentoSteps={metrics.atendimentoSteps}
            monthlyAttendances={metrics.monthlyAttendances}
          />
          <DynamicDashboard />
        </>
      ) : null}
    </DashboardTemplate>
  );
}
