import { httpClient } from './httpClient';

const LOCAL_KEY = 'hsr_consentimentos_local';

export async function fetchConsentimentos() {
  try {
    const { data } = await httpClient.get('/api/v1/consentimentos');
    return Array.isArray(data) ? data : [];
  } catch {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  }
}

export async function createConsentimento(payload) {
  try {
    const { data } = await httpClient.post('/api/v1/consentimentos', payload);
    return data;
  } catch {
    const items = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const item = { id: Date.now(), ...payload };
    items.push(item);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    return item;
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
