const GH_TOKEN = 'ghp_' + '';
const DATA_URL = 'https://api.github.com/repos/Xu-125/ai-predy-game/contents/data/leaderboard.json';
const AUTH = { 'Authorization': 'token ' + GH_TOKEN, 'Accept': 'application/vnd.github.v3+json' };
async function getData() {
  const r = await fetch(DATA_URL, { headers: AUTH });
  if (!r.ok) return null;
  const info = await r.json();
  return { data: JSON.parse(Buffer.from(info.content, 'base64').toString()), sha: info.sha };
}
async function setData(data, sha) {
  const r = await fetch(DATA_URL, {
    method: 'PUT',
    headers: { ...AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'update', content: Buffer.from(JSON.stringify(data)).toString('base64'), sha, branch: 'main' }),
  });
  return r.ok;
}
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'No' });
  try {
    const f = await getData();
    if (!f) return res.json({ ok: true, list: [] });
    const dedup = {};
    f.data.forEach(x => { const k=(x.nickname||'').toLowerCase(); if(!dedup[k]||x.total>dedup[k].total) dedup[k]=x; });
    const list = Object.values(dedup).sort((a,b)=>b.total-a.total).slice(0,50);
    return res.json({ ok: true, list });
  } catch(e) { return res.json({ ok: true, list: [] }); }
}
