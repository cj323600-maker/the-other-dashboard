/* ERP 접속 기록(2026-11-23 사용자 지시: 공유한 링크로 들어온 사람 · 기기 · 국가 확인)
   포털과 각 보고서 화면이 이 파일을 불러 한 번씩 기록을 보낸다. 받는 곳 = 구글 앱스 스크립트 웹 앱(구글 시트에 한 줄씩 쌓임).
   남기는 것: 시각 · 이름(포털에서 입력한 경우) · 화면 · 열람 방식 · IP · 국가 · 지역 · 도시 · 통신사 · 기기 · 브라우저 · 화면 크기 · 기기 번호(무작위) · 들어온 경로(도메인만).
   같은 기기 · 같은 화면은 30분에 한 번만 기록. 받는 주소(EP)가 비어 있으면 아무것도 하지 않음. */
(function () {
  var EP = "";   // 구글 앱스 스크립트 웹 앱 주소(…/exec). 설치 후 채움
  window.KAA_TRACK_EP = EP;   // 접속 기록 화면이 같은 주소를 씀
  if (!EP || window.__kaaTrack || location.protocol === 'about:') return; window.__kaaTrack = 1;   // 회원사 분석 안쪽 화면(srcdoc)은 겉 화면이 기록
  var LS = { get: function (k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var top = true; try { top = window.self === window.top; } catch (e) { top = false; }
  var P = location.pathname, H = location.hostname;
  var NAMES = [[/daily-dashboard/i, "일간보고"], [/week-dashboard/i, "주간보고"], [/month-dashboard/i, "월간보고"], [/country-dashboard/i, "회원사 분석"], [/auction-dashboard/i, "출품 및 낙찰 추이"],
    [/\/matching\//, "매칭 테이블"], [/\/kmarket\//, "국내 경매장 시장"], [/\/market\//, "수출시장 환경모니터"], [/\/check\//, "보고서 점검 프로그램"], [/\/access\//, "접속 기록"], [/\/precheck\//, "원천 파일 사전 점검기"],
    [/\/(daily|weekly|monthly|member|trend)\/[^/]+\.html?$/, "지난 보고서"], [/the-other-dashboard\/?(index\.html)?$/i, "ERP 포털 홈"]];
  var page = "기타 화면"; for (var i = 0; i < NAMES.length; i++) if (NAMES[i][0].test(P)) { page = NAMES[i][1]; break; }
  if (page === "지난 보고서") page += " · " + decodeURIComponent(P.split("/").pop()).replace(/\.html?$/, "");
  var key = "kaa_tr_" + page, now = Date.now(), last = +LS.get(key) || 0;
  if (now - last < 30 * 60 * 1000) return; LS.set(key, String(now));
  var vid = LS.get("kaa_vid"); if (!vid) { vid = Math.random().toString(36).slice(2, 8).toUpperCase(); LS.set("kaa_vid", vid); }
  var ua = navigator.userAgent || "";
  var os = /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS X|Macintosh/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "기타";
  var br = /KAKAOTALK/i.test(ua) ? "카카오톡 안 브라우저" : /NAVER\(inapp/i.test(ua) ? "네이버 앱" : /SamsungBrowser/.test(ua) ? "삼성 인터넷" : /Whale/.test(ua) ? "웨일" : /Edg\//.test(ua) ? "Edge" : /CriOS|Chrome\//.test(ua) ? "Chrome" : /Firefox|FxiOS/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "기타";
  var ref = ""; try { ref = document.referrer ? new URL(document.referrer).hostname : ""; } catch (e) {}
  var kind = top ? (ref === H ? "포털에서 새 창" : "직접 링크") : "포털 안에서 열람";
  function mask(ip) { if (!ip) return ""; if (ip.indexOf(":") >= 0) return ip.split(":").slice(0, 2).join(":") + ":xxxx"; var a = ip.split("."); return a[0] + ".xxx.xxx.xx"; }
  function send(g) {
    var d = { name: LS.get("kaa_name"), kind: kind, page: page, ip: g.ip || "", country: g.country || "", region: g.region || "", city: g.city || "", org: g.org || "",
      os: os, browser: br, screen: screen.width + "x" + screen.height, vid: vid, ref: ref };
    var body = JSON.stringify(d);
    try { if (navigator.sendBeacon && navigator.sendBeacon(EP, new Blob([body], { type: "text/plain" }))) return; } catch (e) {}
    try { fetch(EP, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: body, keepalive: true }); } catch (e) {}
  }
  function geo() {   // 위치 조회(ipapi.co, 실패하면 ipinfo.io). 둘 다 실패하면 위치 없이 기록
    return fetch("https://ipapi.co/json/").then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { if (j.error) throw 0; return { ip: j.ip, country: j.country_name, region: j.region, city: j.city, org: (j.org || "").replace(/^AS\d+\s*/, "") }; })
      .catch(function () { return fetch("https://ipinfo.io/json").then(function (r) { return r.json(); })
        .then(function (j) { return { ip: j.ip, country: j.country, region: j.region, city: j.city, org: (j.org || "").replace(/^AS\d+\s*/, "") }; }); })
      .catch(function () { return {}; });
  }
  var go = function () { geo().then(send); };
  if (document.readyState === "complete") setTimeout(go, 300); else window.addEventListener("load", function () { setTimeout(go, 300); });
})();
