import { httpClient } from './httpClient';

const LOCAL_KEY = 'hsr_cirurgias_local';

export async function fetchCirurgias() {
  try {
    const { data } = await httpClient.get('/api/v1/cirurgias');
    return Array.isArray(data) ? data : [];
  } catch {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  }
}

export async function createCirurgia(payload) {
  try {
    const { data } = await httpClient.post('/api/v1/cirurgias', payload);
    return data;
  } catch {
    const items = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const item = { id: Date.now(), ...payload };
    items.push(item);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    return item;
  }
}

export function buildCirurgiaPayload(form) {
  return {
    paciente: form.pacienteId ? { id: Number(form.pacienteId) } : null,
    medico: form.medicoId ? { id: Number(form.medicoId) } : null,
    procedimento: form.procedimentoId ? { id: Number(form.procedimentoId) } : null,
    gravidade: form.gravidadeId ? { id: Number(form.gravidadeId) } : null,
    status: form.statusId ? { id: Number(form.statusId) } : null,
    sala: form.sala,
    risco: form.risco,
    dataAgendada: form.dataAgendada ? form.dataAgendada + ':00' : null,
    dataRealizada: form.dataRealizada ? form.dataRealizada + ':00' : null,
  };
}

export async function fetchCirurgiaReferences() {
  const results = await Promise.allSettled([
    httpClient.get('/api/v1/pacientes').then(r => Array.isArray(r.data) ? r.data : []),
    httpClient.get('/api/v1/medicos').then(r => Array.isArray(r.data) ? r.data : []),
    httpClient.get('/api/v1/procedimentos').then(r => Array.isArray(r.data) ? r.data : []),
    httpClient.get('/api/v1/gravidades').then(r => Array.isArray(r.data) ? r.data : []),
    httpClient.get('/api/v1/status').then(r => Array.isArray(r.data) ? r.data : []),
  ]);
  return {
    pacientes: results[0].status === 'fulfilled' ? results[0].value : [],
    medicos: results[1].status === 'fulfilled' ? results[1].value : [],
    procedimentos: results[2].status === 'fulfilled' ? results[2].value : [],
    gravidades: results[3].status === 'fulfilled' ? results[3].value : [],
    status: results[4].status === 'fulfilled' ? results[4].value : [],
  };
}
