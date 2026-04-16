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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'No' });
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { nickname, prompt, scores, total, rank } = b;
    if (!nickname || total == null) return res.status(400).json({ error: '缺少字段' });
    for (let a = 0; a < 3; a++) {
      const f = await getData();
      if (!f) return res.status(500).json({ error: '读取失败' });
      if (f.data.some(x => (x.nickname||'').toLowerCase() === nickname.toLowerCase())) return res.status(409).json({ error: 'already_played' });
      f.data.push({ nickname, prompt, scores, total, rank, time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) });
      if (await setData(f.data, f.sha)) return res.json({ ok: true });
    }
    return res.status(500).json({ error: '并发冲突' });
  } catch(e) { console.error(e); return res.status(500).json({ error: '服务器错误: ' + e.message }); }
}
