import { httpClient } from './httpClient';

const LOCAL_KEY = 'hsr_internacoes_local';

export async function fetchInternacoes() {
  try {
    const { data } = await httpClient.get('/api/v1/internacoes');
    return Array.isArray(data) ? data : [];
  } catch {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  }
}

export async function createInternacao(payload) {
  try {
    const { data } = await httpClient.post('/api/v1/internacoes', payload);
    return data;
  } catch {
    const items = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const item = { id: Date.now(), ...payload };
    items.push(item);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    return item;
  }
}

export function buildInternacaoPayload(form) {
  return {
    paciente: form.pacienteId ? { id: Number(form.pacienteId) } : null,
    status: form.statusId ? { id: Number(form.statusId) } : null,
    leito: form.leito,
    motivo: form.motivo,
    dataEntrada: form.dataEntrada ? form.dataEntrada + ':00' : null,
    dataSaida: form.dataSaida ? form.dataSaida + ':00' : null,
  };
}

export async function fetchInternacaoReferences() {
  const results = await Promise.allSettled([
    httpClient.get('/api/v1/pacientes').then(r => Array.isArray(r.data) ? r.data : []),
    httpClient.get('/api/v1/status').then(r => Array.isArray(r.data) ? r.data : []),
  ]);
  return {
    pacientes: results[0].status === 'fulfilled' ? results[0].value : [],
    status: results[1].status === 'fulfilled' ? results[1].value : [],
  };
}

