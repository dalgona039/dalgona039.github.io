// Shared nav behavior: mobile toggle + projects dropdown
(function () {
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var drop = document.getElementById('projDrop');
  var dropBtn = document.getElementById('projDropBtn');
  if (!nav) return;

  if (toggle) toggle.addEventListener('click', function () { nav.classList.toggle('open'); });

  if (dropBtn && drop) {
    var dropMenu = drop.querySelector('.nav-drop-menu');
    
    drop.addEventListener('mouseenter', function () {
      drop.classList.add('open');
    });
    
    drop.addEventListener('mouseleave', function () {
      drop.classList.remove('open');
    });
    
    dropBtn.addEventListener('click', function (e) {
      if (window.matchMedia('(max-width: 880px)').matches) {
        e.preventDefault();
        drop.classList.toggle('open');
      }
    });
  }

  nav.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); });
  });
})();
