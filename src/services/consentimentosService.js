import { httpClient } from './httpClient';

const LOCAL_KEY = 'hsr_consentimentos_local';
const LINKED_REPORT_FILE_KEY = 'hsr_consentimentos_report_files';

function readLinkedReportFiles() {
  try {
    const raw = localStorage.getItem(LINKED_REPORT_FILE_KEY);
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLinkedReportFiles(map) {
  localStorage.setItem(LINKED_REPORT_FILE_KEY, JSON.stringify(map));
}

function normalizeLinkedFile(file) {
  if (!file || !file.path) return null;
  return {
    name: file.name || file.path,
    path: file.path,
  };
}

function attachLinkedReportFile(item) {
  const map = readLinkedReportFiles();
  const file = map[String(item?.id)];
  if (!file) {
    return item;
  }
  return {
    ...item,
    linkedReportFile: file,
  };
}

function saveConsentimentoLinkedReportFile(consentimentoId, file) {
  if (!consentimentoId) return;
  const normalized = normalizeLinkedFile(file);
  const map = readLinkedReportFiles();
  if (!normalized) {
    delete map[String(consentimentoId)];
  } else {
    map[String(consentimentoId)] = normalized;
  }
  writeLinkedReportFiles(map);
}

export async function fetchConsentimentos() {
  try {
    const { data } = await httpClient.get('/api/v1/consentimentos');
    const rows = Array.isArray(data) ? data : [];
    return rows.map(attachLinkedReportFile);
  } catch {
    const rows = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    return Array.isArray(rows) ? rows.map(attachLinkedReportFile) : [];
  }
}

export async function createConsentimento(payload, linkedReportFile = null) {
  try {
    const { data } = await httpClient.post('/api/v1/consentimentos', payload);
    if (data?.id) {
      saveConsentimentoLinkedReportFile(data.id, linkedReportFile);
    }
    return data;
  } catch {
    const items = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const item = { id: Date.now(), ...payload };
    items.push(item);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    saveConsentimentoLinkedReportFile(item.id, linkedReportFile);
    return attachLinkedReportFile(item);
  }
}

export function buildConsentimentoPayload(form) {
  return {
    paciente_id: form.pacienteId ? Number(form.pacienteId) : null,
    concedido: form.concedido === 'true' || form.concedido === true,
    canal: form.canal,
    finalidade: form.finalidade,
    origemAtendimento: form.origemAtendimento,
    dataConsentimento: form.dataConsentimento ? form.dataConsentimento + ':00' : null,
    registradoPor: form.registradoPorId ? { id: Number(form.registradoPorId) } : null,
  };
}

export async function fetchConsentimentoReferences() {
  const results = await Promise.allSettled([
    httpClient.get('/api/v1/pacientes').then(r => Array.isArray(r.data) ? r.data : []),
  ]);
  return {
    pacientes: results[0].status === 'fulfilled' ? results[0].value : [],
  };
}

