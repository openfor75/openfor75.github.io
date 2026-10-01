/* ============================================================
   學習歷程 A4 版面（共用）
   portfolio.html（老師批次輸出 PDF）和 makeup.html（學生預覽）都用這一份，
   改版面只要改這裡，兩邊會一樣。
   ============================================================ */
(function(){
"use strict";

/* ---------- PDF 上的固定文字 ---------- */
var TEXT = {
  SCHOOL: "國立員林家商　商業經營科",
  TERM:   "115 學年度第 1 學期",
  DATE:   "115 年 10 月 1 日（四）",
  COURSE: "專題製作－職場體驗",
  PLACES: "魔菇部落生態休閒農場　×　三井 OUTLET PARK 台中港",
  INTRO:  "上午參訪魔菇部落，聽取企業簡報並參觀智慧蕈菇生產廠區，觀察一家種植蕈菇、發展生技產品的公司，如何以觀光農場、DIY 體驗與門票收入延伸產品線。下午前往三井 OUTLET PARK 台中港，以小組任務的方式實地調查店面位置、折扣定價、動線設計、海景與遊樂設施等集客策略，並運用課堂所學的商業概念分析觀察結果。"
};
var FS = 10.5, FS_MIN = 7.5;   /* 內文字級（pt）；內容太多會先縮照片、再縮字，保證 4 頁 */
var NPHOTO = 4;                /* 學生自選照片最多幾張：前 2 張放第 1 頁，後 2 張放第 2 頁 */

var MOGU=[{"id": "m1", "t": "它到底在賣什麼", "m": "這家公司的產品線不只一種。把你看到、聽到的全部列出來。", "f": [{"k": "a", "l": "產品線盤點", "min": 40}]}, {"id": "m2", "t": "簡報裡的三個數字", "m": "簡報裡的數字——成立幾年、幾座廠、一天出貨多少、市占多少，抓三個記下來。", "f": [{"k": "a", "l": "數字一"}, {"k": "b", "l": "數字二"}, {"k": "c", "l": "數字三"}]}, {"id": "m3", "t": "六星級廠區裡的技術", "m": "智慧蕈菇生產廠區裡，找出一個最厲害的技術或設備，想想它取代了什麼人工。", "f": [{"k": "a", "l": "技術／設備"}, {"k": "b", "l": "取代了什麼、為什麼自動化", "min": 30}]}, {"id": "m4", "t": "為什麼要開觀光農場", "m": "一家種香菇、做生技的公司，為什麼要花錢蓋園區、種落羽松、開小火車、讓學生來 DIY？", "f": [{"k": "a", "l": "推論", "min": 50}]}, {"id": "m5", "t": "250 元買到什麼", "m": "拆解這 250 元裡，實際上買到的是哪些東西？材料？時間？體驗？回憶？", "f": [{"k": "a", "l": "拆解 250 元", "min": 40}, {"k": "b", "l": "漲到 400 元還會來嗎", "min": 30}]}];
var MITSUI=[{"id": "q1", "t": "黃金店面爭奪戰", "m": "220 家店裡，找出位置最好與位置最吃虧的店，比較差別。", "f": [{"k": "a", "l": "位置最好"}, {"k": "b", "l": "好在哪", "min": 30}, {"k": "c", "l": "位置最吃虧"}, {"k": "d", "l": "為什麼吃虧", "min": 30}]}, {"id": "q2", "t": "折扣的數學", "m": "找一個看得到原價和售價的商品，計算實際折數並分析定價手法。", "f": [{"k": "a", "l": "品牌"}, {"k": "b", "l": "原價"}, {"k": "c", "l": "售價"}, {"k": "d", "l": "實際折數"}, {"k": "e", "l": "讓人覺得便宜的手法", "min": 30}], "inline": 4}, {"id": "q3", "t": "一期 vs 二期", "m": "一期 2018 年開幕、二期 2021 年底開幕，比較兩區業種與設計方向。", "f": [{"k": "a", "l": "一期業種"}, {"k": "b", "l": "二期業種"}, {"k": "c", "l": "二期為什麼換方向", "min": 40}]}, {"id": "q4", "t": "海景值多少錢", "m": "全台第一座海港型 OUTLET——風景也是商品。", "f": [{"k": "a", "l": "在「賣風景」的設施", "min": 30}, {"k": "b", "l": "海景對生意的幫助", "min": 40}]}, {"id": "q5", "t": "品牌偵探", "m": "找三個沒聽過的品牌，判斷它賣什麼、賣給誰。", "f": [{"k": "a1", "l": "品牌一"}, {"k": "a2", "l": "賣什麼"}, {"k": "a3", "l": "賣給誰"}, {"k": "b1", "l": "品牌二"}, {"k": "b2", "l": "賣什麼"}, {"k": "b3", "l": "賣給誰"}, {"k": "c1", "l": "品牌三"}, {"k": "c2", "l": "賣什麼"}, {"k": "c3", "l": "賣給誰"}], "grid": 3}, {"id": "q6", "t": "動線實驗", "m": "二期是ㄇ字型的路。從起點走到終點，數一路經過幾家店。", "f": [{"k": "a", "l": "起點"}, {"k": "b", "l": "終點"}, {"k": "c", "l": "經過店數"}, {"k": "d", "l": "為什麼這樣設計", "min": 30}], "inline": 3}, {"id": "q7", "t": "為什麼有遊樂設施", "m": "一個賣衣服的地方，為什麼要花錢蓋摩天輪、雪樂地、遊樂場？", "f": [{"k": "a", "l": "選擇的設施"}, {"k": "b", "l": "在玩的人／等待的人", "min": 30}, {"k": "c", "l": "設施幫商場賺到什麼", "min": 40}]}, {"id": "q8", "t": "最冷清的那一家", "m": "找一家客人最少的店，推測可能的原因。", "f": [{"k": "a", "l": "店名"}, {"k": "b", "l": "原因一"}, {"k": "c", "l": "原因二"}, {"k": "d", "l": "原因三"}]}];
var BONUS={"id": "x1", "t": "★ 加碼關　總經理的位子", "m": "如果台中港明年只能留下一家店，留哪一家？說服一個只看數字的人。", "f": [{"k": "a", "l": "要留的店"}, {"k": "b", "l": "理由一（位置／動線）", "min": 40}, {"k": "c", "l": "理由二（客群／定價）", "min": 40}, {"k": "d", "l": "理由三（親眼所見）", "min": 40}, {"k": "e", "l": "最大的弱點", "min": 30}]};
var TERMS=["4P", "STP", "動線", "坪效", "客單價", "目標客群", "品牌定位", "市場區隔", "差異化", "陳列", "客層", "人流", "定價", "促銷", "通路", "體驗行銷", "集客", "附加價值", "產業升級"];

var CSS = `
/* ===================== A4 頁面（固定淺色，給列印與 PDF 用） ===================== */
.page{width:210mm;height:297mm;background:#fff;color:#1a1d22;display:flex;flex-direction:column;
  padding:12mm 15mm 9mm;overflow:hidden;position:relative;font-family:var(--sans);
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.page .hd{display:flex;justify-content:space-between;font-size:8pt;color:#6b7280;
  border-bottom:0.35mm solid #1a1d22;padding-bottom:1.6mm;margin-bottom:5mm;flex:none}
.page .hd b{color:#1a1d22}
.page .ft{display:flex;justify-content:space-between;font-size:7.5pt;color:#8a9199;
  border-top:0.2mm solid #d0d4da;padding-top:1.6mm;margin-top:3mm;flex:none}
.page .body{flex:1;min-height:0;overflow:hidden;font-size:10.5pt;line-height:1.72}
.page p{margin:0}
.page .kick{font-size:.78em;color:#dd4f1f;font-weight:700}
.page h1{font-size:2.5em;font-weight:900;margin:.1em 0 .1em;line-height:1.15;color:#15181d}
.page .lead{font-size:1.05em;color:#4a5059;font-weight:500}
.page h2{font-size:1.16em;font-weight:900;margin:1.05em 0 .5em;padding-left:.55em;
  border-left:.3em solid #dd4f1f;line-height:1.3;color:#15181d}
.page h2.first{margin-top:0}
.page h2 small{font-weight:500;color:#7b828c;font-size:.72em;margin-left:.5em}
.page table.info{width:100%;border-collapse:collapse;font-size:.9em;margin-top:1.1em}
.page table.info th{background:#f1f2f4;font-weight:700;text-align:left;width:5.2em;padding:.32em .6em;
  border:0.2mm solid #c9ced6;white-space:nowrap;color:#33383f}
.page table.info td{padding:.32em .6em;border:0.2mm solid #c9ced6}
.page .intro{font-size:.93em;color:#33383f;text-align:justify}
.page .scorebox{display:flex;gap:1.1em;align-items:stretch}
.page .big{flex:none;width:8.6em;background:#15181d;color:#fff;border-radius:.6em;padding:.7em .5em;
  text-align:center;display:flex;flex-direction:column;justify-content:center}
.page .big b{font-size:3.3em;line-height:1.05;font-weight:900}
.page .big span{font-size:.78em;color:#c9ced6}
.page table.sc{flex:1;border-collapse:collapse;font-size:.86em}
.page table.sc td{padding:.22em .5em;border-bottom:0.2mm solid #e1e4e8}
.page table.sc td.n{text-align:right;white-space:nowrap}
.page table.sc td.d{color:#7b828c;font-size:.9em}
.page table.sc tr.mid td{font-weight:700;background:#f6f7f8}
.page table.sc tr.tot td{font-weight:900;border-top:0.45mm solid #15181d;border-bottom:none;font-size:1.08em}
.page .duo{display:flex;gap:4mm;margin-top:.4em}
.page .duo figure{flex:1;margin:0;min-width:0}
.page .pic{background-size:cover;background-position:center;background-repeat:no-repeat;
  border-radius:1.6mm;border:0.2mm solid #c9ced6;background-color:#f1f2f4}
.page .duo .pic{height:64mm}
.page .duo.one .pic{height:80mm}
.page figcaption{font-size:.78em;color:#4a5059;margin-top:.25em;text-align:center}
.page .free{text-align:justify;word-break:break-word}
.page .none{color:#9aa0a8}
.page .meta{font-size:.76em;color:#7b828c;margin-top:.2em}
.page .chips{margin-top:.3em}
.page .chips span{display:inline-block;border:0.25mm solid #9a6c00;color:#7a5600;border-radius:99px;
  padding:0 .65em;margin:0 .3em .3em 0;font-size:.8em;line-height:1.7}
.page .qa{display:flex;gap:.9em;margin:0 0 .85em;padding-bottom:.75em;border-bottom:0.2mm dashed #d0d4da}
.page .qa:last-child{border-bottom:none}
.page .qa .tx{flex:1;min-width:0}
.page .qa .qt{font-weight:900;font-size:1.02em;color:#15181d}
.page .qa .qt i{font-style:normal;color:#dd4f1f;margin-right:.35em}
.page .qa .mi{font-size:.78em;color:#7b828c;margin:.1em 0 .3em;line-height:1.55}
.page .qa .an{margin:0 0 .12em;word-break:break-word}
.page .qa .an .lb{color:#14566b;font-weight:700;margin-right:.45em;font-size:.86em}
.page .qa .pic{flex:none;width:12.5em;height:9.2em}
.page .grpnote{font-size:.82em;color:#4a5059;background:#f4f5f7;border-radius:1.4mm;padding:.45em .8em;margin-bottom:.9em}
.page .duo.fill{margin-top:1em}
`;

function injectCss(){
  if(document.getElementById("sheet-css")) return;
  var s=document.createElement("style"); s.id="sheet-css"; s.textContent=CSS; document.head.appendChild(s);
}
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function br(s){ return esc(String(s||"").trim()).replace(/\r?\n/g,"<br>"); }
function len(s){ return String(s||"").replace(/\s/g,"").length; }
function ALL(){ return MOGU.concat(MITSUI).concat([BONUS]); }
function Q(id){ return ALL().filter(function(x){ return x.id===id; })[0]; }
function myId(cls,no){ return (cls+"-"+no).replace(/[.#$\[\]\/\s]/g,""); }
function picKey(cls,no,i){ return "sheetP-"+myId(cls,no)+"-"+i; }   /* sheet 開頭：計分、照片數都不會算到它 */

/* ---------- 小組計分（與 score.html 同一套）。g = {d, ph, pics} ---------- */
function score(g,photofree){
  function val(q,f){ return String(((g.d[q]||{})[f])||"").trim(); }
  function sc(qid){
    var q=Q(qid); if(!q) return 0;
    if(qid.charAt(0)==="x"){
      var s=0; q.f.forEach(function(f){ var t=val(qid,f.k); if(f.min? t.length>=f.min : t.length>0) s+=1; });
      return Math.min(5,s);
    }
    var filled=q.f.every(function(f){ return val(qid,f.k).length>0; });
    var mins=q.f.filter(function(f){ return f.min; });
    var lng=mins.length?mins.every(function(f){ return val(qid,f.k).length>=f.min; }):filled;
    var s2=0;
    if(qid.charAt(0)==="m"){ if(filled)s2+=4; if(lng)s2+=4; }
    else { if(photofree||g.ph[qid])s2+=3; if(filled)s2+=4; if(lng)s2+=3; }
    return s2;
  }
  g.sc=sc;
  g.mo=0; MOGU.forEach(function(q){ g.mo+=sc(q.id); });
  var qs=[]; for(var z in g.d) if(z.charAt(0)==="q") qs.push({id:z,s:sc(z)});
  qs.sort(function(a,b){ return b.s-a.s || a.id.localeCompare(b.id); });
  g.qtop=qs.slice(0,4).map(function(x){ return x.id; });
  g.mi=qs.slice(0,4).reduce(function(a,x){ return a+x.s; },0);
  g.bo=g.d.x1?sc("x1"):0;
  var txt=""; for(var q in g.d) for(var f in g.d[q]) txt+=String(g.d[q][f]||"")+" ";
  g.terms=TERMS.filter(function(w){ return txt.indexOf(w)>=0; });
  g.te=Math.min(5,g.terms.length);
  g.task=g.mo+g.mi+g.te;
  g.nq=Object.keys(g.ph).filter(function(z){ return z.charAt(0)==="q"; }).length;
  g.nreal=Object.keys(g.pics).filter(function(z){ return z.charAt(0)==="q"; }).length;
  return g;
}
function reflTerms(r){ var all=[r.a,r.b,r.c].join(" "); return TERMS.filter(function(w){ return all.indexOf(w)>=0; }); }

/* ---------- 照片 ---------- */
/* 學生自選的照片（含說明），依 1→4 的順序 */
function myPics(D){
  var out=[];
  for(var i=1;i<=NPHOTO;i++){
    var src=D.g.pics[picKey(D.cls,D.s.no,i)];
    if(src) out.push({src:src,cap:String((D.r||{})["p"+i]||"").trim()});
  }
  return out;
}
function firstPic(g,pref){
  var ks=Object.keys(g.pics).filter(function(z){ return z.charAt(0)===pref; }).sort();
  if(pref==="q") ks.sort(function(a,b){ return (g.qtop.indexOf(a)<0)-(g.qtop.indexOf(b)<0) || a.localeCompare(b); });
  return ks.length?g.pics[ks[0]]:"";
}
/* 第 1 頁兩張、第 2 頁兩張。學生沒選夠，第 1 頁用小組的代表照片補 */
function photoPlan(D){
  var mine=myPics(D), g=D.g, p1=mine.slice(0,2), p2=mine.slice(2,4);
  var fb=[];
  var pm=g.pics.sheetM||firstPic(g,"m"), pt=g.pics.sheetT||firstPic(g,"q");
  if(pm) fb.push({src:pm,cap:"上午　魔菇部落生態休閒農場"});
  if(pt) fb.push({src:pt,cap:"下午　三井 OUTLET PARK 台中港"});
  fb.forEach(function(x){
    if(p1.length<2&&!mine.some(function(m){ return m.src===x.src; })) p1.push(x);
  });
  return {p1:p1,p2:p2};
}

/* ---------- A4 頁面 ---------- */
function picDiv(src,cls,mx,mn){
  return '<div class="pic'+(cls?" "+cls:"")+'"'+(mx?' data-max="'+mx+'" data-min="'+mn+'"':'')+' style="background-image:url(\''+src+'\')"></div>';
}
function duo(list,mx,mn,extra){
  if(!list.length) return "";
  var h=['<div class="duo'+(list.length===1?" one":"")+(extra?" "+extra:"")+'">'];
  list.forEach(function(x){ h.push('<figure>'+picDiv(x.src,"flex",list.length===1?mx+16:mx,mn)+(x.cap?'<figcaption>'+esc(x.cap)+'</figcaption>':'')+'</figure>'); });
  h.push('</div>');
  return h.join("");
}
function hd(D){ return '<div class="hd"><span>職場體驗學習成果　'+esc(TEXT.TERM)+'</span><span><b>'+esc(D.cls+"　"+D.s.no+" 號　"+D.s.name)+'</b></span></div>'; }
function ft(n){ return '<div class="ft"><span>'+esc(TEXT.SCHOOL)+'</span><span>'+n+' / 4</span></div>'; }
function page(D,n,body){ return '<section class="page">'+hd(D)+'<div class="body">'+body+'</div>'+ft(n)+'</section>'; }
function answers(q,row){
  row=row||{};
  var h=[];
  if(q.grid===3){
    ["a","b","c"].forEach(function(p,i){
      var v=[1,2,3].map(function(j){ return String(row[p+j]||"").trim(); });
      if(!v.join("")) return;
      h.push('<p class="an"><span class="lb">品牌'+"一二三".charAt(i)+'</span>'+esc(v[0]||"—")+'　｜　賣：'+esc(v[1]||"—")+'　｜　客群：'+esc(v[2]||"—")+'</p>');
    });
  } else if(q.inline){
    var head=q.f.slice(0,q.inline).map(function(f){ var t=String(row[f.k]||"").trim(); return t?'<span class="lb">'+esc(f.l)+'</span>'+esc(t):""; }).filter(Boolean);
    if(head.length) h.push('<p class="an">'+head.join("　　")+'</p>');
    q.f.slice(q.inline).forEach(function(f){ var t=String(row[f.k]||"").trim(); if(t) h.push('<p class="an"><span class="lb">'+esc(f.l)+'</span>'+br(t)+'</p>'); });
  } else {
    q.f.forEach(function(f){ var t=String(row[f.k]||"").trim(); if(t) h.push('<p class="an"><span class="lb">'+esc(f.l)+'</span>'+br(t)+'</p>'); });
  }
  return h.length?h.join(""):'<p class="an none">（本組未作答）</p>';
}
function qa(D,q,num){
  var g=D.g, src=g.pics[q.id];
  return '<div class="qa"><div class="tx"><div class="qt"><i>'+esc(num)+'</i>'+esc(q.t)+'</div>'
    +'<p class="mi">'+esc(q.m)+'</p>'+answers(q,g.d[q.id])+'</div>'+(src?picDiv(src):"")+'</div>';
}
/* D = {cls, s:{no,name,grp}, mem, g, r:{a,b,c,p1..p4}, 以及分數欄位（opts.score 為 true 才需要）} */
function pagesHTML(D,opts){
  opts=opts||{};
  var g=D.g, P=[], plan=photoPlan(D), rt=reflTerms(D.r), lb=len(D.r.b);
  /* 第 1 頁：封面＋（成績）＋照片 */
  var h=[];
  h.push('<div class="kick">CAREER EXPLORATION　·　2026.10.01</div>');
  h.push('<h1>職場體驗學習成果</h1>');
  h.push('<p class="lead">'+esc(TEXT.PLACES)+'</p>');
  h.push('<table class="info"><tr><th>班級</th><td>'+esc(D.cls)+'</td><th>座號</th><td>'+esc(D.s.no)+'</td><th>姓名</th><td>'+esc(D.s.name)+'</td></tr>'
    +'<tr><th>組別</th><td>第 '+D.s.grp+' 組</td><th>日期</th><td colspan="3">'+esc(TEXT.DATE)+'</td></tr>'
    +'<tr><th>課程</th><td colspan="5">'+esc(TEXT.COURSE)+'　／　'+esc(TEXT.SCHOOL)+'　'+esc(TEXT.TERM)+'</td></tr>'
    +'<tr><th>組員</th><td colspan="5">'+esc(D.mem)+'</td></tr></table>');
  h.push('<h2>活動概述</h2><p class="intro">'+esc(TEXT.INTRO)+'</p>');
  if(opts.score&&opts.scoreHTML) h.push(opts.scoreHTML(D));
  if(plan.p1.length) h.push('<h2>活動照片</h2>'+duo(plan.p1,opts.score?64:92,40));
  P.push(page(D,1,h.join("")));

  /* 第 2 頁：個人心得＋自選照片 */
  h=[];
  h.push('<h2 class="first">今天印象最深的一件事</h2><p class="free">'+(String(D.r.a||"").trim()?br(D.r.a):'<span class="none">（未填寫）</span>')+'</p>');
  h.push('<h2>參訪心得<small>'+lb+' 字</small></h2><p class="free">'+(String(D.r.b||"").trim()?br(D.r.b):'<span class="none">（未填寫）</span>')+'</p>');
  h.push('<h2>給這次活動的建議</h2><p class="free">'+(String(D.r.c||"").trim()?br(D.r.c):'<span class="none">（未填寫）</span>')+'</p>');
  if(rt.length) h.push('<h2>心得中運用的商業概念</h2><div class="chips">'+rt.map(function(w){ return '<span>'+esc(w)+'</span>'; }).join("")+'</div>');
  if(plan.p2.length) h.push(duo(plan.p2,78,38,"fill"));
  P.push(page(D,2,h.join("")));

  /* 第 3 頁：魔菇 */
  h=[];
  h.push('<h2 class="first">小組任務紀錄（一）上午　魔菇部落</h2>');
  h.push('<p class="grpnote">以下為第 '+D.s.grp+' 組現場共同完成的任務紀錄（組員：'+esc(D.mem)+'）。</p>');
  MOGU.forEach(function(q,i){ h.push(qa(D,q,"①②③④⑤".charAt(i))); });
  P.push(page(D,3,h.join("")));

  /* 第 4 頁：三井 */
  h=[];
  h.push('<h2 class="first">小組任務紀錄（二）下午　三井 OUTLET PARK</h2>');
  if(!g.qtop.length) h.push('<p class="grpnote">本組沒有三井任務的雲端紀錄。</p>');
  g.qtop.forEach(function(id,i){ h.push(qa(D,Q(id),"①②③④".charAt(i))); });
  if(g.d.x1&&g.bo) h.push(qa(D,BONUS,"★"));
  if(g.terms.length) h.push('<h2>任務中運用的商業概念</h2><div class="chips">'+g.terms.map(function(w){ return '<span>'+esc(w)+'</span>'; }).join("")+'</div>');
  P.push(page(D,4,h.join("")));
  return P;
}
/* 塞不下時：先把照片一路縮到最小，再縮字，保證每頁都裝得下、整份永遠 4 頁 */
function fit(root){
  root.querySelectorAll(".page").forEach(function(p){
    var b=p.querySelector(".body"), fs=FS;
    var fl=[].slice.call(b.querySelectorAll(".pic.flex"));
    var hs=fl.map(function(x){ return +x.dataset.max; });
    function apply(){ b.style.fontSize=fs+"pt"; fl.forEach(function(x,i){ x.style.height=hs[i]+"mm"; }); }
    function over(){ return b.scrollHeight>b.clientHeight+1; }
    apply();
    while(over()){
      var shrunk=false;
      fl.forEach(function(x,i){ if(hs[i]>+x.dataset.min){ hs[i]=Math.max(+x.dataset.min,hs[i]-4); shrunk=true; } });
      if(!shrunk){ if(fs<=FS_MIN) break; fs=Math.round((fs-0.25)*100)/100; }
      apply();
    }
  });
}
function settle(root){
  var ps=[];
  if(document.fonts&&document.fonts.ready) ps.push(document.fonts.ready);
  root.querySelectorAll(".pic").forEach(function(el){
    var m=/url\('(.*)'\)/.exec(el.getAttribute("style")||""); if(!m) return;
    ps.push(new Promise(function(res){ var i=new Image(); i.onload=i.onerror=function(){ res(); }; i.src=m[1]; }));
  });
  /* 用 setTimeout 不用 requestAnimationFrame：老師批次輸出時切到別的分頁，rAF 會暫停整個卡住 */
  return Promise.all(ps).then(function(){ return new Promise(function(r){ setTimeout(r,30); }); });
}

/* ---------- PDF（需要頁面先載入 html2canvas 和 jsPDF；學生端是按下按鈕才載入） ---------- */
var LIBS=["https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"];
function loadLibs(){
  if(window.html2canvas&&window.jspdf) return Promise.resolve();
  return LIBS.reduce(function(p,src){
    return p.then(function(){ return new Promise(function(res,rej){
      var s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=function(){ rej(new Error("下載工具載入失敗，請檢查網路")); };
      document.head.appendChild(s);
    }); });
  },Promise.resolve());
}
function fname(D){ return D.cls+"_"+D.s.no+"_"+D.s.name+"_職場體驗學習成果.pdf"; }
/* 學習歷程上傳單檔上限 4MB：太大就降畫質重做 */
async function makePdf(D,opts){
  opts=opts||{};
  await loadLibs();
  var st=document.getElementById("sheet-stage");
  if(!st){ st=document.createElement("div"); st.id="sheet-stage"; st.style.cssText="position:absolute;left:-30000px;top:0;width:210mm"; document.body.appendChild(st); }
  st.innerHTML=pagesHTML(D,opts).join("");
  await settle(st);
  fit(st);
  var pages=st.querySelectorAll(".page"), blob=null, max=opts.maxBytes||3.8*1024*1024;
  var tries=opts.tries||[{s:2,q:0.82},{s:1.6,q:0.72},{s:1.3,q:0.6}];
  for(var t=0;t<tries.length;t++){
    var pdf=new jspdf.jsPDF({unit:"mm",format:"a4",compress:true});
    pdf.setProperties({title:D.cls+" "+D.s.no+" "+D.s.name+" 職場體驗學習成果",author:TEXT.SCHOOL});
    for(var i=0;i<pages.length;i++){
      if(opts.onPage) opts.onPage(i+1,pages.length);
      var cv=await html2canvas(pages[i],{scale:tries[t].s,backgroundColor:"#ffffff",logging:false,useCORS:true});
      if(i) pdf.addPage();
      pdf.addImage(cv.toDataURL("image/jpeg",tries[t].q),"JPEG",0,0,210,297,undefined,"FAST");
      cv.width=cv.height=0;   /* 手機記憶體小，用完馬上釋放 */
    }
    blob=pdf.output("blob");
    if(blob.size<=max) break;
  }
  st.innerHTML="";
  return blob;
}
function save(blob,name){
  var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name;
  a.style.display="none"; document.body.appendChild(a); a.click();
  setTimeout(function(){ try{ a.remove(); URL.revokeObjectURL(a.href); }catch(e){} },4000);
}

window.SHEET={TEXT:TEXT,MOGU:MOGU,MITSUI:MITSUI,BONUS:BONUS,TERMS:TERMS,NPHOTO:NPHOTO,
  injectCss:injectCss,score:score,reflTerms:reflTerms,picKey:picKey,myId:myId,len:len,
  pagesHTML:pagesHTML,fit:fit,settle:settle,makePdf:makePdf,save:save,fname:fname};
})();
