// 자동 점검(node): GitHub Actions(파일 업데이트 · 매시) 또는 배포 후 수동 실행. 결과를 check/history.json · latest.json에 기록.
// 실행: node check/run.js <계기: push|schedule|workflow_dispatch|local>
const fs = require('fs'), path = require('path'), E = require('./engine.js');
const trig = process.argv[2] || 'local', dir = __dirname;
const get = k => fetch(E.H + E.SRC[k][1] + '?t=' + Date.now(), {cache: 'no-store'}).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
E.run(get, new Date(new Date().toLocaleString('en-US', {timeZone: 'Asia/Seoul'}))).then(x => {
  const bad = x.F.concat(x.R).filter(r => r.j === 'bad').map(r => r.t).concat(x.err.map(e => e + ' 불러오기 실패'));
  const rec = {at: new Date().toISOString(), trigger: trig, c: x.c, bad, L: x.L};
  const hp = path.join(dir, 'history.json'); const H = fs.existsSync(hp) ? JSON.parse(fs.readFileSync(hp, 'utf8')) : {runs: []};
  const prev = H.runs[H.runs.length - 1];
  const same = prev && JSON.stringify([prev.c, prev.bad]) === JSON.stringify([rec.c, rec.bad]) && (Date.now() - Date.parse(prev.at)) < 6 * 3600e3 && trig === 'schedule';
  if (!same) { H.runs.push(rec); H.runs = H.runs.slice(-300); fs.writeFileSync(hp, JSON.stringify(H, null, 1)); fs.writeFileSync(path.join(dir, 'latest.json'), JSON.stringify(x, null, 1)); }
  console.log(trig, JSON.stringify(x.c), bad.length ? '문제: ' + bad.join(', ') : '이상 없음', same ? '(기록 생략: 직전과 같음)' : '');
  if (bad.length) process.exitCode = 0;
});
