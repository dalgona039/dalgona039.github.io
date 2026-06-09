// Shared nav behavior: mobile toggle + projects dropdown
(function () {
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var drop = document.getElementById('projDrop');
  var dropBtn = document.getElementById('projDropBtn');
  if (!nav) return;

  if (toggle) toggle.addEventListener('click', function () { nav.classList.toggle('open'); });

  if (dropBtn && drop) {
    dropBtn.addEventListener('click', function () {
      if (window.matchMedia('(max-width: 880px)').matches) {
        drop.classList.remove('open');
      }
    });
  }

  nav.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); });
  });
})();
