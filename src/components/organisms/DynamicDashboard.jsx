import { useEffect, useState, useCallback } from "react";
import { DynamicWidget } from "./DynamicDashboardWidgets";
import {
  fetchDynamicDashboardConfig,
  WIDGET_TYPES,
} from "../../services/dynamicDashboardService";
import { canAccessScreen } from "../../services/permissionService";

/**
 * Dashboard Dinmico
 * - Renderiza widgets configuraveis do backend
 * - Validacao rigorosa de seguranca
 * - Auto-refresh configuravel
 */
export function DynamicDashboard() {
  const [widgets, setWidgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 min
  const [lastUpdated, setLastUpdated] = useState(null);

  // Verificar permissão
  const hasPermission = canAccessScreen("relatorio");

  /**
   * Carrega configuração do dashboard
   */
  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const config = await fetchDynamicDashboardConfig();

      if (config.widgets && Array.isArray(config.widgets)) {
        setWidgets(config.widgets);
        setRefreshInterval(config.meta?.refreshInterval || 300000);
        setLastUpdated(config.meta?.lastUpdated);
      }
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      setError(
        "Não foi possível carregar o dashboard. Tente novamente em alguns momentos."
      );
      setWidgets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Carrega dashboard ao montar
   */
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /**
   * Auto-refresh do dashboard
   */
  useEffect(() => {
    if (refreshInterval <= 0 || !hasPermission) return;

    const interval = setInterval(() => {
      loadDashboard();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, loadDashboard, hasPermission]);

  // Sem permissão
  if (!hasPermission) {
    return (
      <div className="dynamic-dashboard restricted">
        <div className="restricted-message">
          <span>ðŸ”’</span>
          <p>Você não tem permissão para acessar o dashboard dinâmico.</p>
        </div>
      </div>
    );
  }

  // Carregando
  if (isLoading) {
    return (
      <div className="dynamic-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (error) {
    return (
      <div className="dynamic-dashboard error">
        <div className="error-message">
          <span>âš ï¸</span>
          <p>{error}</p>
          <button onClick={loadDashboard} className="retry-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Sem widgets
  if (!widgets || widgets.length === 0) {
    return (
      <div className="dynamic-dashboard empty">
        <div className="empty-message">
          <span>ðŸ“Š</span>
          <p>Dashboard vazio. Configure widgets no backend.</p>
        </div>
      </div>
    );
  }

  // Agrupar widgets por linhas (máx 3 por linha)
  const widgetRows = [];
  for (let i = 0; i < widgets.length; i += 3) {
    widgetRows.push(widgets.slice(i, i + 3));
  }

  return (
    <div className="dynamic-dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Dinâmico</h2>
        {lastUpdated && (
          <p className="last-updated">  
            Atualizado em:{" "}
            {new Date(lastUpdated).toLocaleString("pt-BR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
        <button
          onClick={loadDashboard}
          className="refresh-button"
          title="Atualizar agora"
        >
          Atualizar
        </button>
      </div>

      <div className="dashboard-grid">
        {widgetRows.map((row, rowIdx) => (
          <div key={`row-${rowIdx}`} className="dashboard-row">
            {row.map((widget) => (
              <div
                key={widget.id}
                className={`widget-wrapper widget-type-${widget.type}`}
              >
                <DynamicWidget widget={widget} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="dashboard-footer">
        <p className="widget-count">
          Total de widgets: {widgets.length} | Auto-refresh a cada{" "}
          {(refreshInterval / 60000).toFixed(0)} min
        </p>
      </div>
    </div>
  );
}

