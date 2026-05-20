import { httpClient } from './httpClient';

const LOCAL_KEY = 'hsr_funcionarios_local';

export async function fetchFuncionarios() {
  try {
    const { data } = await httpClient.get('/api/v1/funcionarios');
    return Array.isArray(data) ? data : [];
  } catch {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  }
}

export async function createFuncionario(payload) {
  try {
    const { data } = await httpClient.post('/api/v1/funcionarios', payload);
    return data;
  } catch {
    const items = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const item = { id: Date.now(), ...payload };
    items.push(item);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    return item;
  }
}

export function buildFuncionarioPayload(form) {
  return {
    nome: form.nome,
    cpf: form.cpf,
    ativo: form.ativo === 'true' || form.ativo === true,
    cargo: form.cargoId ? { id: Number(form.cargoId) } : null,
  };
}

export async function fetchFuncionarioReferences() {
  const results = await Promise.allSettled([
    httpClient.get('/api/v1/cargos').then(r => Array.isArray(r.data) ? r.data : []),
  ]);
  return {
    cargos: results[0].status === 'fulfilled' ? results[0].value : [],
  };
}

