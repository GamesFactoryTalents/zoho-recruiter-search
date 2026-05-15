const ZOHO_BASE     = 'https://recruit.zoho.eu/recruit/v2';
const ZOHO_ACCOUNTS = 'https://accounts.zoho.eu/oauth/v2/token';

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
  if (!data.access_token) throw new Error('Zoho auth failed');
  _tokenCache = { token: data.access_token, expiresAt: Date.now() + 50 * 60 * 1000 };
  return data.access_token;
}

function pick(obj) {
  return (obj && typeof obj === 'object') ? (obj.name || '') : (obj || '');
}
function pickList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(pick).filter(Boolean);
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

export const handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET')     return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const id = event.path.split('/').pop();
  if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing candidate id' }) };

  try {
    const token = await getZohoToken();

    const [profileResp, attachResp] = await Promise.all([
      fetch(`${ZOHO_BASE}/Candidates/${id}`, { headers: { Authorization: `Zoho-oauthtoken ${token}` } }),
      fetch(`${ZOHO_BASE}/Candidates/${id}/Attachments`, { headers: { Authorization: `Zoho-oauthtoken ${token}` } }),
    ]);

    const profileData = await profileResp.json();
    const c = (profileData.data || [])[0];
    if (!c) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Candidate not found' }) };

    // Find resume attachment
    const attachData = attachResp.status === 200 ? await attachResp.json() : {};
    const attachments = attachData.data || [];
    const resume = attachments.find(a => {
      const cat = a.Category;
      return (typeof cat === 'object' ? cat?.name : cat) === 'Resume';
    });

    const candidate = {
      id:               c.id,
      name:             c.Full_Name || `${c.First_Name || ''} ${c.Last_Name || ''}`.trim(),
      category:         pick(c.Pick_List_5),
      seniority:        c.Single_Line_1 || pick(c.Seniority_Level_2) || '',
      country:          pick(c.Country),
      city:             c.City || '',
      skills:           pickList(c.SKILLS),
      specialities:     pickList(c.Specialities_2),
      status:           c.Candidate_Status || '',
      currentTitle:     c.Current_Job_Title || '',
      experienceYears:  c.Experience_in_Years,
      gamingYears:      c.Experience_in_Creative_Industry,
      engines:          pickList(c.Engines_2),
      platforms:        pickList(c.Platforms_2),
      genres:           pickList(c.Genres_2),
      artStyles:        pickList(c.Art_Styles),
      expectedSalary:   c.Expected_Salary,
      relocation:       c.Relocation,
      workPreferences:  pickList(c.Work_Preferences),
      linkedin:         c.LinkedIn || c.LinkedIn__s || '',
      motivation:       c.Motivation || '',
      expectations:     c.Expectations_and_Dream_Job || '',
      gameTitles:       c.Game_Titles_or_Apps || '',
      tasks:            c.Tasks || '',
      achievements:     c.Achievements || '',
      createdAt:        c.Created_Time || '',
      resumeId:         resume?.id || null,
      resumeName:       resume?.File_Name || null,
    };

    return { statusCode: 200, headers, body: JSON.stringify(candidate) };
  } catch (err) {
    console.error('Candidate fetch error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
