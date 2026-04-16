const REPO = 'Xu-125/ai-predy-game';
const DATA_PATH = 'data/leaderboard.json';
const API_URL = `https://api.github.com/repos/${REPO}/contents/${DATA_PATH}`;
const TOKEN = process.env.GH_TOKEN;

async function getFile() {
  const r = await fetch(API_URL, { headers: { 'Authorization': `token ${TOKEN}`, 'Accept': 'application/vnd.github.v3+json' } });
  if (!r.ok) return null;
  const i = await r.json();
  return { data: JSON.parse(Buffer.from(i.content, 'base64').toString()), sha: i.sha };
}
async function putFile(data, sha) {
  const r = await fetch(API_URL, {
    method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
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
      const f = await getFile();
      if (!f) return res.status(500).json({ error: '读取失败' });
      if (f.data.some(x => (x.nickname||'').toLowerCase() === nickname.toLowerCase())) return res.status(409).json({ error: 'already_played' });
      f.data.push({ nickname, prompt, scores, total, rank, time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) });
      if (await putFile(f.data, f.sha)) return res.json({ ok: true });
    }
    return res.status(500).json({ error: '并发冲突' });
  } catch(e) { return res.status(500).json({ error: '服务器错误' }); }
}
