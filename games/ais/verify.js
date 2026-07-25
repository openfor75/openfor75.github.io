/* 轉檔驗證器:node verify.js  → 檢查 accounts.js 與各題組是否合規 */
const fs = require('fs');
global.window = {};
eval(fs.readFileSync(__dirname + '/accounts.js', 'utf8'));
const ACC = global.window.ACCOUNTS;

const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const grab = (name) => {
  const i = html.indexOf('var ' + name + ' = ');
  const j = html.indexOf('\n};', i);
  return eval('(' + html.slice(i + ('var ' + name + ' = ').length, j + 2) + ')');
};
const SUPP = eval('(' + html.slice(html.indexOf('var SUPPLEMENT = [') + 17, html.indexOf('];', html.indexOf('var SUPPLEMENT = [')) + 1) + ')');
const DEMO = grab('DEMO');

const sets = [DEMO];
fs.readdirSync(__dirname + '/sets').filter(f => /^set\d+\.js$/.test(f)).forEach(f => {
  global.window.AIS_SETS = global.window.AIS_SETS || [];
  eval(fs.readFileSync(__dirname + '/sets/' + f, 'utf8'));
});
(global.window.AIS_SETS || []).forEach(s => sets.push(s));

let fail = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const F = n => n.toLocaleString('en-US');

console.log('會計項目庫');
const cnt = {}; ACC.forEach(a => cnt[a.cls] = (cnt[a.cls] || 0) + 1);
ok(ACC.length === 57, '共 ' + ACC.length + ' 項 (A' + cnt.A + ' L' + cnt.L + ' C' + cnt.C + ' R' + cnt.R + ' E' + cnt.E + ')');
ok(new Set(ACC.map(a => a.name)).size === ACC.length, '沒有重複項目');

const known = new Set(ACC.map(a => a.name)); SUPP.forEach(s => known.add(s.name));

sets.forEach(set => {
  console.log('\n題組:' + set.title + ' (' + set.id + ')');
  let d = 0, c = 0;
  set.opening.forEach(o => o.side === 'dr' ? d += o.amt : c += o.amt);
  ok(d === c, '開帳試算表借貸平衡  借 ' + F(d) + ' / 貸 ' + F(c));

  const miss = new Set();
  const chk = n => { if (!known.has(n) && !(set.extraAccounts || []).some(e => e.name === n)) miss.add(n); };
  set.opening.forEach(o => chk(o.acct));
  let bad = [];
  set.txns.forEach(t => (t.entries || []).forEach((e, i) => {
    let a = 0, b = 0;
    (e.dr || []).forEach(l => { a += l.amt; chk(l.acct); });
    (e.cr || []).forEach(l => { b += l.amt; chk(l.acct); });
    if (a !== b) bad.push('第' + t.no + '題第' + (i + 1) + '筆 借' + F(a) + '≠貸' + F(b));
  }));
  ok(bad.length === 0, '每筆標準分錄借貸相等' + (bad.length ? ' → ' + bad.join('; ') : ''));
  ok(miss.size === 0, '所有會計項目都在項目庫內' + (miss.size ? ' → 缺:' + [...miss].join('、') : ''));
  ok(new Set(set.txns.map(t => t.no)).size === set.txns.length, '題號不重複,共 ' + set.txns.length + ' 題');

  // 過帳
  const bal = {};
  const add = (n, v) => bal[n] = (bal[n] || 0) + v;
  set.opening.forEach(o => add(o.acct, o.side === 'dr' ? o.amt : -o.amt));
  set.txns.forEach(t => (t.entries || []).forEach(e => {
    (e.dr || []).forEach(l => add(l.acct, l.amt));
    (e.cr || []).forEach(l => add(l.acct, -l.amt));
  }));
  let td = 0, tc = 0;
  Object.keys(bal).forEach(k => bal[k] > 0 ? td += bal[k] : tc += -bal[k]);
  ok(td === tc, '過帳後試算表平衡  借 ' + F(td) + ' / 貸 ' + F(tc));

  // 報表
  const EX = set.extraAccounts || [];
  const clsOf = n => (ACC.find(a => a.name === n) || SUPP.find(a => a.name === n) || EX.find(a => a.name === n) || { cls: '?' }).cls;
  const unknown = Object.keys(bal).filter(k => clsOf(k) === '?');
  ok(unknown.length === 0, '每個項目都查得到五大類' + (unknown.length ? ' → ' + unknown.join('、') : ''));
  const B = n => bal[n] || 0;
  const openOf = n => { let v = 0; set.opening.forEach(o => { if (o.acct === n) v = o.side === 'dr' ? o.amt : -o.amt; }); return v; };
  let R = 0, E = 0;
  Object.keys(bal).forEach(k => { if (clsOf(k) === 'R') R += -bal[k]; if (clsOf(k) === 'E') E += bal[k]; });
  const EI = set.endingInventory, CA = set.cogsAccount;   // 銷貨成本法不可再用公式推算一次
  let profit = R - E;
  if (EI !== null && EI !== undefined && !CA) profit += EI - openOf('存貨');

  let A = 0, L = 0, C2 = 0;
  Object.keys(bal).forEach(k => {
    const cl = clsOf(k); let v = bal[k];
    if (cl === 'A') { if (k === '存貨' && EI != null && !CA) v = EI; A += v; }
    if (cl === 'L') L += -v;
    if (cl === 'C') C2 += -v;
  });
  ok(A === L + C2 + profit, '資產負債表平衡  資產 ' + F(A) + ' = 負債 ' + F(L) + ' + 權益 ' + F(C2 + profit));

  if (EI != null && CA) {
    ok(Math.abs(bal['存貨'] || 0) === EI, '調整後存貨餘額等於 endingInventory ' + F(EI));
    ok(Math.abs(B(CA)) > 0, '銷貨成本項目「' + CA + '」有餘額 ' + F(B(CA)));
  } else if (EI != null) {
    const net = -B('銷貨收入') - B('銷貨退回') - B('銷貨折讓');
    const pnet = B('進貨') + B('進貨費用') + B('進貨退出') + B('進貨折讓');
    const cogs = openOf('存貨') + pnet - EI;
    let opx = 0;
    Object.keys(bal).forEach(k => {
      if (clsOf(k) === 'E' && !['進貨', '進貨費用', '進貨退出', '進貨折讓', '利息費用', '其他損失'].includes(k)) opx += bal[k];
    });
    console.log('    損益:銷貨淨額 ' + F(net) + ' − 銷貨成本 ' + F(cogs) + ' − 營業費用 ' + F(opx) + ' = ' + F(net - cogs - opx));
    ok(net - cogs - opx === profit, '損益表本期損益 = 資產負債表本期損益  ' + F(profit));
  }
});

console.log('\n' + (fail ? '✗ 有 ' + fail + ' 項未通過' : '✓ 全部通過'));
process.exit(fail ? 1 : 0);
