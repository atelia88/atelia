/* ------------------------------------------------------------------
   Menu principal : sous-menus au survol sur ordinateur (géré en CSS),
   au clic sur mobile et sur écran tactile.
------------------------------------------------------------------ */
(function () {
  function init() {
    var menu = document.getElementById('menu');
    var toggle = document.querySelector('.nav-toggle');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var ouvert = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
        if (!ouvert) fermerTout();
      });
    }

    var items = [].slice.call(document.querySelectorAll('.nav-item'));

    function fermerTout(sauf) {
      items.forEach(function (it) {
        if (it === sauf) return;
        it.classList.remove('ouvert');
        var b = it.querySelector('.sub-toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }

    items.forEach(function (it) {
      var b = it.querySelector('.sub-toggle');
      if (!b) return;
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var ouvert = it.classList.toggle('ouvert');
        b.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
        if (ouvert) fermerTout(it);
      });
    });

    /* un clic ailleurs, ou Échap, referme */
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.nav-item')) fermerTout();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fermerTout();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
