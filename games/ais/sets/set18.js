/* 會計資訊系統(手機版)  Copyright (c) 2026 亭妤
   授權 CC BY-NC-SA 4.0 — 可自由用於教學,禁止商業使用,請保留本標示。 */
/* ============================================================
   世界商店　試題編號 14902-109318　民國102年12月
   資料來源:勞動部勞動力發展署術科試題 + 官方標準答案
             (11/30 開帳試算表、12/31 調整後試算表、
              12月份日記簿、102年度綜合損益表)
   開帳試算表合計 911,100 借貸平衡
   12 個題號(12月份交易 4 筆 + 年底調整 8 筆)
   日記簿合計 319,300(與官方相符)
   過帳後(調整後)試算表合計 1,098,700(與官方相符)
   本期損益 (97,200) 淨損

   ★★ 本檔不需要修改 index.html ★★
      「試算表節錄」表格是由本檔案最下方的一段小程式自己畫上去的
      (偵測到目前顯示的是本題組的題目時,才把表格接在題目卡下面)。
      引擎一個字都不用動,也不會影響其他題組。

   ★ 本卷是特殊題型 ────────────────────────────────
     原卷各題只寫事由、不寫金額,金額必須靠 12/31 調整後試算表
     與「目前帳上餘額」相減求得。帳上餘額請學生自己按「查帳」看,
     這正是本系統要訓練的能力,所以題目只給 12/31 那一欄。
     第 3、4 題金額已寫在題目裡,不附表。
   ────────────────────────────────────────────────

   ★ 兩點轉檔判讀:
     1. 原卷 11/30 試算表漏印「利息收入」「銷貨成本」「薪資支出」
        三項,但調整後試算表與官方日記簿都用到。本檔以 amt:0 補進
        opening(位置依調整後試算表順序),不影響借貸平衡。
     2. 期末存貨採銷貨成本法(調整第 8 項)結轉,故用
        endingInventory + cogsAccount,綜合損益表直接印該項目餘額。
   ============================================================ */

window.AIS_SETS = window.AIS_SETS || [];

