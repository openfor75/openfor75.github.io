/* ============================================================
   學生名冊　students.js　　115-1 職場體驗（115/10/01）
   ============================================================
   姓名：依「115年10月1日商經科職場體驗　保險名單」（正式文件）
   組別：依「114學年度第1學期校外參觀分組名單」（導師簽章版）
   每班 7 組。商二乙 10 號 蕭禾佳已取消，未列入。

   格式： { no:"座號", name:"姓名", grp:組別, lead:1 }
          lead:1 ＝ 該組組長（分組名單上每組第一位），程式不會用到。

   學生在手機上只要：選班級 → 選自己的座號 → 輸入通行碼。
   組別和組員名單會自動帶出來，全程不用打字。
   ============================================================ */

var STUDENTS = {

  "商二甲": [
    { no:"01", name:"池安筳", grp:4 },
    { no:"02", name:"李承昱", grp:2, lead:1 },
    { no:"03", name:"李諺承", grp:1 },
    { no:"04", name:"林庠宇", grp:1, lead:1 },
    { no:"05", name:"林彥岑", grp:3 },
    { no:"06", name:"林瑞勝", grp:5, lead:1 },
    { no:"07", name:"張宏陽", grp:7, lead:1 },
    { no:"08", name:"許哲瑀", grp:7 },
    { no:"09", name:"陳泊均", grp:5 },
    { no:"10", name:"黃士楷", grp:6 },
    { no:"11", name:"楊冠程", grp:4 },
    { no:"12", name:"潘尚育", grp:3 },
    { no:"13", name:"蔣昕佑", grp:2 },
    { no:"14", name:"王怡璇", grp:3 },
    { no:"15", name:"王姵媞", grp:6, lead:1 },
    { no:"16", name:"林玉秝", grp:4, lead:1 },
    { no:"17", name:"林宥靜", grp:2 },
    { no:"18", name:"林瑄婕", grp:7 },
    { no:"19", name:"施律羽", grp:5 },
    { no:"20", name:"施霈樺", grp:1 },
    { no:"21", name:"洪依晨", grp:7 },
    { no:"22", name:"胡芸甄", grp:2 },
    { no:"23", name:"徐采瑄", grp:4 },
    { no:"24", name:"許筑珺", grp:6 },
    { no:"25", name:"陳宣蓉", grp:1 },
    { no:"26", name:"陳浿綺", grp:5 },
    { no:"27", name:"曾意晴", grp:5 },
    { no:"28", name:"黃沛恩", grp:6 },
    { no:"29", name:"黃靖雯", grp:4 },
    { no:"30", name:"詹令憶", grp:6 },
    { no:"31", name:"劉芯彤", grp:2 },
    { no:"32", name:"鄭沛菉", grp:3, lead:1 },
    { no:"33", name:"簡彤恩", grp:3 },
    { no:"34", name:"王姿雅", grp:1 }
  ],

  "商二乙": [
    { no:"01", name:"李利明", grp:3 },
    { no:"02", name:"林尚勳", grp:5 },
    { no:"04", name:"張鼎", grp:3 },
    { no:"05", name:"陳科菉", grp:7, lead:1 },
    { no:"06", name:"陳駿璿", grp:2 },
    { no:"07", name:"游凱崴", grp:4 },
    { no:"08", name:"黃新儒", grp:4 },
    { no:"09", name:"楊垠枰", grp:5 },
    { no:"11", name:"蕭嘉成", grp:6 },
    { no:"12", name:"賴宥玗", grp:1, lead:1 },
    { no:"13", name:"尤鈺文", grp:6, lead:1 },
    { no:"14", name:"吳亞萱", grp:5 },
    { no:"15", name:"吳承臻", grp:6 },
    { no:"16", name:"林睿湘", grp:6 },
    { no:"17", name:"邱以蓁", grp:3 },
    { no:"18", name:"范湘甯", grp:4 },
    { no:"19", name:"唐嘉婕", grp:1 },
    { no:"20", name:"康鈺欣", grp:5, lead:1 },
    { no:"21", name:"張心瑜", grp:5 },
    { no:"22", name:"許巧潔", grp:2, lead:1 },
    { no:"23", name:"郭采璇", grp:3, lead:1 },
    { no:"24", name:"陳芊妤", grp:7 },
    { no:"25", name:"游忻璇", grp:1 },
    { no:"26", name:"黃纁慧", grp:2 },
    { no:"27", name:"劉佳昕", grp:7 },
    { no:"28", name:"蔡依恬", grp:7 },
    { no:"30", name:"鄭晴曼", grp:6 },
    { no:"31", name:"蕭予晴", grp:2 },
    { no:"32", name:"賴允菡", grp:4, lead:1 },
    { no:"33", name:"謝恣菱", grp:4 },
    { no:"34", name:"蘇苡妮", grp:7 },
    { no:"36", name:"林庭伃", grp:3 }
  ]

};

