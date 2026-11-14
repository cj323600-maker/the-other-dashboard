/* 보고서 점검 프로그램 엔진(2026-11-14). 브라우저(ERP 메뉴 · 사이드바 상태)와 node(GitHub Actions 자동 점검)가 같은 규칙을 쓴다.
   run(get, now) → {F: 갱신 상태, R: 숫자 일치, c: 판정별 건수, err: 못 불러온 보고서, L: 기준 최근 경매일}
   get(key) → Promise<원본 HTML 문자열>. 보고서 문구를 정규식으로 읽으므로 보고서 문구를 바꾸면 여기도 고친다. */
(function (root) {
"use strict";
var H = "https://cj323600-maker.github.io/";
var SRC = {daily: ["일간보고", "Daily-dashboard/"], weekly: ["주간보고", "week-dashboard/"], monthly: ["월간보고", "Month-dashboard/"], member: ["회원사 분석", "Country-dashboard/"],
  trend: ["출품 및 낙찰 추이", "Auction-dashboard/"], market: ["수출시장 환경모니터", "the-other-dashboard/market/"], kmarket: ["국내 경매장 시장", "the-other-dashboard/kmarket/"], matching: ["매칭 테이블", "the-other-dashboard/matching/"]};
var ENT = {"&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " "};
function text(h) { return h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, function (e) { return ENT[e] || " "; }).replace(/\s+/g, " "); }
var num = function (s) { return s == null ? null : +String(s).replace(/,/g, ""); };
var pad = function (n) { return (n < 10 ? "0" : "") + n; };
var iso = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
var md = function (s) { return s ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : "–"; };
var WK = "일월화수목금토";
function run(get, now) {
  now = now || new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  function addBiz(d, k) { var x = new Date(d); while (k > 0) { x.setDate(x.getDate() + 1); if (x.getDay() % 6) k--; } return x; }
  function prevBiz(d) { var x = new Date(d); do { x.setDate(x.getDate() - 1); } while (x.getDay() === 0 || x.getDay() === 6); return x; }
  function lastAuction() { var x = new Date(today), back = (x.getDay() - 3 + 7) % 7; if (back === 0 && now.getHours() < 19) back = 7; x.setDate(x.getDate() - back); return x; }
  var R = [], F = [];
  function judge(vals, tol) { var v = vals.filter(function (x) { return x.v != null; }).map(function (x) { return x.v; }); if (v.length < vals.length) return "bad"; if (v.length < 2) return "info"; return (Math.max.apply(null, v) - Math.min.apply(null, v)) <= (tol || 0) + 1e-9 ? "ok" : "bad"; }
  function addNum(t, sub, vals, dec, j) { R.push({t: t, sub: sub, vals: vals, dec: dec || 0, j: j || judge(vals)}); }
  function addFresh(nm, last, need, j, why) { F.push({t: nm, last: last, need: need, j: j, sub: why}); }
  var keys = Object.keys(SRC);
  return Promise.all(keys.map(function (k) { return get(k).then(function (h) { return [k, h]; }, function () { return [k, null]; }); })).then(function (arr) {
    var S = {}, T = {}, ERR = [];
    arr.forEach(function (a) { if (a[1] == null) { ERR.push(SRC[a[0]][0]); return; } S[a[0]] = a[1]; T[a[0]] = text(a[1]); });
    var RD = []; if (S.trend) { var re = /\["\d\d\.\d\d\.\d\d", (\d+), (\d+), "(\d{4}-\d\d-\d\d)", \d+, \d+\]/g, m; while ((m = re.exec(S.trend))) RD.push({d: m[3], n: +m[1], w: +m[2]}); }
    var LA = iso(lastAuction()), L = RD.length ? RD[RD.length - 1] : null;
    var sumMo = function (mo, upto) { return RD.filter(function (r) { return r.d.slice(0, 7) === mo && (!upto || r.d <= upto); }).reduce(function (a, r) { a.n += r.n; a.w += r.w; a.k++; return a; }, {n: 0, w: 0, k: 0}); };
    var due = iso(addBiz(new Date(LA), 1)), wk1 = iso(new Date(new Date(LA).getTime() - 7 * 864e5));
    var fresh = function (nm, last, why) { var st = !last ? "bad" : (last >= LA ? "ok" : (iso(today) <= due && last >= wk1 ? "wait" : "bad")); addFresh(nm, last ? md(last) + " 경매" : "찾지 못함", md(LA) + " 경매", st, why); };
    fresh("출품 및 낙찰 추이", L && L.d, "회차 자료 마지막 경매일");
    var mm = T.member && T.member.match(/1\/7~(\d{1,2})\/(\d{1,2})/); fresh("회원사 분석", mm ? "2026-" + pad(+mm[1]) + "-" + pad(+mm[2]) : null, "분석 기간 끝 경매일");
    var mk = T.market && T.market.match(/수출 회원사 낙찰 [\d,]+ ?대 ?1\/7~(\d{1,2})\/(\d{1,2})/); fresh("수출시장 환경모니터", mk ? "2026-" + pad(+mk[1]) + "-" + pad(+mk[2]) : null, "수출 낙찰 누적 기간 끝");
    var mt = S.matching && S.matching.match(/데이터 (\d{4})\.(\d\d)\.(\d\d) 경매까지/); fresh("매칭 테이블", mt ? mt[1] + "-" + mt[2] + "-" + mt[3] : null, "데이터 마지막 경매일");
    var dd = T.daily && T.daily.match(/기준일 (\d{4})\.(\d\d)\.(\d\d)/), dn = iso(prevBiz(today)); if (today.getDay() % 6 && now.getHours() >= 19) dn = iso(today);
    addFresh("일간보고", dd ? md(dd[1] + "-" + dd[2] + "-" + dd[3]) + "(" + WK[new Date(+dd[1], +dd[2] - 1, +dd[3]).getDay()] + ")" : "찾지 못함", md(dn) + " 이후", dd && (dd[1] + "-" + dd[2] + "-" + dd[3]) >= dn ? "ok" : "bad", "기준일 · 평일 19시 이후는 당일, 그 전은 직전 영업일");
    var wkd = T.weekly && T.weekly.match(/경매 (\d{1,2})\/(\d{1,2})\(수\)/), wd = wkd ? "2026-" + pad(+wkd[1]) + "-" + pad(+wkd[2]) : null;
    var thu = new Date(new Date(LA).getTime() + 864e5), wneed = (today > thu || (+today === +thu && now.getHours() >= 17)) ? LA : wk1;
    addFresh("주간보고", wd ? md(wd) + " 경매 주" : "찾지 못함", md(wneed) + " 경매 주", !wd ? "bad" : (wd >= wneed ? "ok" : "bad"), "재무 확정(경매 다음 날 16시) 반영 후 기대 주차");
    var mo = T.monthly && T.monthly.match(/(\d{1,2})월 마감/), pm = new Date(today.getFullYear(), today.getMonth() - (today.getDate() >= 6 ? 1 : 2), 1);
    addFresh("월간보고", mo ? mo[1] + "월 마감" : "찾지 못함", (pm.getMonth() + 1) + "월 마감", mo && +mo[1] >= pm.getMonth() + 1 ? "ok" : "bad", "매월 6일부터 전월 마감본");
    var km = T.kmarket && T.kmarket.match(/~ (\d{4})년 (\d{1,2})월 · 주간 속보 (\d{4})년 (\d{1,2})월 (\d)일 주/);
    addFresh("국내 경매장 시장", km ? km[2] + "월 월간 · " + km[4] + "월 " + km[5] + "주 속보" : "찾지 못함", "협회 공개 일정", km ? "info" : "bad", "협회 자료 공개 시점에 따라 갱신(참고)");
    if (L) {
      var wN = T.weekly && T.weekly.match(/출품 ([\d,]+) \/ [\d,]+대\([\d.]+%\) · 낙찰 ([\d,]+) \/ [\d,]+대/), dW = wd ? RD.filter(function (r) { return r.d === wd; })[0] : null;
      if (dW) { addNum("주간보고 회차 출품", md(wd) + " 경매 · 단위 대", [{s: "추이", v: dW.n}, {s: "주보", v: wN && num(wN[1])}]); addNum("주간보고 회차 낙찰", md(wd) + " 경매 · 단위 대", [{s: "추이", v: dW.w}, {s: "주보", v: wN && num(wN[2])}]); }
      var dm = T.daily && T.daily.match(/월 누적 팀별 성적표.*?합계 ([\d,]+) ([\d,]+) \d+% [\d.]+% ([\d,]+) ([\d,]+) /), dmo = sumMo(dd ? dd[1] + "-" + dd[2] : iso(today).slice(0, 7));
      addNum("이번 달 누적 출품", (dd ? (+dd[2]) + "월" : "") + " · 경매가 지난 회차 합계 · 단위 대", [{s: "추이 합산", v: dmo.n}, {s: "일보 월 누적", v: dm && num(dm[2])}]);
      addNum("이번 달 누적 낙찰", (dd ? (+dd[2]) + "월" : "") + " · 단위 대", [{s: "추이 합산", v: dmo.w}, {s: "일보 월 누적", v: dm && num(dm[4])}]);
      var wc = T.weekly && T.weekly.match(/(\d{1,2})월 누적 출품 ([\d,]+) \/ [\d,]+대\([\d.]+%\) · 낙찰 ([\d,]+) \//);
      if (wc && wd) { var wm = sumMo(wd.slice(0, 7), wd); addNum("주간보고 월 누적 출품 · 낙찰", wc[1] + "월 · " + md(wd) + "까지 · 단위 대", [{s: "추이 출품", v: wm.n}, {s: "주보 출품", v: num(wc[2])}, {s: "추이 낙찰", v: wm.w}, {s: "주보 낙찰", v: num(wc[3])}], 0, (wm.n === num(wc[2]) && wm.w === num(wc[3])) ? "ok" : "bad"); }
      var mN = T.monthly && T.monthly.match(/출품 ([\d,]+) \/ [\d,]+대\([\d.]+%\) · 낙찰 ([\d,]+) \/ [\d,]+대/);
      if (mo) { var m2 = sumMo("2026-" + pad(+mo[1])); addNum("월간보고 월 출품 · 낙찰", mo[1] + "월 · " + m2.k + "회차 · 단위 대", [{s: "추이 출품", v: m2.n}, {s: "월보 출품", v: mN && num(mN[1])}, {s: "추이 낙찰", v: m2.w}, {s: "월보 낙찰", v: mN && num(mN[2])}], 0, (mN && m2.n === num(mN[1]) && m2.w === num(mN[2])) ? "ok" : "bad"); }
      var yr = T.trend && T.trend.match(/2026년 \(\d{1,2}\/\d{1,2}까지\) (\d+)회 ([\d,]+)대 ([\d,]+)대/), mem = S.member && S.member.match(/전사 ([\d,]+)대의/);
      addNum("2026년 누적 낙찰", "추이 회차 합산 = 추이 연도 요약 = 회원사 분석 전사 · 단위 대", [{s: "추이 회차 합산", v: RD.filter(function (r) { return r.d >= "2026"; }).reduce(function (a, r) { return a + r.w; }, 0)}, {s: "추이 연도 요약", v: yr && num(yr[3])}, {s: "회원사 분석", v: mem && num(mem[1])}]);
      var ex = S.member && S.member.match(/누적 낙찰대수[^\d]{0,40}([\d,]+)/), em = T.market && T.market.match(/수출 회원사 낙찰 ([\d,]+) ?대/);
      addNum("2026년 수출 회원사 낙찰", "회원사 분석 = 수출시장 환경모니터 · 단위 대", [{s: "회원사 분석", v: ex && num(ex[1])}, {s: "환경모니터", v: em && num(em[1])}]);
    }
    var dg = T.daily && T.daily.match(/전사 매출이익 재무 확정 .*? ([\d.]+) ([\d.]+) [▲▼]/), wg = T.weekly && T.weekly.match(/낙찰 [\d,]+ \/ [\d,]+대\([\d.]+%\) · 매출이익 ([\d.]+) \/ [\d.]+억원/);
    addNum("이번 달 누적 매출이익(재무 확정)", "일보 월 누적 전사 = 주보 월 누적 · 단위 억원", [{s: "일보", v: dg && +dg[2]}, {s: "주보", v: wg && +wg[1]}], 2);
    var di = T.daily && T.daily.match(/재무 재고 평가액\((\d+\/\d+)\) ([\d.]+)억원/), wi = T.weekly && T.weekly.match(/재고 평가액 ([\d.]+)억원/);
    addNum("재무 재고 평가액", "일보 재고 자산 각주 = 주보 · 단위 억원", [{s: "일보" + (di ? "(" + di[1] + ")" : ""), v: di && +di[2]}, {s: "주보", v: wi && +wi[1]}], 2);
    var c = {ok: 0, bad: 0, wait: 0, info: 0}; R.concat(F).forEach(function (x) { c[x.j]++; });
    return {F: F, R: R, c: c, err: ERR, L: L && L.d, at: now.toISOString()};
  });
}
function browserGet(k) { return fetch(H + SRC[k][1] + "?t=" + Date.now(), {cache: "no-store"}).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }); }
var API = {run: run, SRC: SRC, H: H, browserGet: browserGet, text: text};
if (typeof module !== "undefined" && module.exports) module.exports = API; else root.RCHECK = API;
})(typeof self !== "undefined" ? self : this);
