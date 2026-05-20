import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { runNlp2SqlQuestion } from "../../services/dynamicDashboardService";

/**
 * Cores seguras para gráficos e cards
 */
const SAFE_COLORS = [
  "#3498db",
  "#2ecc71",
  "#e74c3c",
  "#f39c12",
  "#9b59b6",
  "#1abc9c",
  "#34495e",
];

const NLP2SQL_COMMON_QUERIES_KEY = "hsr_nlp2sql_common_queries";
const NLP2SQL_MAX_COMMON_QUERIES = 10;

function escapeCsvCell(value) {
  if (value === null || value === undefined) return "";
  const normalized = String(value).replace(/\r?\n/g, " ");
  if (/[",;]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function buildCsvContent(columns, rows) {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeRows = Array.isArray(rows) ? rows : [];

  if (safeColumns.length === 0) return "";

  const header = safeColumns.map((column) => escapeCsvCell(column)).join(";");
  const body = safeRows.map((row) => {
    return safeColumns
      .map((column) => escapeCsvCell(row?.[column] ?? ""))
      .join(";");
  });

  return [header, ...body].join("\n");
}

function getStoredCommonQueries() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NLP2SQL_COMMON_QUERIES_KEY);
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => String(item || "").trim())
      .filter((item) => item.length > 0)
      .slice(0, NLP2SQL_MAX_COMMON_QUERIES);
  } catch {
    return [];
  }
}

function saveCommonQueries(queries) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    NLP2SQL_COMMON_QUERIES_KEY,
    JSON.stringify(queries.slice(0, NLP2SQL_MAX_COMMON_QUERIES))
  );
}

function parseNumericValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return NaN;

  const normalized = value
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "");

  if (!normalized || normalized === "-" || normalized === "." || normalized === "-.") {
    return NaN;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function buildNlp2SqlInsights(columns, rows, insightsPlan = {}) {
  if (!Array.isArray(columns) || !Array.isArray(rows) || rows.length === 0) {
    return { series: [], topItems: [], hasVisualData: false, explanation: "" };
  }

  const planMetricField = insightsPlan?.metric_field || null;
  const planLabelField = insightsPlan?.label_field || null;
  const planAggregation = String(insightsPlan?.aggregation || "distinct_count").toLowerCase();
  const planTopN = Number.isFinite(Number(insightsPlan?.top_n))
    ? Number(insightsPlan.top_n)
    : null;

  const preferredNumericColumns = columns.filter((column) => {
    const normalized = String(column).toLowerCase();
    return /(total|count|qtd|quantidade|valor|score|media|média|percent)/.test(
      normalized
    );
  });

  const nonIdNumericColumns = columns.filter((column) => {
    const normalized = String(column).toLowerCase();
    return normalized !== "id" && !normalized.endsWith("_id");
  });

  const numericCandidates = [
    ...preferredNumericColumns,
    ...nonIdNumericColumns,
    ...columns,
  ];

  const metricColumn = (planMetricField && columns.includes(planMetricField)
    ? planMetricField
    : numericCandidates.find((column) => {
        const sample = rows.slice(0, 20).map((row) => parseNumericValue(row?.[column]));
        const validCount = sample.filter((value) => Number.isFinite(value)).length;
        return validCount >= Math.max(1, Math.ceil(sample.length / 2));
      })) || columns[0];

  const preferredLabelColumn = columns.find((column) => {
    const normalized = String(column).toLowerCase();
    return /(nome|procedimento|dia|mes|mês|categoria|canal|status|etapa)/.test(
      normalized
    );
  });

  let labelColumn =
    (planLabelField && columns.includes(planLabelField) ? planLabelField : null) ||
    preferredLabelColumn ||
    columns.find((column) => {
      if (column === metricColumn) return false;
      const sample = rows.slice(0, 10).map((row) => row?.[column]);
      return sample.some((value) => typeof value === "string" && value.trim());
    }) ||
    columns.find((column) => column !== metricColumn);

  // Ensure labelColumn and metricColumn are not the same
  if (labelColumn === metricColumn) {
    labelColumn = columns.find((column) => column !== metricColumn) || metricColumn;
  }

  const grouped = new Map();
  rows.forEach((row, index) => {
    const rawLabel = row?.[labelColumn];
    const label = rawLabel !== null && rawLabel !== undefined && String(rawLabel).trim()
      ? String(rawLabel)
      : `Item ${index + 1}`;
    const rawMetric = row?.[metricColumn];

    if (!grouped.has(label)) {
      grouped.set(label, {
        count: 0,
        distinct: new Set(),
        sum: 0,
        numericCount: 0,
      });
    }

    const bucket = grouped.get(label);
    bucket.count += 1;
    if (rawMetric !== null && rawMetric !== undefined && String(rawMetric).trim() !== "") {
      bucket.distinct.add(String(rawMetric));
    }

    const numericValue = parseNumericValue(rawMetric);
    if (Number.isFinite(numericValue)) {
      bucket.sum += numericValue;
      bucket.numericCount += 1;
    }
  });

  const series = Array.from(grouped.entries()).map(([label, bucket]) => {
    let value = NaN;
    if (planAggregation === "count") {
      value = bucket.count;
    } else if (planAggregation === "frequency") {
      value = bucket.count;
    } else if (planAggregation === "distinct_count") {
      value = bucket.distinct.size;
    } else if (planAggregation === "avg") {
      value = bucket.numericCount > 0 ? bucket.sum / bucket.numericCount : NaN;
    } else {
      value = bucket.sum;
    }

    return {
      label,
      value,
    };
  }).filter((item) => Number.isFinite(item.value));

  if (series.length === 0) {
    return {
      series: [],
      topItems: [],
      hasVisualData: false,
      explanation:
        "Não foi possível calcular agregações para os campos selecionados. Tente outra métrica ou agregação.",
    };
  }

  const dynamicTopN =
    planTopN && planTopN > 0
      ? Math.min(planTopN, series.length)
      : series.length <= 5
      ? series.length
      : series.length <= 12
      ? 8
      : 10;

  const topItems = [...series]
    .sort((a, b) => b.value - a.value)
    .slice(0, dynamicTopN)
    .map((item, index) => ({
      ...item,
      fill: SAFE_COLORS[index % SAFE_COLORS.length],
    }));

  const explanation =
    (typeof insightsPlan?.explanation === "string" && insightsPlan.explanation.trim()) ||
    `Análise automática: usamos "${labelColumn}" como dimensão, "${metricColumn}" como métrica e agregação "${planAggregation}". Exibindo Top ${topItems.length} de ${series.length} categoria(s).`;

  const suggestedCharts = Array.isArray(insightsPlan?.suggested_charts)
    ? insightsPlan.suggested_charts
        .map((chart) => String(chart || "").toLowerCase())
        .filter((chart) => ["bar", "line", "area", "pie"].includes(chart))
    : [];

  return {
    series,
    topItems,
    hasVisualData: topItems.length > 0,
    topN: dynamicTopN,
    numericColumn: metricColumn,
    labelColumn,
    aggregation: planAggregation,
    explanation,
    suggestedCharts,
  };
}

function getChartTitle(chartType, topN) {
  if (chartType === "line") return `Top ${topN} em tendência`;
  if (chartType === "area") return `Top ${topN} em área`;
  if (chartType === "pie") return `Top ${topN} em participação`;
  return `Top ${topN} em barras`;
}

function InsightAutoChart({ chartType, data, numericColumn }) {
  if (chartType === "line") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 12, right: 12, left: 12, bottom: 36 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7ddcf" />
          <XAxis dataKey="label" angle={-20} textAnchor="end" height={54} />
          <YAxis />
          <Tooltip formatter={(value) => [value, numericColumn || "valor"]} />
          <Line type="monotone" dataKey="value" stroke="#3498db" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "area") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 12, bottom: 36 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7ddcf" />
          <XAxis dataKey="label" angle={-20} textAnchor="end" height={54} />
          <YAxis />
          <Tooltip formatter={(value) => [value, numericColumn || "valor"]} />
          <Area type="monotone" dataKey="value" stroke="#3498db" fill="#3498db" fillOpacity={0.5} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "pie") {
    if (data.length <= 1) {
      return (
        <div className="nlp2sql-single-category">
          <p>Apenas uma categoria foi retornada para esta pergunta.</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={92} label>
            {data.map((item, index) => (
              <Cell key={`pie-${index}`} fill={item.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, numericColumn || "valor"]} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 12, right: 12, left: 24, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7ddcf" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="label" width={150} />
        <Tooltip formatter={(value) => [value, numericColumn || "valor"]} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((item, index) => (
            <Cell key={`bar-${index}`} fill={item.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Widget de Métrica (valor com tendência)
 */
export function MetricWidget({ data, title, subtitle }) {
  if (!data || typeof data.value !== "string") return null;

  const value = parseFloat(data.value);
  const trend = data.trend || 0;
  const isPositive = trend >= 0;

  return (
    <div className="dynamic-widget metric-widget">
      <div className="metric-header">
        <h3>{title}</h3>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        {data.unit && <span className="metric-unit">{data.unit}</span>}
      </div>
      {trend !== 0 && (
        <div className={`metric-trend ${isPositive ? "positive" : "negative"}`}>
          <span className="trend-arrow">{isPositive ? "â†‘" : "â†“"}</span>
          <span className="trend-value">{Math.abs(trend)}%</span>
          {data.trendLabel && (
            <span className="trend-label">{data.trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Widget de Gráfico (bar, line, pie, area)
 */
export function ChartWidget({ data, title, subtitle }) {
  if (!data || !data.dataPoints || data.dataPoints.length === 0) return null;

  const chartData = data.dataPoints.map((point, idx) => ({
    name: point.label,
    value: parseFloat(point.value),
    fill: SAFE_COLORS[idx % SAFE_COLORS.length],
  }));

  const chartHeight = 300;
  const margin = { top: 20, right: 30, left: 0, bottom: 60 };

  return (
    <div className="dynamic-widget chart-widget">
      <div className="chart-header">
        <h3>{title}</h3>
        {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={chartHeight}>
          {data.chartType === "bar" ? (
            <BarChart data={chartData} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <Bar dataKey="value" fill="#3498db" radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : data.chartType === "line" ? (
            <LineChart data={chartData} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3498db"
                strokeWidth={2}
                dot={{ fill: "#3498db", r: 4 }}
              />
            </LineChart>
          ) : data.chartType === "area" ? (
            <AreaChart data={chartData} margin={margin}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                fill="#3498db"
                stroke="#3498db"
                strokeWidth={2}
                opacity={0.7}
              />
            </AreaChart>
          ) : data.chartType === "pie" ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </PieChart>
          ) : null}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Widget de Tabela
 */
export function TableWidget({ data, title, subtitle }) {
  if (!data || !data.columns || !data.rows || data.rows.length === 0)
    return null;

  return (
    <div className="dynamic-widget table-widget">
      <div className="table-header">
        <h3>{title}</h3>
        {subtitle && <p className="table-subtitle">{subtitle}</p>}
      </div>
      <div className="table-container">
        <table className="dynamic-table">
          <thead>
            <tr>
              {data.columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? "even" : "odd"}>
                {data.columns.map((col) => (
                  <td key={`${rowIdx}-${col.key}`}>{row[col.key] || "-"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Widget de Card
 */
export function CardWidget({ data, title, subtitle }) {
  if (!data) return null;

  return (
    <div
      className="dynamic-widget card-widget"
      style={{ backgroundColor: data.bgColor || "#f0f2f5" }}
    >
      <div className="card-content">
        {data.icon && <span className="card-icon">{data.icon}</span>}
        <div className="card-text">
          <h3>{title}</h3>
          {data.value && <p className="card-value">{data.value}</p>}
          {data.description && (
            <p className="card-description">{data.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Widget NLP2SQL
 */
function ColumnSelector({
  columns,
  labelField,
  metricField,
  aggregation,
  onChange,
}) {
  if (!Array.isArray(columns) || columns.length < 2) return null;

  return (
    <div className="nlp2sql-column-selector">
      <label>
        <span title="Dimensão: campo usado para categorizar os dados (ex.: médico, mês, status).">
          Dimensão
        </span>
        <select value={labelField} onChange={(event) => onChange("labelField", event.target.value)}>
          <option value="">Automático</option>
          {columns.map((col) => (
            <option key={`label-${col}`} value={col}>
              {col}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span title="Métrica: campo usado para calcular valores (ex.: quantidade, valor, id_paciente).">
          Métrica
        </span>
        <select value={metricField} onChange={(event) => onChange("metricField", event.target.value)}>
          <option value="">Automático</option>
          {columns.map((col) => (
            <option key={`metric-${col}`} value={col}>
              {col}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span title="Agregação: como calcular o total da métrica selecionada.">
          Agregação
        </span>
        <select value={aggregation} onChange={(event) => onChange("aggregation", event.target.value)}>
          <option value="distinct_count">Contagem distinta</option>
          <option value="count">Contagem</option>
          <option value="frequency">Frequência</option>
          <option value="sum">Soma</option>
          <option value="avg">Média</option>
        </select>
      </label>
    </div>
  );
}

function formatAggregationValue(value, metricField, aggregation) {
  if (!Number.isFinite(value)) return "-";

  const normalized = String(metricField || "").toLowerCase();
  const isMoneyMetric = /(valor|preco|preço|custo|receita|faturamento|ticket|mensalidade|mensal|orcamento|orçamento|saldo|pagamento|pagamentos)/.test(normalized);

  if (isMoneyMetric && (aggregation === "sum" || aggregation === "avg")) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  const fractionDigits = aggregation === "avg" ? 2 : 0;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function computeAggregation(rows, metricField, aggregation) {
  if (!Array.isArray(rows) || rows.length === 0 || !metricField) {
    return { label: "Sem dados para agregação", value: "-" };
  }

  const values = rows
    .map((row) => row?.[metricField])
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== "");

  if (values.length === 0) {
    return { label: `Sem valores válidos em ${metricField}`, value: "-" };
  }

  if (aggregation === "count") {
    return {
      label: `Total de registros em ${metricField}`,
      value: formatAggregationValue(values.length, metricField, aggregation),
    };
  }

  if (aggregation === "frequency") {
    return {
      label: `Frequência de ${metricField}`,
      value: formatAggregationValue(values.length, metricField, aggregation),
    };
  }

  if (aggregation === "distinct_count") {
    const uniqueCount = new Set(values.map((value) => String(value))).size;
    return {
      label: `Total distinto de ${metricField}`,
      value: formatAggregationValue(uniqueCount, metricField, aggregation),
    };
  }

  const numericValues = values
    .map((value) => parseNumericValue(value))
    .filter((value) => Number.isFinite(value));

  if (numericValues.length === 0) {
    return { label: `Métrica ${metricField} não é numérica`, value: "-" };
  }

  const sum = numericValues.reduce((acc, current) => acc + current, 0);
  if (aggregation === "avg") {
    const avg = sum / numericValues.length;
    return {
      label: `Média de ${metricField}`,
      value: formatAggregationValue(avg, metricField, aggregation),
    };
  }

  return {
    label: `Soma de ${metricField}`,
    value: formatAggregationValue(sum, metricField, aggregation),
  };
}

export function Nlp2SqlWidget({ data, title, subtitle }) {
  const [question, setQuestion] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = React.useState("");
  const [commonQueries, setCommonQueries] = React.useState(() => getStoredCommonQueries());
  const [actionFeedback, setActionFeedback] = React.useState("");
  const [manualSelection, setManualSelection] = React.useState({
    labelField: "",
    metricField: "",
    aggregation: "distinct_count",
  });

  const effectiveInsightsPlan = React.useMemo(() => {
    const basePlan = result?.insightsPlan || {};
    return {
      ...basePlan,
      label_field: manualSelection.labelField || basePlan?.label_field,
      metric_field: manualSelection.metricField || basePlan?.metric_field,
      aggregation: manualSelection.aggregation,
    };
  }, [result, manualSelection]);

  const insights = React.useMemo(
    () => buildNlp2SqlInsights(result?.columns || [], result?.rows || [], effectiveInsightsPlan),
    [result, effectiveInsightsPlan]
  );
  const chartSequence = React.useMemo(() => {
    const fromPlan = insights?.suggestedCharts || [];
    if (fromPlan.length >= 2) return fromPlan.slice(0, 2);
    if (fromPlan.length === 1) return [fromPlan[0], fromPlan[0] === "pie" ? "bar" : "pie"];
    return ["bar", "pie"];
  }, [insights]);

  const canExportCsv =
    Array.isArray(result?.columns) &&
    result.columns.length > 0 &&
    Array.isArray(result?.rows) &&
    result.rows.length > 0;

  React.useEffect(() => {
    if (!actionFeedback) return undefined;
    const timer = window.setTimeout(() => setActionFeedback(""), 2500);
    return () => window.clearTimeout(timer);
  }, [actionFeedback]);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setIsLoading(true);
    const response = await runNlp2SqlQuestion(trimmedQuestion);
    setResult(response);
    setLastSubmittedQuestion(trimmedQuestion);
    setManualSelection({ labelField: "", metricField: "", aggregation: "distinct_count" });
    setIsLoading(false);
  }

  function handleExportCsv() {
    if (!canExportCsv) {
      setActionFeedback("Nenhum dado para exportar.");
      return;
    }

    const csvContent = buildCsvContent(result.columns, result.rows);
    if (!csvContent) {
      setActionFeedback("Nenhum dado para exportar.");
      return;
    }

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nlp2sql_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setActionFeedback("CSV gerado com sucesso.");
  }

  function handleSaveCommonQuery() {
    const candidate = (question.trim() || lastSubmittedQuestion || "").trim();
    if (!candidate) {
      setActionFeedback("Digite ou execute uma consulta para salvar.");
      return;
    }

    setCommonQueries((current) => {
      const next = [candidate, ...current.filter((item) => item !== candidate)].slice(
        0,
        NLP2SQL_MAX_COMMON_QUERIES
      );
      saveCommonQueries(next);
      return next;
    });
    setActionFeedback("Consulta salva nas comuns.");
  }

  function handleColumnChange(field, value) {
    setManualSelection((current) => {
      const next = { ...current, [field]: value };
      if (next.labelField && next.metricField && next.labelField === next.metricField) {
        if (field === "labelField") {
          next.metricField = "";
        } else {
          next.labelField = "";
        }
      }
      return next;
    });
  }

  const selectedMetric = manualSelection.metricField || insights.numericColumn;
  const aggregationSummary = React.useMemo(
    () => computeAggregation(result?.rows || [], selectedMetric, manualSelection.aggregation),
    [result, selectedMetric, manualSelection.aggregation]
  );

  return (
    <div className="dynamic-widget nlp2sql-widget">
      <div className="nlp2sql-header">
        <h3>{title}</h3>
        {subtitle && <p className="nlp2sql-subtitle">{subtitle}</p>}
        {data?.description && <p className="nlp2sql-description">{data.description}</p>}
      </div>

      <form className="nlp2sql-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="nlp2sql-input"
          value={question}
          maxLength={data?.maxQuestionLength || 280}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={data?.inputPlaceholder || "Pergunte sobre os dados"}
        />
        <button
          type="submit"
          className="nlp2sql-button"
          disabled={isLoading || data?.enabled === false}
        >
          {isLoading ? "Consultando..." : "Consultar"}
        </button>
      </form>

      <div className="nlp2sql-actions">
        <button
          type="button"
          className="nlp2sql-secondary-button"
          onClick={handleExportCsv}
          disabled={!canExportCsv}
        >
          Gerar CSV
        </button>
        <button
          type="button"
          className="nlp2sql-secondary-button"
          onClick={handleSaveCommonQuery}
        >
          Salvar consulta
        </button>
      </div>

      {actionFeedback ? <p className="nlp2sql-meta">{actionFeedback}</p> : null}

      {commonQueries.length > 0 ? (
        <div className="nlp2sql-common-queries">
          <p>Consultas comuns</p>
          <div className="nlp2sql-common-queries-list">
            {commonQueries.map((savedQuery) => (
              <button
                key={savedQuery}
                type="button"
                className="nlp2sql-chip"
                onClick={() => setQuestion(savedQuery)}
                title={savedQuery}
              >
                {savedQuery}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {data?.enabled === false && (
        <p className="nlp2sql-guardrail">Módulo NLP2SQL está desativado no backend.</p>
      )}

      {result && (
        <div className="nlp2sql-result">
          <p className="nlp2sql-answer">{result.answer}</p>
          {typeof result.rowCount === "number" ? (
            <p className="nlp2sql-meta">Linhas retornadas: {result.rowCount}</p>
          ) : null}

          {result.guardrail?.blocked && result.guardrail?.reason && (
            <p className="nlp2sql-guardrail">Bloqueado: {result.guardrail.reason}</p>
          )}

          {result.generatedSql && (
            <details className="nlp2sql-sql">
              <summary>SQL gerado</summary>
              <pre>{result.generatedSql}</pre>
            </details>
          )}

          {Array.isArray(result.columns) && result.columns.length > 0 && (
            <div className="table-container">
              <table className="dynamic-table">
                <thead>
                  <tr>
                    {result.columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(result.rows || []).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? "even" : "odd"}>
                      {result.columns.map((column) => (
                        <td key={`${rowIndex}-${column}`}>{row[column] || "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {Array.isArray(result.columns) && result.columns.length > 1 && (
            <>
              <ColumnSelector
                columns={result.columns}
                labelField={manualSelection.labelField}
                metricField={manualSelection.metricField}
                aggregation={manualSelection.aggregation}
                onChange={handleColumnChange}
              />
              <div className="nlp2sql-aggregation-card">
                <p className="nlp2sql-aggregation-label">{aggregationSummary.label}</p>
                <strong className="nlp2sql-aggregation-value">{aggregationSummary.value}</strong>
              </div>
            </>
          )}

          {insights.hasVisualData && (
            <div className="nlp2sql-insights">
              <h4>Correlações visuais automáticas</h4>
              {insights.explanation ? (
                <div className="nlp2sql-insight-alert" role="alert">
                  {insights.explanation}
                </div>
              ) : null}

              <div className="nlp2sql-top5">
                <h5>Top {insights.topItems.length}</h5>
                <ol>
                  {insights.topItems.map((item) => (
                    <li key={`${item.label}-${item.value}`}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="nlp2sql-charts-grid">
                <div className="nlp2sql-chart-card">
                  <h5>{getChartTitle(chartSequence[0], insights.topItems.length)}</h5>
                  <InsightAutoChart
                    chartType={chartSequence[0]}
                    data={insights.topItems}
                    numericColumn={insights.numericColumn}
                  />
                </div>

                <div className="nlp2sql-chart-card">
                  <h5>{getChartTitle(chartSequence[1], insights.topItems.length)}</h5>
                  <InsightAutoChart
                    chartType={chartSequence[1]}
                    data={insights.topItems}
                    numericColumn={insights.numericColumn}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Renderizador universal de widgets
 */
export function DynamicWidget({ widget }) {
  if (!widget) return null;

  const { type, title, subtitle, data, id } = widget;

  switch (type) {
    case "metric":
      return (
        <MetricWidget key={id} data={data} title={title} subtitle={subtitle} />
      );
    case "chart":
      return (
        <ChartWidget key={id} data={data} title={title} subtitle={subtitle} />
      );
    case "table":
      return (
        <TableWidget key={id} data={data} title={title} subtitle={subtitle} />
      );
    case "card":
      return (
        <CardWidget key={id} data={data} title={title} subtitle={subtitle} />
      );
    case "nlp2sql":
      return (
        <Nlp2SqlWidget key={id} data={data} title={title} subtitle={subtitle} />
      );
    default:
      console.warn(`Tipo de widget desconhecido: ${type}`);
      return null;
  }
}