/* ============================================================
   【心得上傳補丁】115-1 職場體驗
   貼在 students.js 的最後面即可，不用動 index.html。
   作用：把學生寫在手機裡的心得，自動送到 Firebase
        e/115-1-1001/ans/<組別代碼>/rf/<班級-座號>
   ============================================================ */
(function(){
  "use strict";
  if(/[?&]preview=1/.test(location.search)) return;   /* 預覽模式不上傳 */
  var EVENT_ID="115-1-1001", KEY="ylhc-questday";

  function fnv(s){
    var h=0x811c9dc5;
    for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=(h*0x01000193)>>>0; }
    return ("0000000"+h.toString(16)).slice(-8);
  }
  var lastSig="", lastAt=0, watching="", lastForce=0;

  /* 舊版主程式存答案時是整包覆蓋，會把 rf 洗掉。
     這裡盯著自己那一格，一被洗掉就立刻補寫回去。 */
  function watch(db,path){
    if(watching===path) return;
    watching=path;
    try{
      db.ref(path).on("value",function(sn){
        var v=sn.val();
        if(v&&(v.a||v.b||v.c)) return;
        if(Date.now()-lastForce<3000) return;
        lastForce=Date.now(); lastSig=""; lastAt=0;
        setTimeout(tick,250);
      });
    }catch(e){}
  }

  function tick(){
    if(typeof firebase==="undefined") return;
    var db=null;
    try{ db=firebase.database(); }catch(e){ return; }      /* 等主程式初始化完 */
    if(!db) return;
    var st=null;
    try{ st=JSON.parse(localStorage.getItem(KEY)||"null"); }catch(e){ return; }
    if(!st||!st.locked||!st.cls||!st.grp) return;
    if(!/^\d{4}$/.test(String(st.code||""))) return;

    var r=st.refl||{};
    var a=String(r.a||""), b=String(r.b||""), c=String(r.c||"");
    if(!a&&!b&&!c) return;                                  /* 還沒寫就不送 */

    var id=(String(st.cls||"")+"-"+String(st.no||st.name||"")).replace(/[.#$\[\]\/\s]/g,"");
    if(id.length<2) return;

    var key=fnv(st.cls+"|"+st.grp+"|"+st.code);
    watch(db,"e/"+EVENT_ID+"/ans/"+key+"/rf/"+id);

    var sig=id+"\u0001"+a+"\u0001"+b+"\u0001"+c;
    /* 內容有變就送；沒變也每 15 秒補送一次當保險 */
    if(sig===lastSig && Date.now()-lastAt<15000) return;

    var o={ cls:String(st.cls), grp:String(st.grp) };
    if(st.mem) o.mem=String(st.mem).slice(0,300);
    o["rf/"+id]={ no:String(st.no||""), nm:String(st.name||""),
                  a:a.slice(0,3000), b:b.slice(0,3000), c:c.slice(0,3000),
                  at:firebase.database.ServerValue.TIMESTAMP };
    try{
      db.ref("e/"+EVENT_ID+"/ans/"+key).update(o)
        .then(function(){ lastSig=sig; lastAt=Date.now(); })
        .catch(function(){});
    }catch(e){}
  }
  setInterval(tick,4000);
  document.addEventListener("visibilitychange",function(){ if(!document.hidden) tick(); });
})();

/* ============================================================
   【相簿上傳補丁】115-1 職場體驗
   貼在 students.js 的最後面。
   作用：拿掉拍照欄位的 capture 屬性，讓學生可以
        「現場用相機拍」或「之後從相簿挑先拍好的照片」兩種都行。
   ============================================================ */
(function(){
  "use strict";
  function strip(node){
    if(!node||node.nodeType!==1) return;
    if(node.tagName==="INPUT"&&node.type==="file") node.removeAttribute("capture");
    if(!node.querySelectorAll) return;
    var l=node.querySelectorAll('input[type="file"]');
    for(var i=0;i<l.length;i++) l[i].removeAttribute("capture");
    /* 順便把字改成看得懂的說法 */
    var s=node.querySelectorAll(".ph label span");
    for(var j=0;j<s.length;j++){
      var t=s[j].textContent||"";
      if(t.indexOf("拍照")>=0&&t.indexOf("相簿")<0&&t.indexOf("已拍")<0)
        s[j].textContent=t.replace("拍照","拍照或從相簿選");
    }
  }
  function boot(){
    strip(document.body);
    try{
      new MutationObserver(function(ms){
        for(var i=0;i<ms.length;i++){
          var a=ms[i].addedNodes;
          for(var j=0;j<a.length;j++) strip(a[j]);
        }
      }).observe(document.body,{childList:true,subtree:true});
    }catch(e){}
    setInterval(function(){ strip(document.body); },3000);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();

/* ============================================================
   【鍵盤不要縮下去】115-1 職場體驗
   貼在 students.js 的最後面。
   原因：排行榜是即時的，別組一有分數變動，整頁就重畫一次，
        正在打字的欄位被重建 → 失去焦點 → 手機鍵盤收起來。
   作法：有人正在打字時，先把排行榜的更新壓著，
        等他點到別的地方再一次補上。資料完全不受影響。
   ============================================================ */
(function(){
  "use strict";
  if(typeof firebase==="undefined"||typeof firebase.database!=="function") return;

  var queued=null;
  function typing(){
    var a=document.activeElement;
    return !!(a&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA"));
  }
  function flush(){
    if(typing()||!queued) return;
    var f=queued; queued=null;
    try{ f(); }catch(e){}
  }
  document.addEventListener("focusout",function(){ setTimeout(flush,250); },true);
  setInterval(flush,1500);

  var orig=firebase.database;
  function wrapped(){
    var d=orig.apply(firebase,arguments);
    if(d&&!d.__ylhcWrap){
      d.__ylhcWrap=true;
      var oref=d.ref;
      d.ref=function(p){
        var r=oref.apply(d,arguments);
        if(typeof p==="string"&&/(^|\/)board$/.test(p)&&r&&typeof r.on==="function"){
          var oon=r.on;
          r.on=function(ev,cb){
            return oon.call(r,ev,function(sn){
              if(!typing()){ cb(sn); return; }
              queued=function(){ cb(sn); };     /* 只留最新一筆 */
            });
          };
        }
        return r;
      };
    }
    return d;
  }
  try{
    Object.getOwnPropertyNames(orig).forEach(function(k){
      if(k==="length"||k==="name"||k==="prototype") return;
      try{ Object.defineProperty(wrapped,k,Object.getOwnPropertyDescriptor(orig,k)); }catch(e){}
    });
  }catch(e){}
  if(orig.ServerValue&&!wrapped.ServerValue) wrapped.ServerValue=orig.ServerValue;
  firebase.database=wrapped;
})();