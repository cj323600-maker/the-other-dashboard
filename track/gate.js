/* ERP 로그인(2026-11-27 사용자 지시): 이름 + 비밀번호로 들어가고 12시간 뒤 자동 로그아웃. 로그인한 이름은 접속 기록(track.js)에 남는다.
   모든 보고서 · 분석 화면 · 포털의 <head>에서 이 파일을 먼저 불러 화면을 가린다(같은 주소라 한 번 로그인하면 모든 화면 통과).
   주의: 공개 주소의 화면 잠금이라 소스를 보면 내용이 보인다. 링크를 받은 사람만 보게 하는 정도의 보호. */
(function () {
  var HASH = "a66e796f897a67b3b0b3697010611011411456970bb7ab3c4221dda694eafb5b";  // sha256("kaa-erp:" + 비밀번호)
  var HOURS = 12, KEY = "kaa_auth";
  if (navigator.webdriver || location.protocol === "about:" || window.__kaaGate) return;   // 자동 점검 · 회원사 분석 안쪽 화면은 통과
  var inner = false; try { inner = window.self !== window.top; } catch (e) { inner = true; }
  window.__kaaGate = 1;
  function get() { try { var a = JSON.parse(localStorage.getItem(KEY) || "null"); return a && a.n && Date.now() - a.t < HOURS * 3600e3 ? a : null; } catch (e) { return null; } }
  function arm(a) { var left = a.t + HOURS * 3600e3 - Date.now(); setTimeout(function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); }, Math.max(1000, left)); }
  var a = get();
  if (a) { try { localStorage.setItem("kaa_name", a.n); } catch (e) {} window.KAA_USER = a.n; arm(a); return; }
  window.KAA_GATE_WAIT = 1;
  var st = document.createElement("style");
  st.textContent = 'html.kaa-lock body{visibility:hidden;overflow:hidden}#kaaG{visibility:visible;position:fixed;inset:0;z-index:2147483647;background:#0F1E3C;display:flex;align-items:center;justify-content:center;padding:16px;font-family:"Pretendard Variable",Pretendard,-apple-system,"Malgun Gothic",sans-serif}'
    + '#kaaG form{word-break:keep-all;background:#fff;border-radius:20px;padding:30px 26px 26px;width:100%;max-width:360px;box-shadow:0 20px 60px rgba(0,0,0,.35);color:#191F28}'
    + '#kaaG .e{font-size:12px;letter-spacing:.28em;color:#6B7684;font-weight:700}#kaaG h1{margin:6px 0 4px;font-size:22px;font-weight:800}#kaaG p{margin:0 0 18px;font-size:13.5px;color:#4E5968}'
    + '#kaaG label{display:block;font-size:13px;font-weight:700;color:#4E5968;margin:12px 0 6px}#kaaG input{width:100%;box-sizing:border-box;font-size:16px;padding:12px 14px;border:1px solid #D1D6DB;border-radius:12px;outline:none}#kaaG input:focus{border-color:#3182F6}'
    + '#kaaG button{width:100%;margin-top:20px;background:#3182F6;color:#fff;border:0;border-radius:12px;font-size:16px;font-weight:800;padding:14px;cursor:pointer}#kaaG .x{min-height:18px;margin-top:10px;font-size:13px;color:#E5484D;font-weight:600}';
  (document.head || document.documentElement).appendChild(st);
  document.documentElement.classList.add("kaa-lock");
  function sha(s) {
    if (window.crypto && crypto.subtle && window.TextEncoder) return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); });
    return Promise.resolve("");
  }
  function show() {
    if (document.getElementById("kaaG")) return;
    var d = document.createElement("div"); d.id = "kaaG";
    var last = ""; try { last = localStorage.getItem("kaa_name") || ""; } catch (e) {}
    d.innerHTML = '<form autocomplete="on"><div class="e">KOLON AUTO AUCTION</div><h1>전략기획 ERP 로그인</h1><p>이름과 비밀번호를 넣어 주세요. 로그인은 12시간 동안 유지됩니다.</p>'
      + '<label for="kaaN">이름</label><input id="kaaN" name="name" maxlength="20" autocomplete="name" placeholder="예: 홍길동">'
      + '<label for="kaaP">비밀번호</label><input id="kaaP" name="pw" type="password" inputmode="numeric" autocomplete="current-password">'
      + '<button type="submit">들어가기</button><div class="x" id="kaaX"></div></form>';
    document.body.appendChild(d);
    var n = document.getElementById("kaaN"), p = document.getElementById("kaaP"), x = document.getElementById("kaaX");
    n.value = last; (last ? p : n).focus();
    d.querySelector("form").onsubmit = function (ev) {
      ev.preventDefault(); var nm = (n.value || "").trim();
      if (!nm) { x.textContent = "이름을 넣어 주세요."; n.focus(); return; }
      sha("kaa-erp:" + p.value).then(function (hx) {
        if (hx !== HASH) { x.textContent = "비밀번호가 맞지 않습니다."; p.value = ""; p.focus(); return; }
        var au = { n: nm, t: Date.now() };
        try { localStorage.setItem(KEY, JSON.stringify(au)); localStorage.setItem("kaa_name", nm); } catch (e) {}
        window.KAA_USER = nm; window.KAA_GATE_WAIT = 0; arm(au);
        d.remove(); document.documentElement.classList.remove("kaa-lock");
        try { window.dispatchEvent(new Event("kaa-login")); } catch (e) {}
      });
    };
  }
  if (document.body) show(); else document.addEventListener("DOMContentLoaded", show);
})();
