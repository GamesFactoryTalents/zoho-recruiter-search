const BASE = '/api';

export async function searchCandidates({ query, mode, filters, page = 1 }) {
  const resp = await fetch(`${BASE}/search`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ query, mode, filters, page }),
  });
  if (!resp.ok) throw new Error(`Search failed: ${resp.status}`);
  return resp.json();
}

export async function fetchCandidate(id) {
  const resp = await fetch(`${BASE}/candidate/${id}`);
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
  return resp.json();
}

export async function summarizeCandidate(candidate) {
  const resp = await fetch(`${BASE}/summarize`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(candidate),
  });
  if (!resp.ok) throw new Error(`Summarize failed: ${resp.status}`);
  return resp.json();
}
