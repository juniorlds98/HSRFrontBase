import { httpClient } from "./httpClient";

/**
 * Configuração segura para dashboard dinâmico
 * Validação rigorosa de dados do backend
 */

const WIDGET_TYPES = {
  METRIC: "metric",
  CHART: "chart",
  TABLE: "table",
  CARD: "card",
  NLP2SQL: "nlp2sql",
};

const CHART_TYPES = ["bar", "line", "pie", "area"];

/**
 * Valida se um valor é um número válido (número real ou porcentagem)
 */
function isValidNumber(value) {
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Valida estrutura de um widget
 */
function validateWidget(widget) {
  if (!widget || typeof widget !== "object") {
    console.warn("Widget inválido: não é um objeto");
    return false;
  }

  const { id, type, title, data } = widget;

  // Validar campo obrigatórios
  if (!id || typeof id !== "string") {
    console.warn("Widget sem ID válido");
    return false;
  }

  if (!type || !Object.values(WIDGET_TYPES).includes(type)) {
    console.warn(`Widget ${id}: tipo inválido (${type})`);
    return false;
  }

  if (!title || typeof title !== "string") {
    console.warn(`Widget ${id}: título inválido`);
    return false;
  }

  // Validar dados específicos por tipo
  switch (type) {
    case WIDGET_TYPES.METRIC:
      if (!isValidNumber(data?.value)) {
        console.warn(`Widget ${id}: value não é número`);
        return false;
      }
      break;

    case WIDGET_TYPES.CHART:
      if (!data?.chartType || !CHART_TYPES.includes(data.chartType)) {
        console.warn(`Widget ${id}: chartType inválido`);
        return false;
      }
      if (!Array.isArray(data?.dataPoints) || data.dataPoints.length === 0) {
        console.warn(`Widget ${id}: dataPoints deve ser array não-vazio`);
        return false;
      }
      // Validar cada ponto de dados
      if (!data.dataPoints.every((point) => validateChartDataPoint(point))) {
        console.warn(`Widget ${id}: dataPoints contém valores inválidos`);
        return false;
      }
      break;

    case WIDGET_TYPES.TABLE:
      if (!Array.isArray(data?.rows) || data.rows.length === 0) {
        console.warn(`Widget ${id}: rows deve ser array não-vazio`);
        return false;
      }
      if (!Array.isArray(data?.columns) || data.columns.length === 0) {
        console.warn(`Widget ${id}: columns deve ser array não-vazio`);
        return false;
      }
      break;

    case WIDGET_TYPES.CARD:
      if (!data || typeof data !== "object") {
        console.warn(`Widget ${id}: data inválida para card`);
        return false;
      }
      break;

    case WIDGET_TYPES.NLP2SQL:
      if (!data || typeof data !== "object") {
        console.warn(`Widget ${id}: data inválida para nlp2sql`);
        return false;
      }
      break;
  }

  return true;
}

/**
 * Valida um ponto de dados de gráfico
 */
function validateChartDataPoint(point) {
  if (!point || typeof point !== "object") return false;
  if (!point.label || typeof point.label !== "string") return false;
  if (!isValidNumber(point.value)) return false;
  return true;
}

/**
 * Sanitiza string para evitar XSS
 */
function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .substring(0, 500); // Limita tamanho
}

/**
 * Processa widget após validação
 */
function processWidget(widget) {
  return {
    ...widget,
    id: sanitizeString(widget.id),
    title: sanitizeString(widget.title),
    subtitle: widget.subtitle ? sanitizeString(widget.subtitle) : undefined,
    data: processWidgetData(widget.type, widget.data),
  };
}

/**
 * Processa dados específicos do widget
 */
function processWidgetData(type, data) {
  if (!data) return {};

  switch (type) {
    case WIDGET_TYPES.METRIC:
      return {
        value: Number(data.value).toFixed(2),
        unit: data.unit ? sanitizeString(data.unit) : "",
        trend: data.trend ? Math.min(Math.max(data.trend, -100), 100) : 0,
        trendLabel: data.trendLabel ? sanitizeString(data.trendLabel) : "",
      };

    case WIDGET_TYPES.CHART:
      return {
        chartType: data.chartType,
        dataPoints: data.dataPoints.map((point) => ({
          label: sanitizeString(point.label),
          value: Number(point.value).toFixed(2),
        })),
      };

    case WIDGET_TYPES.TABLE:
      return {
        columns: data.columns.map((col) => ({
          key: sanitizeString(col.key || col),
          label: sanitizeString(col.label || col),
        })),
        rows: data.rows.slice(0, 100).map((row) => {
          const safeRow = {};
          data.columns.forEach((col) => {
            const key = col.key || col;
            const value = row[key];
            safeRow[key] = sanitizeString(String(value || ""));
          });
          return safeRow;
        }),
      };

    case WIDGET_TYPES.CARD:
      return {
        value: data.value ? sanitizeString(String(data.value)) : "",
        description: data.description ? sanitizeString(data.description) : "",
        bgColor: isValidColor(data.bgColor) ? data.bgColor : "#f0f2f5",
        icon: data.icon ? sanitizeString(data.icon) : "",
      };

    case WIDGET_TYPES.NLP2SQL:
      return {
        description: data.description ? sanitizeString(data.description) : "",
        inputPlaceholder: data.inputPlaceholder
          ? sanitizeString(data.inputPlaceholder)
          : "Digite sua pergunta",
        maxQuestionLength: isValidNumber(data.maxQuestionLength)
          ? Number(data.maxQuestionLength)
          : 280,
        enabled: Boolean(data.enabled ?? true),
        insightModes: Array.isArray(data.insightModes)
          ? data.insightModes.map((mode) => sanitizeString(String(mode)))
          : ["table", "top5", "bar", "pie"],
      };

    default:
      return data;
  }
}