window.AIS_SETS.push({
  id: 'set18',
  title: '世界商店',
  examNo: '14902-109318',
  basis: '先虛後實',
  notes: ['實地盤存制', '不考慮營業稅', '收入採總額認列', '期初未作轉回分錄',
          '金額計算至元位止,以下四捨五入', '不得增設會計項目'],
  period: '民國102年12月',
  voucher: 4,              // 原卷要求「將12月份交易及調整事項登錄傳票」
  onlySetAccounts: true,   // 不得增設會計項目 → 選單只出現本題組的項目

  extraAccounts: [
    { name: '應收利息', cls: 'A', after: '備抵損失-應收帳款' },
    { name: '預收佣金', cls: 'L', after: '預收貨款' }
  ],

  /* 民國102年11月30日 試算表 —— 順序照原卷;原卷印出但無餘額的項目
     以 amt:0 保留報表位置,另補原卷漏印的利息收入、銷貨成本、薪資支出。 */
  opening: [
    { acct: '現金',              side: 'dr', amt: 79000 },
    { acct: '銀行存款',          side: 'dr', amt: 150000 },
    { acct: '應收帳款',          side: 'dr', amt: 40000 },
    { acct: '備抵損失-應收帳款', side: 'cr', amt: 4000 },
    { acct: '應收利息',          side: 'dr', amt: 0 },
    { acct: '存貨',              side: 'dr', amt: 25000 },
    { acct: '預付保險費',        side: 'dr', amt: 0 },
    { acct: '用品盤存',          side: 'dr', amt: 0 },
    { acct: '土地成本',          side: 'dr', amt: 200000 },
    { acct: '房屋及建築成本',    side: 'dr', amt: 350000 },
    { acct: '累計折舊-房屋及建築', side: 'cr', amt: 70000 },
    { acct: '存出保證金',        side: 'dr', amt: 4000 },
    { acct: '預收佣金',          side: 'cr', amt: 0 },
    { acct: '應付帳款',          side: 'cr', amt: 52000 },
    { acct: '應付薪資',          side: 'cr', amt: 0 },
    { acct: '業主資本',          side: 'cr', amt: 629100 },
    { acct: '銷貨收入',          side: 'cr', amt: 78000 },
    { acct: '銷貨退回',          side: 'dr', amt: 3100 },
    { acct: '銷貨折讓',          side: 'dr', amt: 2000 },
    { acct: '佣金收入',          side: 'cr', amt: 75000 },
    { acct: '利息收入',          side: 'cr', amt: 0 },
    { acct: '銷貨成本',          side: 'dr', amt: 0 },
    { acct: '進貨',              side: 'dr', amt: 50000 },
    { acct: '進貨折讓',          side: 'cr', amt: 3000 },
    { acct: '薪資支出',          side: 'dr', amt: 0 },
    { acct: '文具用品',          side: 'dr', amt: 3000 },
    { acct: '保險費',            side: 'dr', amt: 5000 },
    { acct: '折舊',              side: 'dr', amt: 0 },
    { acct: '預期信用減損損失',  side: 'dr', amt: 0 },
    { acct: '其他損失',          side: 'dr', amt: 0 }
  ],

  endingInventory: 15000,
  cogsAccount: '銷貨成本',

  txns: [
    /* ── 一、12月份交易事項 ── */
    { no: 1, date: '12/08',
      text: '※ 可按下方「查帳」看目前帳上餘額。　銷貨收入增加係因8日之賒銷。',
      entries: [{ dr: [{ acct: '應收帳款', amt: 20000 }],
                  cr: [{ acct: '銷貨收入', amt: 20000 }] }],
      note: '帳上銷貨收入 78,000,調整後應為 98,000,差額 20,000 即為8日賒銷金額(應收帳款同步由 40,000 增為 60,000)。整筆無現金 → 分錄轉帳傳票。' },

    { no: 2, date: '12/10',
      text: '※ 可按下方「查帳」看目前帳上餘額。　於10日賒購商品。',
      entries: [{ dr: [{ acct: '進貨', amt: 10000 }],
                  cr: [{ acct: '應付帳款', amt: 10000 }] }],
      note: '帳上應付帳款 52,000,調整後應為 62,000,差額 10,000。實地盤存制,賒購商品借記「進貨」,不動存貨 → 分錄轉帳傳票。' },

    { no: 3, date: '12/18',
      text: '於18日現購文具一批$1,200。',
      entries: [{ dr: [{ acct: '文具用品', amt: 1200 }],
                  cr: [{ acct: '現金', amt: 1200 }] }],
      note: '先虛後實,購入文具全額借記「文具用品」。貸方只有現金一個項目 → 現金支出傳票。' },

    { no: 4, date: '12/18',
      text: '於18日發現現金減少之係因有一張千元偽鈔。',
      entries: [{ dr: [{ acct: '其他損失', amt: 1000 }],
                  cr: [{ acct: '現金', amt: 1000 }] }],
      note: '偽鈔屬非營業損失,借記「其他損失」1,000。現金 79,000－1,200－1,000＝76,800,與調整後試算表相符。' +
            '本題與第3題雖同為18日,但屬兩件互不相干的事,分開開立兩張傳票。貸方只有現金 → 現金支出傳票。' },

    /* ── 二、年底調整事項 ── */
    { no: 5, date: '12/31',
      text: '※ 可按下方「查帳」看目前帳上餘額。　調整項目(1):預期信用減損損失。',
      entries: [{ dr: [{ acct: '預期信用減損損失', amt: 2000 }],
                  cr: [{ acct: '備抵損失-應收帳款', amt: 2000 }] }],
      note: '帳上備抵損失已有貸餘 4,000,應有餘額 6,000,故補提 2,000。' },

    { no: 6, date: '12/31',
      text: '※ 可按下方「查帳」看目前帳上餘額。　調整項目(2):預付保險費。',
      entries: [{ dr: [{ acct: '預付保險費', amt: 2000 }],
                  cr: [{ acct: '保險費', amt: 2000 }] }],
      note: '先虛後實,付款時全額借記保險費,帳上預付保險費為 0;應有 2,000,故轉列 2,000,保險費餘額由 5,000 降為 3,000。' },

    { no: 7, date: '12/31',
      text: '※ 可按下方「查帳」看目前帳上餘額。　調整項目(3):用品盤存。',
      entries: [{ dr: [{ acct: '用品盤存', amt: 1500 }],
                  cr: [{ acct: '文具用品', amt: 1500 }] }],
      note: '帳上用品盤存為 0,應有 1,500,故轉列 1,500。文具用品 3,000＋12/18 購入 1,200＝4,200,減未耗用 1,500 後餘 2,700,與調整後試算表相符。' },

    { no: 8, date: '12/31',
      text: '※ 可按下方「查帳」看目前帳上餘額。　調整項目(4):累計折舊-房屋及建築。',
      entries: [{ dr: [{ acct: '折舊', amt: 70000 }],
                  cr: [{ acct: '累計折舊-房屋及建築', amt: 70000 }] }],
      note: '帳上累計折舊 70,000,應有 140,000,故本年度提列折舊 70,000。' },

    { no: 9, date: '12/31',
      text: '※ 可按下方「查帳」看目前帳上餘額。　調整項目(5):預收佣金。',
      entries: [{ dr: [{ acct: '佣金收入', amt: 38000 }],
                  cr: [{ acct: '預收佣金', amt: 38000 }] }],
      note: '先虛後實,收款時全額貸記佣金收入 75,000,帳上預收佣金為 0;應有 38,000,故自佣金收入轉出 38,000,佣金收入餘額 75,000－38,000＝37,000。' },

    { no: 10, date: '12/31',
      text: '※ 可按下方「查帳」看目前帳上餘額。　調整項目(6):應付薪資。',
      entries: [{ dr: [{ acct: '薪資支出', amt: 85000 }],
                  cr: [{ acct: '應付薪資', amt: 85000 }] }],
      note: '帳上應付薪資為 0,應有 85,000。薪資已發生但尚未支付,故借記薪資支出 85,000、貸記應付薪資 85,000。' },

    { no: 11, date: '12/31',
      text: '※ 可按下方「查帳」看目前帳上餘額。　調整項目(7):應收利息。',
      entries: [{ dr: [{ acct: '應收利息', amt: 3600 }],
                  cr: [{ acct: '利息收入', amt: 3600 }] }],
      note: '帳上應收利息為 0,應有 3,600。利息已賺得但尚未收現,故借記應收利息 3,600、貸記利息收入 3,600。' },

    { no: 12, date: '12/31',
      text: '※ 可按下方「查帳」看目前帳上餘額。　調整項目(8):銷貨成本。',
      entries: [{ dr: [{ acct: '存貨', amt: 15000 },
                       { acct: '進貨折讓', amt: 3000 },
                       { acct: '銷貨成本', amt: 67000 }],
                  cr: [{ acct: '存貨', amt: 25000 },
                       { acct: '進貨', amt: 60000 }] }],
      note: '帳上銷貨成本為 0、存貨為期初的 25,000,調整後應為銷貨成本 67,000、存貨 15,000(期末)。' +
            '採銷貨成本法限做一分錄:貸方沖掉期初存貨 25,000 與進貨 50,000＋12/10 賒購 10,000＝60,000,' +
            '借方列期末存貨 15,000、進貨折讓 3,000、銷貨成本 67,000。' +
            '驗算:銷貨成本＝期初存貨 25,000＋進貨 60,000－進貨折讓 3,000－期末存貨 15,000＝67,000。' +
            '期初存貨列貸方、期末存貨列借方,兩者不互抵。整筆無現金 → 分錄轉帳傳票。' }
  ]
});

