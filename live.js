/* ------------------------------------------------------------------
   Rafraîchit les créations depuis la gestion, sans attendre.

   Les pages contiennent déjà tout leur contenu en HTML : ce script
   ne fait que le remplacer si le catalogue a changé. S'il ne trouve
   rien (site ouvert depuis un dossier), la page reste telle quelle.
------------------------------------------------------------------ */

(function () {
  var R = window.ATELIA_RENDER;
  if (!R) return;

  var grilleCats = document.getElementById('grille-categories');
  var section = document.querySelector('[data-cat-id]');
  if (!grilleCats && !section) return;

  fetch('/api/catalogue', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.categories) return;
      var cats = data.categories.filter(function (c) { return c && c.id && c.titre; });

      if (grilleCats) {
        grilleCats.innerHTML = R.grilleCategories(cats);
        rafraichis();
        return;
      }

      var c = cats.filter(function (x) { return x.id === section.dataset.catId; })[0];
      if (!c) return;

      maj('cat-titre', c.titre);
      maj('cat-eyebrow', c.eyebrow || 'Créations · Faits main');
      maj('cat-intro', c.intro || c.resume || '');
      maj('cat-bas-titre', c.bas_de_page_titre || 'Je fabrique aussi sur commande');
      maj('cat-bas-texte', c.bas_de_page_texte || '');
      document.title = c.titre + ' — Atélia';

      var ent = document.getElementById('cat-entete');
      if (ent) {
        var h = R.enteteCategorie(c);
        ent.innerHTML = h;
        ent.hidden = !h;
      }

      var fbox = document.getElementById('filtres');
      if (fbox) {
        var f = R.filtres(c);
        fbox.innerHTML = f;
        fbox.hidden = !f;
      }

      document.getElementById('grille').innerHTML = R.grilleProduits(c);
      rafraichis();
    })
    .catch(function () { /* hors ligne : on garde la page telle quelle */ });

  function maj(id, texte) {
    var el = document.getElementById(id);
    if (el) el.textContent = texte;
  }

  function rafraichis() {
    document.querySelectorAll('.carousel, .gallery, .piste').forEach(function (el) {
      delete el.dataset.ready;
    });
    document.querySelectorAll('.hero-shot, .product img').forEach(function (el) {
      delete el.dataset.ready;
    });
    if (window.initGalleries) window.initGalleries();
    if (window.initPistes) window.initPistes();
    if (window.initFiltres) window.initFiltres();
    if (window.initStripe) window.initStripe();
  }
})();
