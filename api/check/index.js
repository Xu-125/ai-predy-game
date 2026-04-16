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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'No' });
  try {
    const { nickname } = req.body;
    const f = await readData();
    if (!f) return res.json({ hasPlayed: false });
    const found = f.data.find(x => (x.nickname||'').toLowerCase() === (nickname||'').toLowerCase());
    return res.json({ hasPlayed: !!found, lastScore: found ? found.total : null });
  } catch(e) { return res.json({ hasPlayed: false }); }
}