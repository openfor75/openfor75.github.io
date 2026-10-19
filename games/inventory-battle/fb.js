/* 鳳姨搶答：Firebase 連線（Realtime Database＋登入）
 * 學生：匿名登入（不用帳號，重新整理也是同一個身分）
 * 老師：Google 登入，只有 TEACHER_EMAIL 能開房出題（資料庫規則也會擋）
 */
(function () {
  var cfg = window.FIREBASE_CONFIG || {};
  var db = null, auth = null, offset = 0, inited = false;

  function ready() { return !!(window.firebase && cfg.apiKey && cfg.databaseURL); }
  function init() {
    if (inited) return;
    inited = true;
    firebase.initializeApp(cfg);
    db = firebase.database();
    auth = firebase.auth();
    db.ref('.info/serverTimeOffset').on('value', function (s) { offset = s.val() || 0; });
  }
  function now() { return Date.now() + offset; }

  // 等登入狀態確定（第一次回報）
  function waitUser() {
    init();
    return new Promise(function (res) {
      var un = auth.onAuthStateChanged(function (u) { un(); res(u); });
    });
  }
  function anon() {
    return waitUser().then(function (u) {
      if (u) return u;
      return auth.signInAnonymously().then(function (r) { return r.user; });
    });
  }
  function teacher() {
    init();
    var p = new firebase.auth.GoogleAuthProvider();
    p.setCustomParameters({ prompt: 'select_account' });
    return auth.signInWithPopup(p).then(function (r) { return r.user; });
  }
  function isTeacher(u) {
    return !!(u && u.email && window.TEACHER_EMAIL && u.email.toLowerCase() === String(window.TEACHER_EMAIL).toLowerCase());
  }
  function onConnection(cb) {
    init();
    db.ref('.info/connected').on('value', function (s) { cb(s.val() === true); });
  }

  window.FB = {
    ready: ready, init: init, now: now, anon: anon, teacher: teacher, waitUser: waitUser, isTeacher: isTeacher,
    onConnection: onConnection,
    ref: function (p) { init(); return db.ref(p); },
    TS: function () { return firebase.database.ServerValue.TIMESTAMP; },
    signOut: function () { init(); return auth.signOut(); }
  };
})();
