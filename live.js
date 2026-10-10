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

  fetch('data/catalogue.json', { cache: 'no-store' })
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
      intro(c);
      maj('cat-bas-titre', c.bas_de_page_titre || 'Je fabrique aussi sur commande');
      maj('cat-bas-texte', c.bas_de_page_texte ||
          "Dites-moi ce que vous avez en tête et je vous dis si c'est faisable.");
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

  /* Deux paragraphes en haut d'une catégorie : le résumé puis, seulement
     s'il dit autre chose, l'introduction. Même règle que dans builder.js. */
  function intro(c) {
    var p1 = document.getElementById('cat-intro');
    if (!p1) return;
    p1.textContent = c.resume || c.intro || '';

    var second = (c.intro && c.intro !== c.resume) ? c.intro : '';
    var p2 = document.getElementById('cat-intro-2');

    if (!second) { if (p2) p2.hidden = true; return; }

    if (!p2) {
      p2 = document.createElement('p');
      p2.id = 'cat-intro-2';
      p2.style.color = 'var(--violet-mid)';
      p2.style.marginTop = '14px';
      p1.parentNode.insertBefore(p2, p1.nextSibling);
    }
    p2.textContent = second;
    p2.hidden = false;
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
    if (window.initAjouts) window.initAjouts();
  }
})();
