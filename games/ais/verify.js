#!/usr/bin/env node
/* 題組檔驗證器
 *
 *   node verify_set.mjs <setXX.js> [--accounts <accounts.js>] [--expect <expected.json>]
 *
 * --accounts  會計項目庫路徑。省略時只用內建的五大類推測,會多報幾個「查不到分類」。
 * --expect    官方答案的期末餘額,用來回頭核對。格式:
 *             { "__journal": 581749,          // 日記簿借(貸)方合計,可省略
 *               "銷貨收入": 1428326,           // 一律填絕對值
 *               "進貨折讓": 6800 }
 *
 * 全部通過才算轉檔完成。
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const setPath = args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--accounts' && args[args.indexOf(a) - 1] !== '--expect');
const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
if (!setPath) { console.error('用法:node verify_set.mjs <setXX.js> [--accounts accounts.js] [--expect expected.json]'); process.exit(2); }

const g = globalThis;
g.window = {};
const accPath = flag('--accounts');
if (accPath) (0, eval)(fs.readFileSync(accPath, 'utf8'));
const ACC = g.window.ACCOUNTS || [];
(0, eval)(fs.readFileSync(setPath, 'utf8'));
const SETS = g.window.AIS_SETS || [];
if (!SETS.length) { console.error('✗ 這個檔案沒有 push 任何題組到 window.AIS_SETS'); process.exit(1); }

// 引擎內建的補充項目
const SUPP = ['房屋及建築', '機器設備', '運輸設備', '辦公設備'].map(n => ({ name: '累計折舊-' + n, cls: 'A' }));

let fail = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const F = n => Number(n).toLocaleString('en-US');

const infer = n =>
  /^累計折舊|^備抵|^預付|^應收|^暫付|^存出保證金|^進項稅額|成本$/.test(n) ? 'A' :
  /^應付|^預收|^代收|^存入保證金|^銷項稅額|^其他應付/.test(n) ? 'L' :
  /^業主/.test(n) ? 'C' :
  /收入$|^銷貨退回|^銷貨折讓/.test(n) ? 'R' : 'E';

for (const set of SETS) {
  console.log('\n題組:' + set.title + ' (' + set.id + ')');

  // 1 必填欄位
  ok(!!set.id && !!set.title && Array.isArray(set.opening) && Array.isArray(set.txns), '必填欄位齊全');
  ok([undefined, 0, 3, 4, true, false].includes(set.voucher), 'voucher 值合法(0/3/4)');

  // 2 開帳表
  let d = 0, c = 0;
  set.opening.forEach(o => { (o.side === 'dr' ? (d += o.amt) : (c += o.amt)); });
  ok(d === c, '開帳試算表借貸平衡  借 ' + F(d) + ' / 貸 ' + F(c));
  ok(set.opening.every(o => o.side === 'dr' || o.side === 'cr'), 'side 只用 dr / cr');
  ok(new Set(set.opening.map(o => o.acct)).size === set.opening.length, '開帳表沒有重複項目');

  // 3 分錄
  const bad = [];
  let jd = 0, jc = 0, cards = 0;
  set.txns.forEach(t => (t.entries || []).forEach((e, i) => {
    cards++;
    let a = 0, b = 0;
    (e.dr || []).forEach(l => { a += l.amt; jd += l.amt; });
    (e.cr || []).forEach(l => { b += l.amt; jc += l.amt; });
    if (a !== b) bad.push('第' + t.no + '題第' + (i + 1) + '筆 借' + F(a) + '≠貸' + F(b));
    const dup = (s) => { const m = (e[s] || []).map(l => l.acct); return m.length !== new Set(m).size; };
    if (dup('dr') || dup('cr')) bad.push('第' + t.no + '題同一邊出現重複項目(應借貸互抵後淨額列示)');
  }));
  ok(bad.length === 0, '每筆分錄借貸相等、同邊無重複項目' + (bad.length ? ' → ' + bad.join('; ') : ''));
  ok(new Set(set.txns.map(t => t.no)).size === set.txns.length, '題號不重複,共 ' + set.txns.length + ' 個題號 / ' + cards + ' 筆分錄');
  const multi = set.txns.filter(t => (t.entries || []).length > 1);
  ok(true, '多筆分錄的題號:' + (multi.length ? multi.map(t => '第' + t.no + '題(' + t.entries.length + '筆)').join('、') : '無'));
  const noEntry = set.txns.filter(t => (t.entries || []).length === 0);
  ok(noEntry.every(t => !!t.note), '無分錄事項都有寫 note' + (noEntry.length ? '(第' + noEntry.map(t => t.no).join('、') + '題)' : '(無)'));

  // 4 會計項目
  const known = new Map();
  ACC.forEach(a => known.set(a.name, a.cls));
  SUPP.forEach(a => known.set(a.name, a.cls));
  (set.extraAccounts || []).forEach(a => known.set(a.name, a.cls));
  const used = new Set();
  set.opening.forEach(o => used.add(o.acct));
  set.txns.forEach(t => (t.entries || []).forEach(e => {
    (e.dr || []).forEach(l => used.add(l.acct));
    (e.cr || []).forEach(l => used.add(l.acct));
  }));
  const undeclared = [...used].filter(n => !known.has(n));
  ok(undeclared.length === 0,
    '所有項目都查得到分類' + (undeclared.length ? ' → 請用 extraAccounts 宣告:' + undeclared.join('、') : ''));
  if (set.extraAccounts?.length) {
    console.log('    ⚑ 本題組新增了 ' + set.extraAccounts.length + ' 個會計項目,請老師確認分類:');
    set.extraAccounts.forEach(a => {
      const guess = infer(a.name);
      console.log('       ' + a.name + ' → ' + a.cls + (guess !== a.cls ? '(自動推測會是 ' + guess + ',請再確認)' : ''));
    });
  }
  const clsOf = n => known.get(n) || infer(n);

  // 5 過帳
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

  // 6 報表平衡
  const openOf = n => { let v = 0; set.opening.forEach(o => { if (o.acct === n) v = o.side === 'dr' ? o.amt : -o.amt; }); return v; };
  const EI = set.endingInventory, CA = set.cogsAccount;   // CA:銷貨成本法,銷貨成本已由調整分錄結轉
  let R = 0, E = 0, A = 0, L = 0, C = 0;
  Object.keys(bal).forEach(k => {
    const cl = clsOf(k); let v = bal[k];
    if (cl === 'R') R += -v;
    if (cl === 'E') E += v;
    if (cl === 'A') { if (k === '存貨' && EI != null && !CA) v = EI; A += v; }
    if (cl === 'L') L += -v;
    if (cl === 'C') C += -v;
  });
  let profit = R - E;
  if (EI != null && !CA) profit += EI - openOf('存貨');
  ok(A === L + C + profit, '資產負債表平衡  資產 ' + F(A) + ' = 負債 ' + F(L) + ' + 權益 ' + F(C + profit));
  console.log('    ' + (EI == null ? '未提供期末存貨 → 報表列收益及費損類餘額表'
    : '期末存貨 ' + F(EI) + ' → 列正式綜合損益表' + (CA ? '(銷貨成本法,成本取「' + CA + '」餘額)' : ''))
    + '　本期' + (profit >= 0 ? '淨利 ' : '淨損 ') + F(Math.abs(profit)));

  // 7 傳票別分布
  const V = (dr, cr) => {
    const D = (dr || []).filter(l => l.acct), C2 = (cr || []).filter(l => l.acct);
    const dc = D.some(l => l.acct === '現金'), cc = C2.some(l => l.acct === '現金');
    if (!dc && !cc) return '分錄轉帳';
    if (dc && !cc && D.length === 1) return '現金收入';
    if (cc && !dc && C2.length === 1) return '現金支出';
    return '現金轉帳';
  };
  const dist = {};
  set.txns.forEach(t => (t.entries || []).forEach(e => { const v = e.vtype || V(e.dr, e.cr); dist[v] = (dist[v] || 0) + 1; }));
  console.log('    傳票別分布:' + (Object.keys(dist).map(k => k + ' ' + dist[k]).join('、') || '無'));

  // 8 與官方答案核對
  const expPath = flag('--expect');
  if (expPath) {
    const exp = JSON.parse(fs.readFileSync(expPath, 'utf8'));
    if (exp.__journal !== undefined) {
      ok(jd === exp.__journal && jc === exp.__journal, '日記簿合計 ' + F(jd) + ' 與官方 ' + F(exp.__journal) + ' 相符');
    }
    let miss = [];
    Object.keys(exp).forEach(k => {
      if (k.startsWith('__')) return;
      const mine = Math.abs(bal[k] || 0);
      if (mine !== exp[k]) miss.push(k + '(我 ' + F(mine) + ' / 官方 ' + F(exp[k]) + ')');
    });
    ok(miss.length === 0, '與官方答案逐項核對 ' + (Object.keys(exp).filter(k => !k.startsWith('__')).length) + ' 個項目'
      + (miss.length ? ' → 不符:' + miss.join('、') : ''));
  } else {
    console.log('    (未提供 --expect,建議把官方總分類帳餘額整理成 JSON 再跑一次)');
  }
}

console.log('\n' + (fail ? '✗ 有 ' + fail + ' 項未通過,不可交付' : '✓ 全部通過'));
process.exit(fail ? 1 : 0);
