// Generate a standalone candidate profile summary using Claude Haiku.
// Accepts the full candidate object as POST body — no extra Zoho call needed.

const SYSTEM = `You are a headhunter writing a candidate profile for a recruiter's reference file.
Write a concise, honest profile based ONLY on the information provided.
Do not invent or generalise. Be specific — cite tools, years, titles, shipped games, numbers.
No fluff: no "strong communicator", "team player", or "passionate professional".
If a field is empty or "Not specified", skip it entirely — do not mention it.`;

const PROMPT = `Write a profile summary for this games-industry candidate.

Category: {category}
Seniority: {seniority}
Total experience: {experience_years}
Games industry experience: {years_in_gaming}
Location: {location}
Open to relocation: {relocation}
Work preferences: {work_preferences}
Expected salary: {expected_salary}

Specialities: {specialities}
Skills: {skills}
Engines: {engines}
Platforms: {platforms}
Genres: {genres}

Shipped titles / apps: {game_titles}
Tasks & responsibilities: {tasks}
Achievements: {achievements}
Motivation for change: {motivation}
Expectations from next role: {expectations}
Dream job / challenges: {dream_job}

Return JSON only — no markdown:
{"headline":"<one punchy sentence: their role and standout quality>","summary":"<2-3 sentences: strongest background, what type of role they suit, one flag if relevant>","strengths":["<specific strength backed by evidence>","<specific strength>","<specific strength>"]}`;

function fmt(val) {
  if (!val || (Array.isArray(val) && val.length === 0)) return 'Not specified';
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return String(val);
}

export const handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const c = JSON.parse(event.body || '{}');

    const prompt = PROMPT
      .replace('{category}',         fmt(c.category))
      .replace('{seniority}',        fmt(c.seniority))
      .replace('{experience_years}', c.experienceYears != null ? `${c.experienceYears} years` : 'Not specified')
      .replace('{years_in_gaming}',  c.gamingYears != null && c.gamingYears > 0 ? `${c.gamingYears} years` : 'Not specified')
      .replace('{location}',         fmt([c.city, c.country].filter(Boolean)))
      .replace('{relocation}',       c.relocation === true ? 'Yes' : c.relocation === false ? 'No' : 'Not specified')
      .replace('{work_preferences}', fmt(c.workPreferences))
      .replace('{expected_salary}',  fmt(c.expectedSalary))
      .replace('{specialities}',     fmt(c.specialities))
      .replace('{skills}',           fmt(c.skills?.length > 0 ? c.skills : c.skillSet))
      .replace('{engines}',          fmt(c.engines))
      .replace('{platforms}',        fmt(c.platforms))
      .replace('{genres}',           fmt(c.genres))
      .replace('{game_titles}',      fmt(c.gameTitles))
      .replace('{tasks}',            fmt(c.tasks))
      .replace('{achievements}',     fmt(c.achievements))
      .replace('{motivation}',       fmt(c.motivation))
      .replace('{expectations}',     fmt(c.expectations))
      .replace('{dream_job}',        fmt(c.dreamJob));

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         process.env.CZP_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system:     SYSTEM,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Anthropic error ${resp.status}: ${err}`);
    }

    const data = await resp.json();
    let raw = data?.content?.[0]?.text?.trim() || '';
    if (raw.startsWith('```')) {
      raw = raw.split('```')[1];
      if (raw.startsWith('json')) raw = raw.slice(4);
      raw = raw.trim();
    }

    const result = JSON.parse(raw);
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (err) {
    console.error('Summarize error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
