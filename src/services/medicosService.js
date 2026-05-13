import { httpClient } from './httpClient';

const LOCAL_KEY = 'hsr_medicos_local';

export async function fetchMedicos() {
  try {
    const { data } = await httpClient.get('/api/v1/medicos');
    return Array.isArray(data) ? data : [];
  } catch {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  }
}

export async function createMedico(payload) {
  try {
    const { data } = await httpClient.post('/api/v1/medicos', payload);
    return data;
  } catch {
    const items = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const item = { id: Date.now(), ...payload };
    items.push(item);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    return item;
  }
}

export function buildMedicoPayload(form) {
  return {
    nome: form.nome,
    cpf: form.cpf,
    ativo: form.ativo === 'true' || form.ativo === true,
    cargo: form.cargoId ? { id: Number(form.cargoId) } : null,
    crm: form.crmNumero ? { crm: form.crmNumero, uf: form.crmUf || 'SP' } : null,
  };
}

export async function fetchMedicoReferences() {
  const results = await Promise.allSettled([
    httpClient.get('/api/v1/cargos').then(r => Array.isArray(r.data) ? r.data : []),
  ]);
  return {
    cargos: results[0].status === 'fulfilled' ? results[0].value : [],
  };
}
