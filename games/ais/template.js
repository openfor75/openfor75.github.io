/* ============================================================
   題組檔範本 — 複製本檔另存為 setXX.js 後填內容
   放好之後,到 index.html 的「新增題組」區塊加一行:
       <script src="sets/setXX.js"></script>
   ============================================================ */

window.AIS_SETS = window.AIS_SETS || [];

window.AIS_SETS.push({
  id: 'set01',                       // 唯一代號,也是 localStorage 的 key
  title: '宇宙商店',
  examNo: '14902-109301',
  basis: '先虛後實',                 // 或「先實後虛」,顯示在頂部膠囊
  notes: ['實地盤存制', '不考慮營業稅', '金額計算至元,四捨五入'],
  period: '民國102年12月',

  // 開帳試算表:照原卷逐項抄,side 為 dr / cr;順序依 accounts.js 流動性排列
  opening: [
    { acct: '現金', side: 'dr', amt: 456876 },
    { acct: '備抵損失-應收帳款', side: 'cr', amt: 3400 },
    // ...
  ],

  // 題組有給期末存貨才填數字;沒給就維持 null(報表自動改列收益及費損類餘額表)
  endingInventory: null,

  // 若題組用到 accounts.js 沒有的項目,在這裡宣告(after 為插入位置的錨點)
  // extraAccounts: [{ name:'累計折舊-運輸設備', cls:'A', after:'運輸設備成本' }],

  txns: [
    {
      no: 1,
      date: '12/02',
      text: '現銷商品 $70,000,另付運費 $5,000(應由本店負擔)。',
      entries: [                     // 一個 entry = 一張日記簿卡
        { dr: [{ acct: '現金', amt: 70000 }],
          cr: [{ acct: '銷貨收入', amt: 70000 }] },
        { dr: [{ acct: '運費', amt: 5000 }],
          cr: [{ acct: '現金', amt: 5000 }] }
      ],
      note: ''                       // 對帳時顯示的詳解
    },
    {
      no: 26,
      date: '12/26',
      text: '與銀行簽訂透支額度契約,尚未動用。',
      entries: [],                   // 空陣列 = 本題不作分錄
      note: '僅簽訂契約,資產負債未變動,無須分錄。'
    }
  ]
});