import { httpClient } from './httpClient';

const LOCAL_KEY = 'hsr_procedimentos_local';

export async function fetchProcedimentos() {
  try {
    const { data } = await httpClient.get('/api/v1/procedimentos');
    return Array.isArray(data) ? data : [];
  } catch {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  }
}

export async function createProcedimento(payload) {
  try {
    const { data } = await httpClient.post('/api/v1/procedimentos', payload);
    return data;
  } catch {
    const items = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const item = { id: Date.now(), ...payload };
    items.push(item);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    return item;
  }
}

export function buildProcedimentoPayload(form) {
  return {
    nomeProcedimento: form.nomeProcedimento,
    status: form.status,
  };
}

