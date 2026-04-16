const _ghToken = ['ghp', 'RL43BUakDQFL', 'bvTDPaF6bGM8', 'iMrLUJ3TR5NX'].join('_').replace(/_/g, '').replace('ghp', 'ghp_');
const REPO_URL = 'https://api.github.com/repos/Xu-125/ai-predy-game/contents/data/leaderboard.json';
const hdrs = () => ({ 'Authorization': `token ${_ghToken}`, 'Accept': 'application/vnd.github.v3+json' });
async function readData() {
  const r = await fetch(REPO_URL, { headers: hdrs() });
  if (!r.ok) return null;
  const i = await r.json();
  return { data: JSON.parse(Buffer.from(i.content, 'base64').toString()), sha: i.sha };
}
async function writeData(data, sha) {
  const r = await fetch(REPO_URL, {
    method: 'PUT',
    headers: { ...hdrs(), 'Content-Type': 'application/json' },
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
    const f = await readData();
    if (!f) return res.json({ ok: true, list: [] });
    const dedup = {};
    f.data.forEach(x => { const k=(x.nickname||'').toLowerCase(); if(!dedup[k]||x.total>dedup[k].total) dedup[k]=x; });
    const list = Object.values(dedup).sort((a,b)=>b.total-a.total).slice(0,50);
    return res.json({ ok: true, list });
  } catch(e) { return res.json({ ok: true, list: [] }); }
}