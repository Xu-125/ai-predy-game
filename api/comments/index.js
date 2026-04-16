const API_URL = 'https://api.github.com/repos/Xu-125/ai-predy-game/contents/data/leaderboard.json';
const TOKEN = process.env.GH_TOKEN;
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'No' });
  try {
    const r = await fetch(API_URL, { headers: { 'Authorization': `token ${TOKEN}`, 'Accept': 'application/vnd.github.v3+json' } });
    if (!r.ok) return res.json({ ok: true, list: [] });
    const i = await r.json();
    const data = JSON.parse(Buffer.from(i.content, 'base64').toString());
    const dedup = {};
    data.forEach(x => { const k = (x.nickname||'').toLowerCase(); if (!dedup[k] || x.total > dedup[k].total) dedup[k] = x; });
    const list = Object.values(dedup).sort((a,b) => b.total - a.total).slice(0, 50);
    return res.json({ ok: true, list });
  } catch(e) { return res.json({ ok: true, list: [] }); }
}
