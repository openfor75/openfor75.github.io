/* 鳳姨搶答：老師端與學生端共用 */
(function () {
  var params = new URLSearchParams(location.search);
  var API = params.get('api') || window.BATTLE_API || '';

  function apiReady() { return /^https?:\/\//.test(API) && API.indexOf('請貼上') < 0; }

  function api(action, data, timeoutMs) {
    var body = JSON.stringify(Object.assign({ action: action }, data || {}));
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, timeoutMs || 15000) : null;
    // 不設定 Content-Type（預設 text/plain），Apps Script 才不會擋跨網域預檢
    return fetch(API, { method: 'POST', body: body, redirect: 'follow', signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error('http_' + r.status); return r.json(); })
      .finally(function () { if (timer) clearTimeout(timer); });
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

  // 拆小題（item）作答區：①放哪一格 ②列入金額，兩個都選好才能送出。onSubmit(v) 收到 格子×10＋金額
  var ITEM_CSS = '.istep{margin:4px 0 0;font-weight:900}' +
    'button.amtbtn{font-family:var(--font);font-size:1rem;font-weight:900;color:var(--ink);background:#fff;border:3px solid var(--ink);border-radius:14px;padding:10px 12px;text-align:left;display:flex;gap:10px;align-items:center;cursor:pointer;box-shadow:0 4px 0 var(--ink);width:100%;font-variant-numeric:tabular-nums}' +
    'button.amtbtn .ab{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.7em;height:1.7em;border-radius:50%;background:var(--ink);color:#fff;font-size:.85em}' +
    '.amtlist{display:flex;flex-direction:column;gap:8px}' +
    '.sel{outline:4px solid var(--ink);outline-offset:3px;background:var(--sun-soft) !important}' +
    'details.tips{border:2.5px dashed var(--ink);border-radius:14px;background:var(--sun-soft);padding:8px 12px;font-weight:800;line-height:1.6}' +
    'details.tips summary{cursor:pointer;font-weight:900}';
  var itemCssAdded = false;
  function tipsDetails(open) {
    var tips = window.FORMULA_TIPS || [];
    return '<details class="tips"' + (open ? ' open' : '') + '><summary>📒 列入金額公式小抄</summary>' + tips.map(function (t) { return '・' + esc(t); }).join('<br>') + '</details>';
  }
  function itemUI(box, q, onSubmit) {
    if (!itemCssAdded) { var st = document.createElement('style'); st.textContent = ITEM_CSS; document.head.appendChild(st); itemCssAdded = true; }
    var cb = function (i, a, b) { return '<button type="button" class="cellopt o' + i + '" data-c="' + i + '"><span class="k">' + (i + 1) + '</span>' + a + '<br>' + b + '</button>'; };
    box.innerHTML = '<p class="istep">① 放哪一格？</p><div class="cellgrid"><div class="ch blank"></div><div class="ch in">在倉庫裡</div><div class="ch out">不在倉庫裡</div>' +
      '<div class="rh mine">是我的存貨</div>' + cb(0, '倉庫內', '是存貨') + cb(1, '倉庫外', '是存貨') +
      '<div class="rh not">不是我的存貨</div>' + cb(2, '倉庫內', '不是存貨') + cb(3, '倉庫外', '不是存貨') + '</div>' +
      '<p class="istep">② 列入存貨要用多少？</p><div class="amtlist">' + q.options.map(function (o, i) {
        return '<button type="button" class="amtbtn" data-a="' + i + '"><span class="ab">' + 'ABCD'.charAt(i) + '</span><span>' + esc(o) + '</span></button>';
      }).join('') + '</div>' + tipsDetails(false) +
      '<button type="button" class="btn go" data-go disabled style="width:100%">兩個都選好了，送出</button>';
    var c = null, a = null, go = box.querySelector('[data-go]');
    Array.prototype.slice.call(box.querySelectorAll('[data-c]')).forEach(function (b) {
      b.addEventListener('click', function () { c = Number(b.dataset.c); box.querySelectorAll('[data-c]').forEach(function (x) { x.classList.toggle('sel', x === b); }); go.disabled = c === null || a === null; });
    });
    Array.prototype.slice.call(box.querySelectorAll('[data-a]')).forEach(function (b) {
      b.addEventListener('click', function () { a = Number(b.dataset.a); box.querySelectorAll('[data-a]').forEach(function (x) { x.classList.toggle('sel', x === b); }); go.disabled = c === null || a === null; });
    });
    go.addEventListener('click', function () { if (c !== null && a !== null) onSubmit(c * 10 + a); });
  }
  function itemText(q, v) {
    var cells = window.CELL_OPTIONS || ['倉庫內・是存貨', '倉庫外・是存貨', '倉庫內・不是存貨', '倉庫外・不是存貨'];
    return cells[Math.floor(v / 10)] + '／' + (q.options[v % 10] || '');
  }

  window.Battle = { API: API, apiReady: apiReady, api: api, CHAR: CHAR, setFace: setFace, money: money, esc: esc, SHAPES: SHAPES, TEAM_NAMES: TEAM_NAMES, teamColor: teamColor, pickNames: pickNames, itemUI: itemUI, itemText: itemText, tipsDetails: tipsDetails };
})();
