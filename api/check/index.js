const API_URL = 'https://api.github.com/repos/Xu-125/ai-predy-game/contents/data/leaderboard.json';
const TOKEN = process.env.GH_TOKEN;
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'No' });
  try {
    const { nickname } = req.body;
    const r = await fetch(API_URL, { headers: { 'Authorization': `token ${TOKEN}`, 'Accept': 'application/vnd.github.v3+json' } });
    if (!r.ok) return res.json({ hasPlayed: false });
    const i = await r.json();
    const data = JSON.parse(Buffer.from(i.content, 'base64').toString());
    const found = data.find(x => (x.nickname||'').toLowerCase() === (nickname||'').toLowerCase());
    return res.json({ hasPlayed: !!found, lastScore: found ? found.total : null });
  } catch(e) { return res.json({ hasPlayed: false }); }
}
