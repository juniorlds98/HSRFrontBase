import { httpClient } from "./httpClient";

const STACK_ENDPOINT = "/api/health/stack";
const MOCK_BASE_ENDPOINT = import.meta.env.VITE_SERVICE_CONTROL_BASE_PATH ?? "/api/mock/services";

const FACULTATIVE_SERVICE_NAMES = new Set([
  "python ai service",
  "ai service",
  "ai-service",
  "crm-ai-service",
  "celery worker",
  "crm-celery-worker",
  "llm",
  "nlp2sql",
  "nlp2sql ai service",
  "nlp2sql-service",
  "analytics",
  "analytics service",
  "faq engine",
  "chat manager",
  "chat service",
  "webhook handler",
  "webhook service",
  "template service",
  "recommendation engine",
  "reporting service",
  "ml pipeline",
  "ml service",
  "elasticsearch",
  "opensearch",
]);

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeStatus(rawStatus) {
  const status = String(rawStatus ?? "").toLowerCase();
  if (["online", "up", "active", "running", "ativo"].includes(status)) {
    return "active";
  }
  if (["offline", "down", "inactive", "stopped", "desativado"].includes(status)) {
    return "inactive";
  }
  return "degraded";
}

function isFacultativeByName(name) {
  return FACULTATIVE_SERVICE_NAMES.has(String(name ?? "").toLowerCase().trim());
}

function normalizeService(item, index) {
  const name = item?.name ?? item?.serviceName ?? item?.service ?? `Servico ${index + 1}`;
  const key = item?.id ?? item?.key ?? slugify(name);
  const normalizedStatus = normalizeStatus(item?.status);

  return {
    id: String(key),
    name,
    url: item?.url ?? "",
    status: normalizedStatus,
    responseTimeMs: item?.responseTimeMs ?? null,
    error: item?.error ?? null,
    source: item?.source ?? "backend",
    isFacultative: isFacultativeByName(name),
  };
}

async function fetchFromMockControl() {
  const { data } = await httpClient.get(MOCK_BASE_ENDPOINT);
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((item, index) => {
    const service = normalizeService(item, index);
    return {
      ...service,
      status: normalizeStatus(item?.status ?? item?.state ?? service.status),
      source: "mock-control",
      isFacultative: item?.isFacultative ?? service.isFacultative,
    };
  });
}

async function fetchFromStackHealth() {
  const { data } = await httpClient.get(STACK_ENDPOINT);
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((item, index) => normalizeService(item, index));
}

export async function fetchServiceControlData() {
  try {
    const services = await fetchFromMockControl();
    if (services.length > 0) {
      return {
        services,
        mode: "mock-control",
      };
    }
  } catch {
    // Fallback to stack health contract if mock endpoint is unavailable.
  }

  const services = await fetchFromStackHealth();
  return {
    services,
    mode: "stack-health",
  };
}

function getActionCandidates(serviceId, action) {
  const encodedId = encodeURIComponent(serviceId);
  const normalizedAction = String(action).toLowerCase();

  return [
    {
      method: "post",
      url: `${MOCK_BASE_ENDPOINT}/actions`,
      body: { serviceId, action: normalizedAction },
    },
    {
      method: "post",
      url: `${MOCK_BASE_ENDPOINT}/${encodedId}/${normalizedAction}`,
      body: {},
    },
    {
      method: "patch",
      url: `${MOCK_BASE_ENDPOINT}/${encodedId}`,
      body: { action: normalizedAction },
    },
  ];
}

export async function performServiceAction(serviceId, action) {
  const candidates = getActionCandidates(serviceId, action);

  for (const candidate of candidates) {
    try {
      const response = await httpClient.request({
        method: candidate.method,
        url: candidate.url,
        data: candidate.body,
      });

      return {
        ok: true,
        mock: false,
        data: response.data,
      };
    } catch {
      // Try next candidate until one works.
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    ok: true,
    mock: true,
    data: {
      serviceId,
      action,
      message: "Acao simulada localmente (endpoint mock indisponivel).",
    },
  };
}
