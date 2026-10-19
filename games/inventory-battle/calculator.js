/* 小計算機：加減乘除、M+ M− MR MC，按「帶入答案」直接填進金額欄
 * 用法：Calc.show(true/false) 顯示或隱藏右下角的計算機按鈕；Calc.close() 收起面板
 * 按法跟一般桌上型計算機一樣：105000 − 5000 ＝，再按 M+ 存進記憶。
 */
(function () {
  var css = '' +
    '.calc-fab{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:40;font-family:var(--font);font-size:1rem;font-weight:900;color:var(--ink);background:var(--sun);border:3px solid var(--ink);border-radius:999px;padding:10px 16px;box-shadow:0 4px 0 var(--ink);cursor:pointer;display:flex;align-items:center;gap:6px}' +
    '.calc-fab:active{transform:translateY(4px);box-shadow:none}' +
    '.calc-panel{position:fixed;right:max(10px,env(safe-area-inset-right));bottom:max(10px,env(safe-area-inset-bottom));z-index:41;width:min(320px,calc(100vw - 20px));background:#fff;border:3px solid var(--ink);border-radius:20px;box-shadow:0 6px 0 var(--ink);padding:10px;display:flex;flex-direction:column;gap:8px;font-family:var(--font)}' +
    '.calc-top{display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:900}' +
    '.calc-top button{font-family:var(--font);font-weight:900;border:2px solid var(--ink);background:#fff;border-radius:10px;padding:2px 10px;cursor:pointer;min-height:32px}' +
    '.calc-disp{background:#EEF3F0;border:2.5px solid var(--ink);border-radius:12px;padding:6px 10px;text-align:right;font-variant-numeric:tabular-nums}' +
    '.calc-sub{display:flex;justify-content:space-between;font-size:.85rem;font-weight:800;color:var(--muted);min-height:1.2em}' +
    '.calc-num{font-size:1.9rem;font-weight:900;line-height:1.2;word-break:break-all}' +
    '.calc-keys{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}' +
    '.calc-keys button{font-family:var(--font);font-size:1.15rem;font-weight:900;color:var(--ink);background:#fff;border:2.5px solid var(--ink);border-radius:12px;min-height:46px;cursor:pointer;box-shadow:0 3px 0 var(--ink);padding:0}' +
    '.calc-keys button:active{transform:translateY(3px);box-shadow:none}' +
    '.calc-keys .m{background:#E8EEF8;font-size:.95rem}' +
    '.calc-keys .op{background:var(--sun-soft)}' +
    '.calc-keys .eq{background:var(--sun)}' +
    '.calc-keys .ac{background:var(--no-soft)}' +
    '.calc-use{font-family:var(--font);font-size:1.05rem;font-weight:900;color:#fff;background:var(--yes);border:2.5px solid var(--ink);border-radius:12px;min-height:46px;cursor:pointer}' +
    '.calc-use[hidden]{display:none}' +
    '@media (max-width:600px){.calc-keys button{min-height:40px;font-size:1.05rem}.calc-num{font-size:1.6rem}.calc-use{min-height:40px}.calc-panel{gap:6px;padding:8px}}' +
    '@media (min-width:900px){.calc-panel{width:340px}}';
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  var fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'calc-fab'; fab.hidden = true;
  fab.innerHTML = '<span aria-hidden="true">🧮</span>計算機';
  var panel = document.createElement('div');
  panel.className = 'calc-panel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', '計算機');
  panel.innerHTML =
    '<div class="calc-top"><span>🧮 計算機</span><button type="button" data-k="close">收起 ▾</button></div>' +
    '<div class="calc-disp"><div class="calc-sub"><span class="calc-mem"></span><span class="calc-exp"></span></div><div class="calc-num">0</div></div>' +
    '<div class="calc-keys">' +
      '<button type="button" class="m" data-k="MC">MC</button><button type="button" class="m" data-k="MR">MR</button><button type="button" class="m" data-k="M-">M−</button><button type="button" class="m" data-k="M+">M+</button>' +
      '<button type="button" class="ac" data-k="AC">AC</button><button type="button" class="ac" data-k="CE">C</button><button type="button" data-k="BS">⌫</button><button type="button" class="op" data-k="/">÷</button>' +
      '<button type="button" data-k="7">7</button><button type="button" data-k="8">8</button><button type="button" data-k="9">9</button><button type="button" class="op" data-k="*">×</button>' +
      '<button type="button" data-k="4">4</button><button type="button" data-k="5">5</button><button type="button" data-k="6">6</button><button type="button" class="op" data-k="-">−</button>' +
      '<button type="button" data-k="1">1</button><button type="button" data-k="2">2</button><button type="button" data-k="3">3</button><button type="button" class="op" data-k="+">＋</button>' +
      '<button type="button" data-k="0">0</button><button type="button" data-k="00">00</button><button type="button" data-k=".">.</button><button type="button" class="eq" data-k="=">＝</button>' +
    '</div>' +
    '<button type="button" class="calc-use" data-k="use" hidden>帶入答案 ↑</button>';
  document.body.appendChild(fab); document.body.appendChild(panel);

  var numEl = panel.querySelector('.calc-num'), memEl = panel.querySelector('.calc-mem'), expEl = panel.querySelector('.calc-exp'), useBtn = panel.querySelector('.calc-use');
  var cur = '0', acc = null, op = null, fresh = true, mem = 0, err = false;
  var SYM = { '+': '＋', '-': '−', '*': '×', '/': '÷' };

  function clean(x) { return Number(Number(x).toPrecision(12)); }
  function fmt(s) {
    if (err) return '錯誤';
    var neg = s.charAt(0) === '-', t = neg ? s.slice(1) : s;
    var parts = t.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−' : '') + parts.join('.');
  }
  function val() { return Number(cur); }
  function setNum(n) {
    if (!isFinite(n)) { err = true; cur = '0'; return; }
    n = clean(n);
    cur = String(n);
    if (/e/i.test(cur)) cur = n.toFixed(0);
  }
  function calc(a, o, b) {
    if (o === '+') return a + b;
    if (o === '-') return a - b;
    if (o === '*') return a * b;
    if (o === '/') return b === 0 ? NaN : a / b;
    return b;
  }
  function render() {
    numEl.textContent = fmt(cur);
    memEl.textContent = mem !== 0 ? 'M ' + fmt(String(clean(mem))) : '';
    expEl.textContent = op && acc !== null ? fmt(String(clean(acc))) + ' ' + SYM[op] : '';
    var target = document.getElementById('numIn');
    useBtn.hidden = !(target && !target.disabled && target.offsetParent !== null);
  }
  function press(k) {
    if (err && k !== 'AC' && k !== 'close') { err = false; cur = '0'; acc = null; op = null; fresh = true; }
    if (/^\d$/.test(k) || k === '00') {
      if (fresh) { cur = k === '00' ? '0' : k; fresh = false; }
      else if (cur.replace(/[-.]/g, '').length < 12) cur = cur === '0' ? (k === '00' ? '0' : k) : cur + k;
    } else if (k === '.') {
      if (fresh) { cur = '0.'; fresh = false; } else if (cur.indexOf('.') < 0) cur += '.';
    } else if (SYM[k]) {
      if (op && acc !== null && !fresh) { setNum(calc(acc, op, val())); }
      acc = val(); op = k; fresh = true;
    } else if (k === '=') {
      if (op && acc !== null) { var b = fresh ? acc : val(); setNum(calc(acc, op, b)); }
      acc = null; op = null; fresh = true;
    } else if (k === 'AC') {
      cur = '0'; acc = null; op = null; fresh = true; err = false;
    } else if (k === 'CE') {
      cur = '0'; fresh = true;
    } else if (k === 'BS') {
      if (!fresh) { cur = cur.length > 1 ? cur.slice(0, -1) : '0'; if (cur === '-') cur = '0'; }
    } else if (k === 'M+' || k === 'M-') {
      if (op && acc !== null && !fresh) { setNum(calc(acc, op, val())); acc = null; op = null; }
      mem = clean(mem + (k === 'M+' ? 1 : -1) * val()); fresh = true;
    } else if (k === 'MR') {
      setNum(mem); fresh = true;
    } else if (k === 'MC') {
      mem = 0;
    } else if (k === 'use') {
      var target = document.getElementById('numIn');
      if (target && !target.disabled) {
        var n = Math.round(val());
        target.value = String(Math.abs(n));
        target.dispatchEvent(new Event('input', { bubbles: true }));
        close(); target.focus();
      }
    } else if (k === 'close') { close(); return; }
    render();
  }
  // 打開時把頁面底部墊高，題目可以往上捲、不會被計算機擋住
  var padSaved = null;
  function pad(on) {
    if (on) { if (padSaved === null) padSaved = document.body.style.paddingBottom; document.body.style.paddingBottom = (panel.offsetHeight + 24) + 'px'; }
    else if (padSaved !== null) { document.body.style.paddingBottom = padSaved; padSaved = null; }
  }
  function open() { panel.hidden = false; fab.hidden = true; render(); pad(true); }
  function close() { panel.hidden = true; fab.hidden = !visible; pad(false); }
  var visible = false;

  fab.addEventListener('click', open);
  panel.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-k]'); if (!b) return;
    press(b.dataset.k);
  });
  // 電腦鍵盤：計算機打開、且游標不在輸入框時才接手
  document.addEventListener('keydown', function (e) {
    if (panel.hidden) return;
    var tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    var map = { Enter: '=', '=': '=', Backspace: 'BS', Escape: 'close', Delete: 'CE' };
    var k = map[e.key] || (/^[0-9.+\-*/]$/.test(e.key) ? e.key : null);
    if (!k) return;
    e.preventDefault(); e.stopPropagation();
    press(k);
  }, true);

  window.Calc = {
    show: function (on) { visible = !!on; if (!visible) { panel.hidden = true; pad(false); } fab.hidden = !visible || !panel.hidden; if (!panel.hidden) render(); },
    close: close,
    refresh: render,
    _press: press
  };
})();
