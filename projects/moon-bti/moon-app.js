/* 문BTI demo app — drives the three screens (home → quiz → result),
   mirroring the navigation/state logic of the Flutter screens. */
(function () {
  "use strict";
  var M = window.MOON;
  var questions = M.questions;
  var TOTAL = questions.length;

  var state = { index: 0, answers: {}, submitting: false, showDetail: false };

  var $ = function (id) { return document.getElementById(id); };
  function show(screen) {
    ['home', 'quiz', 'result'].forEach(function (s) { $(s).classList.toggle('on', s === screen); });
    window.scrollTo(0, 0);
  }

  /* ---------- HOME ---------- */
  $('startBtn').addEventListener('click', function () {
    state.index = 0; state.answers = {}; state.submitting = false;
    renderQuestion();
    show('quiz');
  });

  /* ---------- QUESTION ---------- */
  function renderQuestion() {
    var q = questions[state.index];
    var progress = (state.index + 1) / TOTAL;
    $('qCard').textContent = q.text;
    $('chapterTxt').textContent = (state.index + 1) + '장  /  ' + TOTAL + '장';
    $('answeredTxt').textContent = Object.keys(state.answers).length + ' 응답';
    $('progressBar').style.width = (progress * 100) + '%';

    var selected = state.answers[q.id];
    var row = $('likertRow');
    row.innerHTML = '';
    M.likertLabels.forEach(function (label, i) {
      var value = i + 1;
      var sel = selected === value;
      var btn = document.createElement('button');
      btn.className = 'likert-item' + (sel ? ' sel' : '');
      btn.innerHTML =
        '<span class="likert-circle">' +
          (sel ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : value) +
        '</span>' +
        '<span class="likert-cap">' + label + '</span>';
      btn.addEventListener('click', function () {
        state.answers[q.id] = value;
        renderQuestion();
      });
      row.appendChild(btn);
    });

    var fb = $('likertFeedback');
    if (selected == null) {
      fb.className = 'likert-feedback none';
      fb.textContent = '가장 가까운 반응을 하나 선택해 주세요.';
    } else {
      fb.className = 'likert-feedback has';
      fb.textContent = selected + '점으로 기록되었습니다.';
    }

    var isLast = state.index === TOTAL - 1;
    var canProceed = selected != null && !state.submitting;
    var nextBtn = $('nextBtn');
    nextBtn.disabled = !canProceed;
    if (state.submitting) {
      nextBtn.innerHTML = '<span class="spinner"></span><span>문학 프로필 계산 중...</span>';
    } else {
      nextBtn.textContent = isLast ? '문학 프로필 보기' : '다음 장으로';
    }
  }

  $('nextBtn').addEventListener('click', function () {
    var q = questions[state.index];
    if (state.answers[q.id] == null || state.submitting) return;
    if (state.index < TOTAL - 1) {
      state.index++;
      renderQuestion();
      return;
    }
    // last → compute
    state.submitting = true;
    renderQuestion();
    setTimeout(function () {
      var result = M.calculate(state.answers);
      state.submitting = false;
      state.showDetail = false;
      renderResult(result);
      show('result');
    }, 250);
  });

  $('backBtn').addEventListener('click', function () {
    if (state.index > 0) {
      state.index--;
      renderQuestion();
    } else {
      confirmExit();
    }
  });

  function confirmExit() {
    var n = Object.keys(state.answers).length;
    if (n === 0 || window.confirm('지금 나가면 ' + n + '개의 응답이 모두 사라집니다.\n정말 돌아가시겠습니까?')) {
      show('home');
    }
  }

  /* ---------- RESULT ---------- */
  function renderResult(r) {
    var keywords = M.keywords(r.mbti);
    var summaryLines = [
      r.author + '의 문장 결과 가장 가까운 흐름입니다.',
      r.tagline,
      '첫 페이지 추천: ' + r.work1 + ' · ' + r.work2
    ];
    var cc = r.cardColor;

    function badgeBg(hex, a) { return hexA(hex, a); }

    var html = '' +
      '<div class="res-eyebrow">당신의 문장 결</div>' +
      '<div class="res-mbti-badge" style="background:' + badgeBg(cc, .14) + ';color:' + cc + '">' + r.mbti + '</div>' +
      '<div class="res-grid">' +
        '<div class="res-left">' + authorCard(r) + '</div>' +
        '<div class="res-right">' +
          summaryCard(summaryLines, keywords) +
          '<button class="detail-toggle" id="detailToggle">' +
            '<span id="detailToggleTxt">해석 노트 보기</span>' +
            '<svg class="ic" id="detailChevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="' + 'currentColor' + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>' +
          '</button>' +
          '<div class="detail-card neubox inset hidden" id="detailCard">' +
            '<div class="card-head"><svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>해석 노트</div>' +
            '<div class="detail-body">' + esc(r.description) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      // quote
      '<div class="quote-card neubox inset">' +
        '<div class="card-head"><svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7.17 6.17A5 5 0 0 0 4 11v7h7v-7H7a3 3 0 0 1 3-3V6a4.98 4.98 0 0 0-2.83.17zm10 0A5 5 0 0 0 14 11v7h7v-7h-4a3 3 0 0 1 3-3V6a4.98 4.98 0 0 0-2.83.17z"/></svg>닮은 문장의 결</div>' +
        '<div class="quote-text">' + esc(r.quote) + '</div>' +
        '<div class="quote-author">— ' + esc(r.author) + '</div>' +
      '</div>' +
      // retry
      '<button class="neu-btn raised res-retry" id="retryBtn">다시 탐색하기</button>' +
      '<div class="res-foot">경희문학회에 많은 관심 바랍니다</div>';

    $('resultContent').innerHTML = html;

    // attach image fallback (matches Flutter errorBuilder) without fragile inline onerror
    var authorImg = $('resultContent').querySelector('.author-img img');
    if (authorImg) {
      authorImg.addEventListener('error', function () {
        var box = authorImg.parentNode;
        box.innerHTML = '';
        var f = document.createElement('div');
        f.style.cssText = 'width:100%;height:100%;background:var(--bg);border:2px solid ' + hexA(r.cardColor, .28) +
          ';display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--accent)';
        f.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
          '<span style="font-size:34px;font-weight:900;color:var(--text);margin-top:6px">' + esc(r.author.charAt(0)) + '</span>';
        box.appendChild(f);
      });
    }

    $('retryBtn').addEventListener('click', function () { show('home'); });
    var toggle = $('detailToggle');
    toggle.addEventListener('click', function () {
      state.showDetail = !state.showDetail;
      $('detailCard').classList.toggle('hidden', !state.showDetail);
      $('detailToggleTxt').textContent = state.showDetail ? '해석 노트 접기' : '해석 노트 보기';
      $('detailChevron').innerHTML = state.showDetail ? '<path d="m6 15 6-6 6 6"/>' : '<path d="m6 9 6 6 6-6"/>';
    });
  }

  function authorCard(r) {
    var cc = r.cardColor;
    return '' +
      '<div class="author-card neubox raised">' +
        '<div class="author-img" style="box-shadow:0 4px 14px ' + hexA(cc, .3) + '">' +
          '<img src="assets/authors/' + r.imageFile + '" alt="' + esc(r.author) + '" />' +
        '</div>' +
        '<div class="author-name">' + esc(r.author) + '</div>' +
        '<div class="author-tag" style="background:' + hexA(cc, .12) + ';color:' + cc + '">' + esc(r.tagline) + '</div>' +
        '<hr class="author-div" />' +
        '<div class="works-label">함께 읽으면 좋은 작품</div>' +
        '<div class="works">' +
          workBadge(r.work1, cc) + workBadge(r.work2, cc) +
        '</div>' +
      '</div>';
  }
  function workBadge(title, cc) {
    return '<span class="work-badge" style="border:1px solid ' + hexA(cc, .3) + ';color:' + cc + '">' + esc(title) + '</span>';
  }
  function summaryCard(lines, keywords) {
    return '' +
      '<div class="summary-card neubox inset">' +
        '<div class="card-head">문학 프로필</div>' +
        '<div style="height:14px"></div>' +
        lines.map(function (l) { return '<div class="summary-line">• ' + esc(l) + '</div>'; }).join('') +
        '<div style="height:8px"></div>' +
        '<div class="kw-wrap">' + keywords.map(function (k) { return '<span class="kw">' + esc(k) + '</span>'; }).join('') + '</div>' +
      '</div>';
  }

  function hexA(hex, a) {
    var h = hex.replace('#', '');
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // init
  renderQuestion();
})();
