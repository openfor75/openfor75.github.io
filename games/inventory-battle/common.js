/* 鳳姨搶答：老師端與學生端共用 */
(function () {
  var params = new URLSearchParams(location.search);
  var API = params.get('api') || window.BATTLE_API || '';

  function apiReady() { return /^https?:\/\//.test(API) && API.indexOf('請貼上') < 0; }

  function api(action, data) {
    var body = JSON.stringify(Object.assign({ action: action }, data || {}));
    // 不設定 Content-Type（預設 text/plain），Apps Script 才不會擋跨網域預檢
    return fetch(API, { method: 'POST', body: body, redirect: 'follow' })
      .then(function (r) { return r.json(); });
  }

  var CHAR = '<svg viewBox="-70 -78 190 160" role="img" aria-label="鳳姨">' +
    '<path d="M20 -6 C 28 -62, 92 -60, 86 -6 C 84 22, 34 24, 20 -6 Z" fill="#F4E4C1" stroke="#22262B" stroke-width="2.5"/>' +
    '<path d="M44 -44 q8 6 18 0" fill="none" stroke="#22262B" stroke-width="2"/>' +
    '<circle cx="-20" cy="-20" r="10" fill="#6B4A3A" stroke="#22262B" stroke-width="2"/><circle cx="-8" cy="-29" r="11" fill="#6B4A3A" stroke="#22262B" stroke-width="2"/>' +
    '<circle cx="8" cy="-29" r="11" fill="#6B4A3A" stroke="#22262B" stroke-width="2"/><circle cx="20" cy="-20" r="10" fill="#6B4A3A" stroke="#22262B" stroke-width="2"/>' +
    '<rect x="-18" y="24" width="36" height="28" rx="9" fill="#F2B705" stroke="#22262B" stroke-width="2.5"/>' +
    '<g class="armThink"><path d="M-16 32 Q-34 22 -24 4" fill="none" stroke="#22262B" stroke-width="3" stroke-linecap="round"/></g>' +
    '<g class="armUp" style="display:none"><path d="M-16 30 L-36 6 M16 30 L36 6" fill="none" stroke="#22262B" stroke-width="3" stroke-linecap="round"/></g>' +
    '<path d="M14 30 L26 8" stroke="#22262B" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M-8 52 L-8 64 M8 52 L8 64" stroke="#22262B" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="0" cy="0" r="26" fill="#FFE3CC" stroke="#22262B" stroke-width="2.5"/>' +
    '<circle cx="-16" cy="8" r="5" fill="#F7A1A1"/><circle cx="16" cy="8" r="5" fill="#F7A1A1"/>' +
    '<g class="faceAsk"><circle cx="-8" cy="-3" r="2.6" fill="#22262B"/><circle cx="8" cy="-3" r="2.6" fill="#22262B"/><path d="M-5 11 q5 3 10 0" fill="none" stroke="#22262B" stroke-width="2.2" stroke-linecap="round"/><text x="34" y="-34" font-family="Noto Sans TC, sans-serif" font-size="26" font-weight="900" fill="#22262B">?</text></g>' +
    '<g class="faceHappy" style="display:none"><path d="M-13 -3 q4 -6 8 0 M5 -3 q4 -6 8 0" fill="none" stroke="#22262B" stroke-width="2.4" stroke-linecap="round"/><path d="M-9 9 Q0 21 9 9 Z" fill="#C0392B" stroke="#22262B" stroke-width="2" stroke-linejoin="round"/></g>' +
    '<g class="faceOops" style="display:none"><path d="M-12 -6 l7 4 M-12 -2 l7 -4 M5 -6 l7 4 M5 -2 l7 -4" stroke="#22262B" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="0" cy="13" rx="4" ry="5" fill="#22262B"/><path d="M30 -18 q4 8 0 12 q-4 -4 0 -12 Z" fill="#7CC4E8" stroke="#22262B" stroke-width="1.5"/></g>' +
    '</svg>';

  function setFace(root, kind) {
    if (!root) return;
    var q = function (c) { return root.querySelector('.' + c); };
    if (!q('faceAsk')) return;
    q('faceAsk').style.display = kind === 'ask' ? '' : 'none';
    q('faceHappy').style.display = kind === 'happy' ? '' : 'none';
    q('faceOops').style.display = kind === 'oops' ? '' : 'none';
    q('armThink').style.display = kind === 'ask' ? '' : 'none';
    q('armUp').style.display = kind === 'happy' ? '' : 'none';
  }

  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var SHAPES = ['▲', '◆', '●', '■'];

  // 隨機組名：鼓勵的話（每場從這裡抽，不重複）
  var TEAM_NAMES = ['越變越強', '永不放棄', '勇往直前', '全力以赴', '堅持到底', '天天進步', '相信自己', '火力全開',
    '一起變強', '超越自己', '穩紮穩打', '勢不可擋', '越挫越勇', '使命必達', '步步高升', '無所畏懼'];
  var TEAM_COLORS = ['#D9534F', '#2F6FD1', '#E0A100', '#2E9D5B', '#8E44AD', '#E67E22', '#1597A8', '#C2185B'];
  function teamColor(i) { return TEAM_COLORS[i % TEAM_COLORS.length]; }
  function pickNames(n) {
    var a = TEAM_NAMES.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a.slice(0, n);
  }

  window.Battle = { API: API, apiReady: apiReady, api: api, CHAR: CHAR, setFace: setFace, money: money, esc: esc, SHAPES: SHAPES, TEAM_NAMES: TEAM_NAMES, teamColor: teamColor, pickNames: pickNames };
})();
