import { httpClient } from './httpClient';

const LOCAL_KEY = 'hsr_complicacoes_local';

export async function fetchComplicacoes() {
  try {
    const { data } = await httpClient.get('/api/v1/complicacoes');
    return Array.isArray(data) ? data : [];
  } catch {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  }
}

export async function createComplicacao(payload) {
  try {
    const { data } = await httpClient.post('/api/v1/complicacoes', payload);
    return data;
  } catch {
    const items = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const item = { id: Date.now(), ...payload };
    items.push(item);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    return item;
  }
}

export function buildComplicacaoPayload(form) {
  return {
    cirurgia: form.cirurgiaId ? { id: Number(form.cirurgiaId) } : null,
    descricao: form.descricao,
  };
}

export async function fetchComplicacaoReferences() {
  const results = await Promise.allSettled([
    httpClient.get('/api/v1/cirurgias').then(r => Array.isArray(r.data) ? r.data : []),
  ]);
  return {
    cirurgias: results[0].status === 'fulfilled' ? results[0].value : [],
  };
}
