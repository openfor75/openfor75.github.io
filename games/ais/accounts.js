/* ============================================================
   accounts.js — 會計項目庫(57 項)
   cls: A 資產 / L 負債 / C 權益 / R 收益 / E 費損
   陣列順序 = 顯示順序(依台科大《會計項目彙總》財報表達順序,
   引擎不會再排序,直接照這個順序跑選單、試算表與報表)

   ★ 若妳手上「分錄大卷」的 data.js 才是最終版,
     直接用那一份覆蓋本檔即可(欄位名稱 name / cls 相同)。
   ============================================================ */

const ACCOUNTS = [
  /* ---- A 資產 19 ---- */
  { name: '現金',                            cls: 'A' },
  { name: '銀行存款',                        cls: 'A' },
  { name: '強制透過損益按公允價值衡量之金融資產', cls: 'A' },
  { name: '應收票據',                        cls: 'A' },
  { name: '應收帳款',                        cls: 'A' },
  { name: '備抵損失-應收帳款',               cls: 'A' },
  { name: '存貨',                            cls: 'A' },
  { name: '預付貨款',                        cls: 'A' },
  { name: '暫付款',                          cls: 'A' },
  { name: '預付保險費',                      cls: 'A' },
  { name: '預付租金',                        cls: 'A' },
  { name: '預付廣告費',                      cls: 'A' },
  { name: '進項稅額',                        cls: 'A' },
  { name: '土地成本',                        cls: 'A' },
  { name: '房屋及建築成本',                  cls: 'A' },
  { name: '機器設備成本',                    cls: 'A' },
  { name: '運輸設備成本',                    cls: 'A' },
  { name: '辦公設備成本',                    cls: 'A' },
  { name: '存出保證金',                      cls: 'A' },

  /* ---- L 負債 7 ---- */
  { name: '預收貨款',                        cls: 'L' },
  { name: '應付票據',                        cls: 'L' },
  { name: '應付帳款',                        cls: 'L' },
  { name: '應付薪資',                        cls: 'L' },
  { name: '代收款',                          cls: 'L' },
  { name: '銷項稅額',                        cls: 'L' },
  { name: '存入保證金',                      cls: 'L' },

  /* ---- C 權益 2 ---- */
  { name: '業主資本',                        cls: 'C' },
  { name: '業主往來',                        cls: 'C' },

  /* ---- R 收益 7 ---- */
  { name: '銷貨收入',                        cls: 'R' },
  { name: '銷貨退回',                        cls: 'R' },
  { name: '銷貨折讓',                        cls: 'R' },
  { name: '佣金收入',                        cls: 'R' },
  { name: '租金收入',                        cls: 'R' },
  { name: '利息收入',                        cls: 'R' },
  { name: '其他收入',                        cls: 'R' },

  /* ---- E 費損 22 ---- */
  { name: '進貨',                            cls: 'E' },
  { name: '進貨費用',                        cls: 'E' },
  { name: '進貨退出',                        cls: 'E' },
  { name: '進貨折讓',                        cls: 'E' },
  { name: '薪資支出',                        cls: 'E' },
  { name: '租金支出',                        cls: 'E' },
  { name: '廣告費',                          cls: 'E' },
  { name: '保險費',                          cls: 'E' },
  { name: '運費',                            cls: 'E' },
  { name: '文具用品',                        cls: 'E' },
  { name: '書報雜誌',                        cls: 'E' },
  { name: '水電瓦斯費',                      cls: 'E' },
  { name: '郵電費',                          cls: 'E' },
  { name: '修繕費',                          cls: 'E' },
  { name: '旅費',                            cls: 'E' },
  { name: '交際費',                          cls: 'E' },
  { name: '職工福利',                        cls: 'E' },
  { name: '捐贈',                            cls: 'E' },
  { name: '佣金支出',                        cls: 'E' },
  { name: '其他費用',                        cls: 'E' },
  { name: '其他損失',                        cls: 'E' },
  { name: '利息費用',                        cls: 'E' },
];

window.ACCOUNTS = ACCOUNTS;
