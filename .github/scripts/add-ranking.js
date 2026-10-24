// 이슈 본문(GitHub 이슈 양식)을 읽어 기록을 검사하고 ranking.json에 더한다. 의존성 없음.
// 게임(index.html)의 점수 공식과 같은 식으로 점수를 다시 계산해 맞지 않으면 올리지 않는다.
// 한계: 브라우저에서 만든 기록이라 아주 작정하고 조작하면 막을 수 없다(점수·시간·처치 범위만 걸러낸다).
const fs = require('fs'), { execFileSync } = require('child_process');
const FILE = 'ranking.json', RESULT = '.ranking-result.json', MAX = 300, PER_USER = 20;
const DIFFS = ['보통', '어려움', '악몽'], SKILLS = ['fire_arrow', 'water_arrow', 'thorn_seed'];

function parseBody(body) {
  const out = {};
  for (const p of String(body || '').split(/^### /m).slice(1)) { const i = p.indexOf('\n'); out[p.slice(0, i).trim()] = p.slice(i + 1).trim(); }
  return out;
}
const score = r => Math.round((r.kills * 2 + r.time * 3 + r.dmg / 200 + (r.zone - 1) * 1500 + r.bosses * 800 + 6000) * (1 + .5 * r.diff));
function validate(fields, user) {
  const name = String(fields['닉네임'] || '').replace(/[\u0000-\u001f<>&"'`\\]/g, '').trim().slice(0, 12);
  if (!name) throw new Error('닉네임이 비어 있어요');
  const m = String(fields['기록'] || '').match(/\{[\s\S]*\}/); if (!m) throw new Error('기록을 읽지 못했어요');
  let r; try { r = JSON.parse(m[0]); } catch (_) { throw new Error('기록 형식이 맞지 않아요'); }
  const num = (k, lo, hi) => { const v = Number(r[k]); if (!Number.isFinite(v) || v < lo || v > hi) throw new Error(`${k} 값이 범위를 벗어났어요`); return v; };
  const e = { name, score: num('score', 0, 1e9), time: num('time', 240, 5400), kills: num('kills', 0, 300000), level: num('level', 1, 200), diff: num('diff', 0, 2), dmg: num('dmg', 0, 1e11), bosses: num('bosses', 3, 3), zone: num('zone', 3, 3) };
  if (!Number.isInteger(e.diff)) throw new Error('diff 값이 맞지 않아요');
  if (!SKILLS.includes(r.skill)) throw new Error('시작 기술이 맞지 않아요'); e.skill = r.skill;
  if (Math.abs(score(e) - e.score) > 2) throw new Error('점수가 기록과 맞지 않아요');
  e.date = new Date().toISOString().slice(0, 10); e.by = user || '';
  return e;
}
function run() {
  let res;
  try {
    const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const e = validate(parseBody(process.env.ISSUE_BODY), process.env.ISSUE_USER);
    if (db.entries.filter(x => x.by === e.by).length >= PER_USER) throw new Error('한 사람이 올릴 수 있는 기록 수를 넘었어요');
    if (db.entries.some(x => x.name === e.name && x.score === e.score && x.time === e.time)) throw new Error('이미 올라간 기록이에요');
    db.entries.push(e);
    db.entries.sort((a, b) => b.score - a.score || a.time - b.time);
    db.entries = db.entries.slice(0, MAX);
    db.updated = new Date().toISOString();
    fs.writeFileSync(FILE, JSON.stringify(db, null, 1) + '\n');
    const rank = db.entries.findIndex(x => x === e) + 1;
    res = { ok: true, rank: rank > 0 ? rank : MAX + 1, total: db.entries.length, name: e.name, score: e.score };
  } catch (err) { res = { ok: false, error: err.message }; }
  fs.writeFileSync(RESULT, JSON.stringify(res));
  console.log(JSON.stringify(res));
}
function notify() {
  let res = { ok: false, error: '처리하지 못했어요' }; try { res = JSON.parse(fs.readFileSync(RESULT, 'utf8')); } catch (_) { }
  const n = process.env.ISSUE_NUMBER;
  const msg = res.ok ? `랭킹에 올렸어요! **${res.rank}위** (${res.name}, ${res.score.toLocaleString('ko-KR')}점). 게임의 랭킹 화면에는 몇 분 안에 보여요.` : `기록을 올리지 못했어요: ${res.error}`;
  execFileSync('gh', ['issue', 'comment', n, '--body', msg], { stdio: 'inherit' });
  execFileSync('gh', ['issue', 'close', n, '--reason', res.ok ? 'completed' : 'not planned'], { stdio: 'inherit' });
}
if (require.main === module) { if (process.argv.includes('--notify')) notify(); else run(); }
module.exports = { parseBody, validate, score };
