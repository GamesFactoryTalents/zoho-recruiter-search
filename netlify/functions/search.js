const ZOHO_BASE     = 'https://recruit.zoho.eu/recruit/v2';
const ZOHO_ACCOUNTS = 'https://accounts.zoho.eu/oauth/v2/token';

const CANDIDATE_FIELDS = [
  'id', 'First_Name', 'Last_Name', 'Full_Name',
  'Pick_List_5',                   // category
  'Single_Line_1',                 // seniority
  'Country', 'City',
  'SKILLS',
  'Specialities_2',
  'Candidate_Status',
  'Current_Job_Title',
  'Experience_in_Years',
  'Experience_in_Creative_Industry',
  'Engines_2',
  'Platforms_2',
  'Genres_2',
  'Expected_Salary',
  'Work_Preferences',
  'Relocation',
  'LinkedIn',
  'Created_Time',
].join(',');

// ─── Zoho auth (cached for 50 min) ──────────────────────────────────────────

let _tokenCache = { token: null, expiresAt: 0 };

async function getZohoToken() {
  if (_tokenCache.token && Date.now() < _tokenCache.expiresAt) {
    return _tokenCache.token;
  }
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id:     process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type:    'refresh_token',
  });
  const resp = await fetch(`${ZOHO_ACCOUNTS}?${params}`, { method: 'POST' });
  const data = await resp.json();
  if (!data.access_token) throw new Error('Zoho auth failed: ' + JSON.stringify(data));
  _tokenCache = { token: data.access_token, expiresAt: Date.now() + 50 * 60 * 1000 };
  return data.access_token;
}

// ─── Criteria builders ───────────────────────────────────────────────────────

function filterCriteria(filters = {}) {
  const parts = [];
  if (filters.category) parts.push(`(Pick_List_5:equals:${filters.category})`);
  if (filters.seniority) parts.push(`(Single_Line_1:equals:${filters.seniority})`);
  if (filters.status)   parts.push(`(Candidate_Status:equals:${filters.status})`);
  if (filters.country)  parts.push(`(Country:equals:${filters.country})`);
  return parts;
}

function buildSimpleCriteria(query, filters) {
  const parts = [...filterCriteria(filters)];
  if (query && query.trim()) {
    const q = query.trim();
    parts.push(
      `((Full_Name:contains:${q})OR(SKILLS:contains:${q})OR(Specialities_2:contains:${q}))`
    );
  }
  return parts.length ? parts.join('AND') : null;
}

function buildBooleanCriteria(query, filters) {
  if (!query || !query.trim()) return buildSimpleCriteria('', filters);

  // Split gives alternating [term, op, term, op, term...] because of capturing group
  const raw    = query.trim();
  const parts  = raw.split(/\s+(AND|OR|NOT)\s+/i);
  const terms  = parts.filter((_, i) => i % 2 === 0); // even indices = terms
  const ops    = parts.filter((_, i) => i % 2 === 1); // odd indices = operators

  const termCriteria = (term) => {
    const t = term.replace(/[()]/g, '').trim();
    return `((SKILLS:contains:${t})OR(Specialities_2:contains:${t})OR(Full_Name:contains:${t}))`;
  };

  let criteriaStr = termCriteria(terms[0]);
  for (let i = 1; i < terms.length; i++) {
    const op = ops[i - 1].toUpperCase() === 'NOT' ? 'AND' : ops[i - 1].toUpperCase();
    criteriaStr += `${op}${termCriteria(terms[i])}`;
  }

  const filterParts = filterCriteria(filters);
  if (filterParts.length) criteriaStr = `(${criteriaStr})AND${filterParts.join('AND')}`;

  return criteriaStr;
}

