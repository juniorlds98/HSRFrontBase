import { httpClient } from './httpClient';

const LOCAL_KEY = 'hsr_jornadas_local';

export async function fetchJornadas() {
  try {
    const { data } = await httpClient.get('/api/v1/jornadas-paciente');
    return Array.isArray(data) ? data : [];
  } catch {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  }
}

export async function createJornada(payload) {
  try {
    const { data } = await httpClient.post('/api/v1/jornadas-paciente', payload);
    return data;
  } catch {
    const items = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const item = { id: Date.now(), ...payload };
    items.push(item);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    return item;
  }
}

export function buildJornadaPayload(form) {
  return {
    paciente: form.pacienteId ? { id: Number(form.pacienteId) } : null,
    etapa: form.etapaId ? { id: Number(form.etapaId) } : null,
    dataInicio: form.dataInicio ? form.dataInicio + ':00' : null,
    dataFim: form.dataFim ? form.dataFim + ':00' : null,
  };
}

export async function fetchJornadaReferences() {
  const results = await Promise.allSettled([
    httpClient.get('/api/v1/pacientes').then(r => Array.isArray(r.data) ? r.data : []),
    httpClient.get('/api/v1/etapas').then(r => Array.isArray(r.data) ? r.data : []),
  ]);
  return {
    pacientes: results[0].status === 'fulfilled' ? results[0].value : [],
    etapas: results[1].status === 'fulfilled' ? results[1].value : [],
  };
}