/**
 * Valida se uma cor é formato válido
 */
function isValidColor(color) {
  if (!color || typeof color !== "string") return false;
  // Aceita hex, rgb, named colors
  return /^(#[0-9A-Fa-f]{6}|rgb\(|hsl\(|[a-z]+)/.test(color);
}

/**
 * Busca configuração do dashboard dinâmico
 */
export async function fetchDynamicDashboardConfig() {
  try {
    const response = await httpClient.get(
      "/api/v1/dashboard/dynamic/config"
    );
    const payload = response?.data;

    if (!payload || !Array.isArray(payload.widgets)) {
      console.warn("Resposta inválida do backend");
      return { widgets: [], meta: {} };
    }

    // Validar e processar cada widget
    const validWidgets = payload.widgets
      .filter(validateWidget)
      .map(processWidget);

    return {
      widgets: validWidgets,
      meta: {
        lastUpdated: payload.lastUpdated || new Date().toISOString(),
        refreshInterval: isValidNumber(payload.refreshInterval)
          ? Number(payload.refreshInterval)
          : 300000, // 5 min padrão
      },
    };
  } catch (error) {
    console.error("Erro ao buscar configuração do dashboard:", error);
    return { widgets: [], meta: { refreshInterval: 300000 } };
  }
}

export async function runNlp2SqlQuestion(question) {
  const safeQuestion = sanitizeString(question).substring(0, 280);
  if (!safeQuestion || safeQuestion.length < 3) {
    return {
      success: false,
      answer: "Pergunta muito curta.",
      generatedSql: "",
      columns: [],
      rows: [],
      rowCount: 0,
      guardrail: { blocked: true, reason: "Pergunta muito curta" },
    };
  }

  try {
    const response = await httpClient.post(
      "/api/v1/dashboard/dynamic/nlp2sql",
      { question: safeQuestion }
    );
    const payload = response?.data ?? {};

    return {
      success: Boolean(payload.success),
      answer: sanitizeString(payload.answer || "Sem resposta"),
      generatedSql:
        typeof (payload.generatedSql || payload.generated_sql) === "string"
          ? String(payload.generatedSql || payload.generated_sql).substring(0, 4000)
          : "",
      columns: Array.isArray(payload.columns)
        ? payload.columns.map((col) => sanitizeString(String(col)))
        : [],
      rows: Array.isArray(payload.rows)
        ? payload.rows.slice(0, 100).map((row) => {
            const safeRow = {};
            Object.keys(row || {}).forEach((key) => {
              safeRow[sanitizeString(key)] = sanitizeString(String(row[key] ?? ""));
            });
            return safeRow;
          })
        : [],
      rowCount: isValidNumber(payload.rowCount ?? payload.row_count)
        ? Number(payload.rowCount ?? payload.row_count)
        : 0,
      insightsPlan: payload.insightsPlan || payload.insights_plan || {},
      guardrail: {
        blocked: Boolean(payload.guardrail?.blocked),
        reason: sanitizeString(payload.guardrail?.reason || ""),
      },
    };
  } catch (error) {
    console.error("Erro ao executar NLP2SQL:", error);
    return {
      success: false,
      answer: "Não foi possível processar a pergunta agora.",
      generatedSql: "",
      columns: [],
      rows: [],
      rowCount: 0,
      guardrail: { blocked: false, reason: "Falha de integração" },
    };
  }
}

/**
 * Envia uma pergunta para o NLP2SQL e trata erros de forma inteligente
 */
export async function askNlp2Sql(question) {
  try {
    const body = { question };
    const response = await httpClient.post("/api/v1/analytics/nlp2sql", body);

    if (response.success) {
      return response;
    } else {
      console.warn("Pergunta inválida para NLP2SQL:", response);
      return {
        error: true,
        message: "Pergunta inválida para NLP2SQL. Tente reformular a pergunta ou seja mais específico.",
        generated_sql: response.generated_sql || "",
      };
    }
  } catch (error) {
    console.error("Erro ao consultar NLP2SQL:", error);
    return {
      error: true,
      message: "Erro ao processar a pergunta. Verifique a conexão ou tente novamente.",
      generated_sql: "",
    };
  }
}

export { WIDGET_TYPES, CHART_TYPES };
