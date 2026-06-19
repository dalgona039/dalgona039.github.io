/* HOP demo — drives the recreated studio-host shell (menus, zoom, ruler, sample doc).
   The real app renders documents via the rhwp WASM engine; here a representative
   HWP document is shown so the editor frontend can be demonstrated without the engine. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var sbMessage = $('#sb-message'), sbPage = $('#sb-page'), sbZoomVal = $('#sb-zoom-val');

  /* ---------- menu bar: click to open, hover to switch, click-out to close ---------- */
  var menuItems = Array.prototype.slice.call(document.querySelectorAll('#menu-bar .menu-item'));
  var menuOpen = false;
  function closeMenus() { menuItems.forEach(function (m) { m.classList.remove('open'); }); menuOpen = false; }
  menuItems.forEach(function (mi) {
    var title = mi.querySelector('.menu-title');
    title.addEventListener('mousedown', function (e) {
      e.preventDefault(); e.stopPropagation();
      var wasOpen = mi.classList.contains('open');
      closeMenus();
      if (!wasOpen) { mi.classList.add('open'); menuOpen = true; }
    });
    title.addEventListener('mouseenter', function () {
      if (menuOpen && !mi.classList.contains('open')) { closeMenus(); mi.classList.add('open'); menuOpen = true; }
    });
  });
  document.addEventListener('mousedown', closeMenus);

  /* ---------- command routing for menu/toolbar data-cmd ---------- */
  document.querySelectorAll('[data-cmd]').forEach(function (el) {
    el.addEventListener('mousedown', function (e) {
      e.preventDefault();
      var cmd = el.dataset.cmd;
      if (!cmd) return;
      handleCmd(cmd);
      closeMenus();
    });
  });

  function handleCmd(cmd) {
    if (cmd === 'file:open') { loadSampleDoc(); return; }
    if (cmd === 'file:about') { $('#aboutOv').classList.add('on'); return; }
    if (cmd === 'view:zoom-in') { setZoom(zoom + 0.1); return; }
    if (cmd === 'view:zoom-out') { setZoom(zoom - 0.1); return; }
    if (cmd.indexOf('zoom:') === 0) { setZoom(parseInt(cmd.split(':')[1], 10) / 100); return; }
    if (cmd === 'view:ctrl-mark') { toggleBtn('view:ctrl-mark'); document.body.classList.toggle('show-ctrl'); return; }
    if (cmd === 'view:para-mark') { toggleBtn('view:para-mark'); togglePara(); return; }
  }
  function toggleBtn(cmd) {
    document.querySelectorAll('.tb-btn[data-cmd="' + cmd + '"]').forEach(function (b) { b.classList.toggle('on'); });
  }
  function togglePara() {
    document.querySelectorAll('.doc-page .doc-p, .doc-page .doc-h2').forEach(function (p) {
      p.classList.toggle('para-on');
    });
  }

  $('#aboutClose').addEventListener('click', function () { $('#aboutOv').classList.remove('on'); });
  $('#aboutOv').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('on'); });

  /* ---------- zoom ---------- */
  var zoom = 1.0;
  function setZoom(z) {
    zoom = Math.max(0.5, Math.min(z, 3.0));
    var pages = document.querySelectorAll('.doc-page');
    pages.forEach(function (p) { p.style.transform = 'scale(' + zoom + ')'; p.style.transformOrigin = 'top center'; });
    // collapse the margin the scale leaves behind
    pages.forEach(function (p) { p.style.marginBottom = (24 - (1123 * (1 - zoom))) + 'px'; });
    sbZoomVal.textContent = Math.round(zoom * 100) + '%';
    drawRuler();
  }
  $('#sb-zoom-in').addEventListener('click', function () { setZoom(zoom + 0.1); });
  $('#sb-zoom-out').addEventListener('click', function () { setZoom(zoom - 0.1); });
  sbZoomVal.addEventListener('click', function () { setZoom(Math.abs(zoom - 1) < 0.05 ? 0.75 : 1.0); });
  document.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key === '=' || e.key === '+') { e.preventDefault(); setZoom(zoom + 0.1); }
    else if (e.key === '-') { e.preventDefault(); setZoom(zoom - 0.1); }
    else if (e.key === '0') { e.preventDefault(); setZoom(1.0); }
    else if (e.key.toLowerCase() === 'o') { e.preventDefault(); loadSampleDoc(); }
  });

  /* ---------- horizontal ruler (canvas), mirrors Ruler view ---------- */
  function drawRuler() {
    var cv = $('#h-ruler');
    var w = cv.clientWidth, h = cv.clientHeight;
    if (!w) return;
    var dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr; cv.height = h * dpr;
    var ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#eef0f3'; ctx.fillRect(0, 0, w, h);
    // page area in white, ticks every 1cm (~37.8px * zoom)
    var pageW = 794 * zoom;
    var startX = (w - pageW) / 2;
    var margin = 85 * zoom;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX + margin, 0, pageW - margin * 2, h);
    ctx.strokeStyle = '#c4ccd6'; ctx.fillStyle = '#8b94a3';
    ctx.font = '9px Pretendard, sans-serif'; ctx.textAlign = 'center';
    var cm = 37.8 * zoom;
    var originX = startX + margin;
    for (var i = 0; ; i++) {
      var x = originX + i * cm;
      if (x > startX + pageW - margin + 2) break;
      ctx.beginPath(); ctx.moveTo(x, h - 7); ctx.lineTo(x, h); ctx.stroke();
      if (i > 0) ctx.fillText(String(i), x, h - 9);
      // half ticks
      var hx = x + cm / 2;
      if (hx < startX + pageW - margin) { ctx.beginPath(); ctx.moveTo(hx, h - 4); ctx.lineTo(hx, h); ctx.stroke(); }
    }
  }
  window.addEventListener('resize', function () { drawRuler(); });

  /* ---------- sample HWP document ---------- */
  var SAMPLE_HTML =
    '<div class="doc-page"><div class="doc-body">' +
      '<div class="doc-title">대학생 모바일 문서 작성 환경 실태 보고서</div>' +
      '<div class="doc-subtitle">— HWP/HWPX 모바일 편집 경험을 중심으로 —</div>' +
      '<div class="doc-h2">1. 개요</div>' +
      '<p class="doc-p">본 보고서는 대학생의 모바일 환경에서의 문서 작성 실태를 조사하고, 한글 문서(HWP/HWPX) 편집 경험의 제약과 개선 방향을 분석하는 것을 목적으로 한다. 조사는 2025년 2학기 재학생 320명을 대상으로 설문 및 심층 인터뷰 방식으로 진행되었다.</p>' +
      '<p class="doc-p">특히 안드로이드 단말에서의 첨부 파일 열람, 인텐트 기반 문서 연동, 그리고 저장소 접근 권한(Scoped Storage)에 따른 사용성 변화를 중점적으로 살펴보았다.<span class="caret"></span></p>' +
      '<div class="doc-h2">2. 조사 결과</div>' +
      '<p class="doc-p">응답자의 다수는 강의 자료와 과제 양식이 한글 문서 형식으로 배포됨에 따라 모바일에서도 해당 형식을 직접 열람·편집할 수 있는 환경을 필요로 하였다. 주요 응답은 다음 표와 같다.</p>' +
      '<table class="doc-table"><thead><tr><th>항목</th><th>매우 그렇다</th><th>그렇다</th><th>보통</th><th>아니다</th></tr></thead>' +
      '<tbody>' +
      '<tr><td class="l">모바일에서 HWP 열람이 필요하다</td><td>148</td><td>112</td><td>41</td><td>19</td></tr>' +
      '<tr><td class="l">현장에서 즉시 편집이 필요하다</td><td>96</td><td>121</td><td>73</td><td>30</td></tr>' +
      '<tr><td class="l">기존 앱의 사용성에 불편함을 느낀다</td><td>134</td><td>108</td><td>52</td><td>26</td></tr>' +
      '</tbody></table>' +
      '<p class="doc-p">표에서 보듯, 모바일 환경에서의 한글 문서 열람 필요성에 대한 긍정 응답이 전체의 81%에 달하였으며, 즉시 편집 기능에 대한 수요 또한 높게 나타났다.</p>' +
      '<div class="doc-h2">3. 결론 및 제언</div>' +
      '<p class="doc-p">조사 결과를 종합하면, 안드로이드 네이티브 연동과 경량 렌더링 엔진을 갖춘 모바일 한글 편집기의 필요성이 확인되었다. 후속 연구에서는 rhwp 엔진의 모바일 최적화와 인텐트 파이프라인의 안정성을 정량적으로 평가할 필요가 있다.</p>' +
      '<div class="doc-footer">- 1 -</div>' +
    '</div></div>';

  function loadSampleDoc() {
    var container = $('#scroll-container');
    var hint = $('#dropHint');
    if (hint) hint.style.display = 'none';
    // remove existing pages
    container.querySelectorAll('.doc-page').forEach(function (p) { p.remove(); });
    sbMessage.textContent = '파일 로딩 중...';
    setTimeout(function () {
      container.insertAdjacentHTML('beforeend', SAMPLE_HTML);
      setZoom(zoom);
      sbMessage.textContent = '보고서_샘플.hwp — 1페이지 (12.4ms)';
      sbPage.textContent = '1 / 1 쪽';
      enableFormatBar();
      drawRuler();
    }, 260);
  }

  function enableFormatBar() {
    // make B/I/U + align toggles interactive (visual only)
    document.querySelectorAll('#style-bar .sf-btn').forEach(function (b) {
      if (b._wired) return; b._wired = true;
      b.addEventListener('click', function () {
        var aligns = [];
        var isAlign = b.querySelector('svg');
        if (isAlign) {
          // align group = last 4 buttons
          var alignBtns = document.querySelectorAll('#style-bar .sf-btn');
          var alignOnly = Array.prototype.slice.call(alignBtns).filter(function (x) { return x.querySelector('svg'); });
          if (alignOnly.indexOf(b) >= 0) { alignOnly.forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); return; }
        }
        b.classList.toggle('on');
      });
    });
  }

  /* paragraph-mark styling injected once */
  var st = document.createElement('style');
  st.textContent =
    '.doc-p.para-on::after,.doc-h2.para-on::after{content:"¶";color:#3a7bd5;opacity:.5;margin-left:2px;font-family:sans-serif}' +
    'body.show-ctrl .doc-h2::before{content:"[제목]";color:#c47b1b;font-size:8pt;font-family:sans-serif;margin-right:6px;vertical-align:2px;opacity:.7}';
  document.head.appendChild(st);

  /* drag & drop (loads sample regardless of file, like a demo) */
  var sc = $('#scroll-container');
  sc.addEventListener('dragover', function (e) { e.preventDefault(); });
  sc.addEventListener('drop', function (e) { e.preventDefault(); loadSampleDoc(); });

  /* init */
  drawRuler();
  // auto-load the sample so the editor opens populated
  setTimeout(loadSampleDoc, 350);
})();