async function buildAICriteria(query, filters) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `You convert natural-language recruitment queries into Zoho Recruit API criteria strings.

Zoho criteria format: (field:operator:value)AND(field:operator:value)
Operators: equals, contains, starts_with

Available fields and exact values:
- Full_Name: candidate name
- SKILLS: any skill name (Unity, Python, Unreal Engine, etc.)
- Specialities_2: specialisation tags
- Pick_List_5 (category): "Art & Animation" | "Audio & Sound" | "Business & Management" | "Data & Analytics" | "Game Design" | "Localisation" | "Monetisation" | "Player Support & Community" | "Product & LiveOps" | "Production" | "Programming & Engineering" | "QA & Testing" | "UA & Marketing" | "UI & UX Design" | "Writing"
- Single_Line_1 (seniority): junior | mid | senior | lead | director
- Country: country name (e.g. Finland, United Kingdom)
- City: city name
- Candidate_Status: any status string

Return JSON only — no markdown:
{"criteria": "<criteria string or null>", "explanation": "<one sentence what you searched for>"}`,
      messages: [{
        role: 'user',
        content: `Query: "${query}"\nExtra filters: ${JSON.stringify(filters)}`,
      }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Anthropic API error ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Empty Anthropic response: ' + JSON.stringify(data));

  let raw = text.trim();
  if (raw.startsWith('```')) { raw = raw.split('```')[1]; if (raw.startsWith('json')) raw = raw.slice(4); raw = raw.trim(); }
  return JSON.parse(raw);
}

// ─── Candidate formatter ─────────────────────────────────────────────────────

function pick(obj) {
  return (obj && typeof obj === 'object') ? (obj.name || '') : (obj || '');
}
function pickList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(pick).filter(Boolean);
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

function formatCandidate(c) {
  return {
    id:             c.id,
    name:           c.Full_Name || `${c.First_Name || ''} ${c.Last_Name || ''}`.trim(),
    category:       pick(c.Pick_List_5),
    seniority:      c.Single_Line_1 || pick(c.Seniority_Level_2) || '',
    country:        pick(c.Country),
    city:           c.City || '',
    skills:         pickList(c.SKILLS),
    specialities:   pickList(c.Specialities_2),
    status:         c.Candidate_Status || '',
    currentTitle:   c.Current_Job_Title || '',
    experienceYears: c.Experience_in_Years,
    gamingYears:    c.Experience_in_Creative_Industry,
    engines:        pickList(c.Engines_2),
    platforms:      pickList(c.Platforms_2),
    genres:         pickList(c.Genres_2),
    expectedSalary: c.Expected_Salary,
    relocation:     c.Relocation,
    linkedin:       c.LinkedIn || c.LinkedIn__s || '',
    createdAt:      c.Created_Time || '',
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { query = '', mode = 'simple', filters = {}, page = 1 } = JSON.parse(event.body || '{}');

    const token = await getZohoToken();

    let criteria    = null;
    let explanation = null;

    if (mode === 'ai' && query.trim()) {
      const ai = await buildAICriteria(query, filters);
      criteria    = ai.criteria;
      explanation = ai.explanation;
    } else if (mode === 'boolean') {
      criteria = buildBooleanCriteria(query, filters);
    } else {
      criteria = buildSimpleCriteria(query, filters);
    }

    const params = new URLSearchParams({
      fields:     CANDIDATE_FIELDS,
      per_page:   '50',
      page:       String(page),
      sort_by:    'Created_Time',
      sort_order: 'desc',
    });
    if (criteria) params.append('criteria', criteria);

    const endpoint = criteria
      ? `${ZOHO_BASE}/Candidates/search?${params}`
      : `${ZOHO_BASE}/Candidates?${params}`;

    const zohoResp = await fetch(endpoint, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });

    if (zohoResp.status === 204) {
      return { statusCode: 200, headers, body: JSON.stringify({ candidates: [], total: 0, more: false, page, explanation }) };
    }

    const data       = await zohoResp.json();
    const candidates = (data.data || []).map(formatCandidate);
    const info       = data.info || {};

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        candidates,
        total:       info.count || candidates.length,
        more:        info.more_records || false,
        page,
        explanation,
      }),
    };
  } catch (err) {
    console.error('Search error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
