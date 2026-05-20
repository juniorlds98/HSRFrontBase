import { httpClient } from "./httpClient";
import { buildDateQueryParams } from "../utils/analyticsFormatters";

const REPORT_FILES_STORAGE_KEY = "hsr_reports_files_local";

const CSV_ENDPOINTS = {
  leads: "/api/v1/analytics/leads/csv",
  financeiro: "/api/v1/analytics/financeiro/csv",
};

const FILE_LIST_ENDPOINT = "/api/v1/minio/files";
const FILE_UPLOAD_ENDPOINT = "/api/v1/minio/files/upload";
const FILE_DOWNLOAD_ENDPOINT = "/api/v1/minio/files/download";

function readLocalFiles() {
  try {
    const raw = localStorage.getItem(REPORT_FILES_STORAGE_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalFiles(files) {
  localStorage.setItem(REPORT_FILES_STORAGE_KEY, JSON.stringify(files));
}

function extractFileName(contentDisposition, fallbackName) {
  if (!contentDisposition) return fallbackName;

  const encodedMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    return decodeURIComponent(encodedMatch[1]);
  }

  const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (basicMatch?.[1]) {
    return basicMatch[1];
  }

  return fallbackName;
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? fallback;
}

function normalizeFileItem(item, index) {
  const name = item?.name ?? item?.filename ?? item?.objectName ?? `arquivo-${index + 1}`;

  return {
    id: item?.id ?? item?.objectKey ?? item?.path ?? `${name}-${index}`,
    name,
    size: Number(item?.size ?? item?.contentLength ?? 0),
    uploadedAt: item?.uploadedAt ?? item?.createdAt ?? item?.lastModified ?? null,
    path: item?.path ?? item?.objectKey ?? name,
    downloadUrl: item?.downloadUrl ?? item?.url ?? "",
    source: item?.source ?? "api",
  };
}

export async function downloadCsvReport(kind, { fromDate, toDate }) {
  const endpoint = CSV_ENDPOINTS[kind];
  const params = buildDateQueryParams(fromDate, toDate);
  const fallbackName = `${kind}-${fromDate || "inicio"}-${toDate || "fim"}.csv`;

  if (!endpoint) {
    throw new Error("Tipo de CSV invalido.");
  }

  try {
    const response = await httpClient.get(endpoint, {
      params,
      responseType: "blob",
    });

    const fileName = extractFileName(response?.headers?.["content-disposition"], fallbackName);
    return {
      blob: response.data,
      fileName,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Não foi possível gerar o CSV no backend."));
  }
}

export async function fetchHostedFiles() {
  try {
    const { data } = await httpClient.get(FILE_LIST_ENDPOINT, {
      params: { prefix: "relatorios" },
    });

    const rows = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    return rows.map(normalizeFileItem);
  } catch (error) {
    const local = readLocalFiles();
    if (local.length > 0) {
      return local.map((item, index) => normalizeFileItem({ ...item, source: "local" }, index));
    }

    throw new Error(getErrorMessage(error, "Não foi possível listar arquivos hospedados."));
  }
}

export async function uploadHostedFile(file, folder = "relatorios") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  try {
    const { data } = await httpClient.post(FILE_UPLOAD_ENDPOINT, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return normalizeFileItem(data ?? { name: file.name, size: file.size, uploadedAt: new Date().toISOString() }, 0);
  } catch (error) {
    const localFiles = readLocalFiles();
    const fallbackItem = {
      id: `local-${Date.now()}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      path: `${folder}/${file.name}`,
      source: "local",
    };
    localFiles.unshift(fallbackItem);
    writeLocalFiles(localFiles);

    console.warn("Upload em API falhou, usando fallback local.", error);

    return fallbackItem;
  }
}

export async function downloadHostedFile(fileItem) {
  if (fileItem?.source === "local") {
    const blob = new Blob([
      `Arquivo local de fallback: ${fileItem.name}\nCaminho: ${fileItem.path}\nData: ${fileItem.uploadedAt}`,
    ], { type: "text/plain;charset=utf-8" });
    return {
      blob,
      fileName: `${fileItem.name}.txt`,
    };
  }

  if (fileItem?.downloadUrl) {
    const response = await httpClient.get(fileItem.downloadUrl, { responseType: "blob" });
    return {
      blob: response.data,
      fileName: fileItem.name,
    };
  }

  const path = fileItem?.path ?? fileItem?.name;

  try {
    const response = await httpClient.get(FILE_DOWNLOAD_ENDPOINT, {
      params: { path },
      responseType: "blob",
    });

    return {
      blob: response.data,
      fileName: extractFileName(response?.headers?.["content-disposition"], fileItem?.name ?? "arquivo"),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Não foi possível baixar o arquivo selecionado."));
  }
}

