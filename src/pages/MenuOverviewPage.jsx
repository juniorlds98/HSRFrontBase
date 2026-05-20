import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { useAuth } from "../features/auth/AuthContext";
import { httpClient } from "../services/httpClient";

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "-";
}

function formatDateTime(value) {
  if (!value || typeof value !== "string") {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

async function fetchCollection(endpoint) {
  const { data } = await httpClient.get(endpoint);
  return Array.isArray(data) ? data : [];
}

export function MenuOverviewPage({
  title,
  subtitle,
  activeMenu,
  activeSidebar,
  sources,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sourceData, setSourceData] = useState({});

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      setError("");

      const entries = await Promise.all(
        sources.map(async (source) => {
          try {
            const records = await fetchCollection(source.endpoint);
            return [source.key, records, ""];
          } catch (requestError) {
            const message = requestError?.response?.data?.message ?? `Falha ao carregar ${source.label.toLowerCase()}.`;
            return [source.key, [], message];
          }
        }),
      );

      if (!mounted) return;

      const nextData = {};
      const errors = [];
      entries.forEach(([key, records, message]) => {
        nextData[key] = records;
        if (message) {
          errors.push(message);
        }
      });

      setSourceData(nextData);
      setError(errors.join(" "));
      setIsLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [sources]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  const normalizedQuery = query.trim().toLowerCase();

  const filteredData = useMemo(() => {
    const data = {};

    sources.forEach((source) => {
      const records = sourceData[source.key] ?? [];
      if (!normalizedQuery) {
        data[source.key] = records;
        return;
      }

      data[source.key] = records.filter((item) => JSON.stringify(item).toLowerCase().includes(normalizedQuery));
    });

    return data;
  }, [normalizedQuery, sourceData, sources]);

  return (
    <DashboardTemplate
      userName={user?.name ?? user?.username ?? "Usuário"}
      onLogout={handleLogout}
      activeMenu={activeMenu}
      activeSidebar={activeSidebar}
      searchValue={query}
      onSearchChange={setQuery}
    >
      <section className="screen-heading-row">
        <h1>{title}</h1>
      </section>

      {subtitle ? <p className="services-mode-indicator">{subtitle}</p> : null}
      {error ? <p className="services-feedback">{error}</p> : null}

      <section className="overview-cards-grid">
        {sources.map((source) => (
          <article key={source.key} className="overview-card">
            <span>{source.label}</span>
            <strong>{isLoading ? "..." : filteredData[source.key]?.length ?? 0}</strong>
          </article>
        ))}
      </section>

      {isLoading ? <p className="loading">Carregando dados...</p> : null}

      {!isLoading ? (
        <section className="overview-stack">
          {sources.map((source) => {
            const records = filteredData[source.key] ?? [];
            return (
              <article key={source.key} className="overview-panel">
                <header className="overview-panel-header">
                  <h2>{source.label}</h2>
                  <span>{records.length} registros</span>
                </header>

                {records.length === 0 ? (
                  <p className="loading">Nenhum registro encontrado.</p>
                ) : (
                  <div className="overview-table-wrapper">
                    <table className="overview-table">
                      <thead>
                        <tr>
                          {source.columns.map((column) => (
                            <th key={column.label} scope="col">
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {records.slice(0, 8).map((item, index) => (
                          <tr key={item.id ?? `${source.key}-${index}`}>
                            {source.columns.map((column) => {
                              const rawValue = column.render(item, { formatDateTime });
                              return <td key={column.label}>{normalizeText(rawValue)}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      ) : null}
    </DashboardTemplate>
  );
}