/* ============================================================
   以下是本題組專用的「試算表節錄」表格。
   它會等題目卡片(.qbox)出現,確認裡面顯示的是本題組的題目之後,
   才把表格接在題目卡下面。不是本題組就什麼都不做。
   要停用整個表格,把這一整段(到檔案結尾)刪掉即可,題目照常運作。
   ============================================================ */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;   // 非瀏覽器環境(驗證工具)直接跳過

  // 題號 → 該題要顯示的試算表節錄([會計項目, 借方餘額, 貸方餘額])
  var EXCERPT = {
    1:  [['銷貨收入', '', '98,000']],
    2:  [['應付帳款', '', '62,000']],
    5:  [['備抵損失-應收帳款', '', '6,000'],
         ['預期信用減損損失', '2,000', '']],
    6:  [['預付保險費', '2,000', '']],
    7:  [['用品盤存', '1,500', '']],
    8:  [['累計折舊-房屋及建築', '', '140,000']],
    9:  [['預收佣金', '', '38,000']],
    10: [['應付薪資', '', '85,000']],
    11: [['應收利息', '3,600', '']],
    12: [['存貨', '15,000', ''],
         ['銷貨成本', '67,000', '']]
  };
  var CAP_NAME = '試 算 表(節錄)';
  var CAP_DATE = '民國 102 年 12 月 31 日';
  var MARK = 'tbx18';           // 已插入的標記,避免重複插入
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  // 找出本題組物件(用來確認畫面上顯示的確實是本題組的題目)
  function mySet() {
    var list = window.AIS_SETS || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === 'set18') return list[i];
    return null;
  }

  function addStyle() {
    if (document.getElementById(MARK + '-css')) return;
    var st = document.createElement('style');
    st.id = MARK + '-css';
    st.textContent =
      '.' + MARK + '{margin:10px 0 2px;background:#fffdf7;border:3px solid #1f1b18;' +
      'border-radius:14px;padding:9px 10px 10px;box-shadow:4px 5px 0 rgba(31,27,24,.10)}' +
      '.' + MARK + ' .cap{text-align:center;padding-bottom:6px;border-bottom:2px solid #1f1b18;margin-bottom:6px}' +
      '.' + MARK + ' .cap b{display:block;font-weight:900;font-size:16px;letter-spacing:.12em;line-height:1.35}' +
      '.' + MARK + ' .cap i{display:block;font-style:normal;font-weight:900;font-size:14px;' +
      'letter-spacing:.04em;line-height:1.35;margin-top:1px}' +
      '.' + MARK + ' table{width:100%;border-collapse:collapse;font-size:15.5px}' +
      '.' + MARK + ' th{font-size:13.5px;font-weight:900;color:#6b615a;padding:3px 6px;' +
      'border-bottom:1.5px solid #cfc6bb;text-align:right;white-space:nowrap}' +
      '.' + MARK + ' th:first-child{text-align:left}' +
      '.' + MARK + ' td{padding:5px 6px;border-bottom:1px dashed #d8cfc4;text-align:right;' +
      'font-variant-numeric:tabular-nums;white-space:nowrap}' +
      '.' + MARK + ' td:first-child{text-align:left;font-weight:900;white-space:normal}' +
      '.' + MARK + ' tr:last-child td{border-bottom:none}';
    (document.head || document.documentElement).appendChild(st);
  }

  function tableHTML(rows) {
    var h = '<div class="' + MARK + '"><div class="cap"><b>' + esc(CAP_NAME) + '</b><i>' +
            esc(CAP_DATE) + '</i></div><table>' +
            '<tr><th>會計項目</th><th>借方餘額</th><th>貸方餘額</th></tr>';
    rows.forEach(function (r) {
      h += '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1] || '') + '</td><td>' + esc(r[2] || '') + '</td></tr>';
    });
    return h + '</table></div>';
  }

  var norm = function (s) { return String(s || '').replace(/\s/g, ''); };

  // 找出畫面上的題目卡。優先用 .qbox;萬一引擎改過 class 名稱,
  // 就退而求其次:從「第 N 題」字樣往上找它的卡片容器。
  function cards() {
    var found = document.querySelectorAll('.qbox');
    if (found.length) return [].slice.call(found);
    var out = [], all = document.querySelectorAll('div,section,article,p');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.children.length) continue;                       // 只看最內層的文字節點
      if (!/第\s*\d+\s*題/.test(el.textContent || '')) continue;
      var box = el.parentElement;
      if (box && out.indexOf(box) < 0) out.push(box);
    }
    return out;
  }

  function isErrCard(el) {                                    // 對帳畫面的錯誤卡不要插表格
    for (var n = el; n && n !== document.body; n = n.parentElement) {
      if (/err/i.test(n.className || '')) return true;
    }
    return false;
  }

  function apply() {
    var set = mySet();
    if (!set) return;
    var boxes = cards();
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      if (box.querySelector && box.querySelector('.' + MARK)) continue;   // 已經插過了
      if (isErrCard(box)) continue;
      var whole = box.textContent || '';
      var m = /第\s*(\d+)\s*題/.exec(whole);
      if (!m) continue;
      var no = Number(m[1]), rows = EXCERPT[no];
      if (!rows) continue;
      // 確認畫面上這一題確實是本題組的題目(避免影響其他題組)
      var t = null;
      for (var k = 0; k < set.txns.length; k++) if (set.txns[k].no === no) t = set.txns[k];
      if (!t || norm(whole).indexOf(norm(t.text)) < 0) continue;
      addStyle();
      box.insertAdjacentHTML('beforeend', tableHTML(rows));
    }
  }

  function boot() {
    if (!document.body) { setTimeout(boot, 50); return; }
    apply();
    if (window.MutationObserver) {
      new MutationObserver(function () { apply(); })
        .observe(document.body, { childList: true, subtree: true });
    } else {
      setInterval(apply, 400);   // 舊瀏覽器的退路
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
