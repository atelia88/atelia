/* ------------------------------------------------------------------
   Fabrique le HTML des créations.
   Utilisé par build.js (génération des pages) et par live.js
   (mise à jour immédiate après une modification dans la gestion).
------------------------------------------------------------------ */

(function (racine) {

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function article(t) { return /^[aeiouyéèêà]/i.test(t) ? "l'" : 'les '; }

  /* Adresse de la page de chaque pièce : « marque-pages-scorpion.html ».
     Calculée sur toute la catégorie d'un coup, pour que deux pièces
     portant le même nom ne se retrouvent pas sur la même adresse. */
  function slug(t) {
    return String(t == null ? '' : t)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function liensProduits(c) {
    var vus = {};
    return (c.produits || []).map(function (p) {
      var s = slug(p.titre) || 'piece';
      if (vus[s]) { vus[s] += 1; s = s + '-' + vus[s]; } else { vus[s] = 1; }
      return c.id + '-' + s + '.html';
    });
  }

  function photos(liste) {
    var p = (liste || []).filter(function (x) { return x && x.image; });
    return p.length ? p : [{ image: 'images/a-venir.jpg', alt: 'Photos à venir' }];
  }

  function carrousel(liste, lien) {
    var p = photos(liste);
    var slides = p.map(function (x) {
      return '            <img src="' + esc(x.image) + '" alt="' + esc(x.alt || '') + '">';
    }).join('\n');
    var fleches = p.length > 1
      ? '\n          <button class="car-arrow car-prev" aria-label="Photo précédente">&#8249;</button>' +
        '\n          <button class="car-arrow car-next" aria-label="Photo suivante">&#8250;</button>' +
        '\n          <div class="car-dots"></div>'
      : '';
    return '        <div class="carousel"' + (lien ? ' data-lien="' + esc(lien) + '"' : '') + '>\n' +
           '          <div class="frame">\n' + slides + '\n          </div>' + fleches +
           '\n          <span class="car-count"></span>\n        </div>';
  }

  function prix(p, note) {
    if (!p) return '          <p class="from"><span class="soon">Photos à venir</span></p>';
    return '          <p class="from">' + esc(p) +
           (note ? '<small>' + esc(note) + '</small>' : '') + '</p>';
  }

  /* ---------- stock et bouton de commande ---------- */

  function stockDe(p) {
    if (p.stock === '' || p.stock == null) return null;   // stock non suivi
    var n = parseInt(p.stock, 10);
    return isNaN(n) ? null : Math.max(0, n);
  }

  function epuise(p) { return stockDe(p) === 0; }

  function mentionStock(p) {
    var n = stockDe(p);
    if (n === null) return '';
    if (n === 0) return '          <p class="stock rupture">Épuisé</p>';
    return '          <p class="stock dispo">En stock</p>';
  }

  function bouton(p) {
    /* pièce à personnaliser : on passe par le formulaire pour recueillir le prénom */
    if (p.personnalisable === 'prenom' && !epuise(p)) {
      return '          <a href="contact-creations.html?objet=personnalise&article=' +
             encodeURIComponent(p.titre || '') + '#prenom" class="btn">Personnaliser</a>';
    }
    if (epuise(p)) {
      return '          <a href="contact-creations.html?objet=epuise&article=' +
             encodeURIComponent(p.titre || '') + '" class="btn btn-outline">Passer commande</a>';
    }
    if (p.lien_paiement) {
      return '          <a href="' + esc(p.lien_paiement) + '" class="btn">Ajouter au panier</a>';
    }
    /* pièce disponible et chiffrée : elle va au panier */
    if (p.prix && /[0-9]/.test(p.prix)) {
      var ph = (p.photos || []).filter(function (x) { return x && x.image; })[0];
      return '          <button type="button" class="btn" data-ajout' +
             ' data-titre="' + esc(p.titre || '') + '"' +
             ' data-prix="' + esc(p.prix) + '"' +
             ' data-envoi="' + esc(p.envoi || 'lettre') + '"' +
             ' data-image="' + esc(ph ? ph.image : '') + '">Ajouter au panier</button>';
    }
    return '          <a href="contact-creations.html" class="btn btn-outline">Me contacter</a>';
  }

  /* ---------- grille de la page « Les créations » ---------- */

  /* Aperçu d'une catégorie sur la page « Toutes les créations » :
     les photos d'aperçu choisies, puis la première photo de chaque pièce.
     Une pièce ajoutée depuis la gestion s'y range donc toute seule. */
  function apercuCategorie(c) {
    var vues = {}, sortie = [];
    function ajoute(x) {
      if (!x || !x.image) return;
      if (/a-venir\.jpg$/.test(x.image)) return;
      if (vues[x.image]) return;
      vues[x.image] = 1;
      sortie.push(x);
    }
    (c.photos_apercu || []).forEach(ajoute);
    (c.produits || []).forEach(function (p) {
      var ph = (p.photos || []).filter(function (x) { return x && x.image; })[0];
      if (ph) ajoute({ image: ph.image, alt: ph.alt || p.titre || '' });
    });
    return sortie;
  }

  function grilleCategories(cats) {
    return cats.map(function (c) {
      var apercu = apercuCategorie(c);
      return '      <div class="pcard">\n' +
        carrousel(apercu, c.id + '.html') + '\n' +
        '        <div class="body">\n' +
        '          <h3 class="serif"><a href="' + esc(c.id) + '.html">' + esc(c.titre) + '</a></h3>\n' +
        prix(c.prix_affiche, c.prix_note) + '\n' +
        '          <a href="' + esc(c.id) + '.html" class="btn">Découvrir</a>\n' +
        '        </div>\n      </div>';
    }).join('\n\n');
  }

  /* ---------- grille des produits d'une catégorie ---------- */

  function grilleProduits(c) {
    var liens = liensProduits(c);
    return (c.produits || []).map(function (p, i) {
      var lien = liens[i];
      var pastille = epuise(p)
        ? '        <span class="pastille">Épuisé</span>\n'
        : '';
      return '      <div class="pcard"' +
             (p.filtre ? ' data-cat="' + esc(p.filtre) + '"' : '') +
             ' data-stock="' + (epuise(p) ? 'epuise' : 'dispo') + '">\n' +
        pastille +
        carrousel(p.photos, lien) + '\n' +
        '        <div class="body">\n' +
        (p.etiquette ? '          <span class="tag">' + esc(p.etiquette) + '</span>\n' : '') +
        '          <h3 class="serif"><a href="' + esc(lien) + '">' + esc(p.titre) + '</a></h3>\n' +
        (p.description ? '          <p>' + esc(p.description) + '</p>\n' : '') +
        prix(p.prix, p.note) + '\n' +
        bouton(p) + '\n' +
        '        </div>\n      </div>';
    }).join('\n\n');
  }

  /* ---------- photos d'en-tête d'une catégorie ---------- */

  function enteteCategorie(c) {
    var e = (c.photos_entete || []).filter(function (x) { return x && x.image; });
    if (!e.length) return '';
    if (e.length === 1) {
      return '  <div class="wrap">\n    <div class="bandeau">\n' +
        '      <img src="' + esc(e[0].image) + '" data-full="' + esc(e[0].image) + '" alt="' +
        esc(e[0].alt || '') + '" class="hero-shot" loading="lazy">' +
        '\n    </div>\n  </div>';
    }
    /* plusieurs photos : une bande qui défile, trois visibles à la fois */
    return '  <div class="wrap">\n' +
      '    <div class="piste">\n' +
      '      <div class="piste-vue">\n        <div class="piste-rail">\n' +
      e.map(function (x) {
        return '          <img src="' + esc(x.image) + '" data-full="' + esc(x.image) +
               '" alt="' + esc(x.alt || '') + '" loading="lazy">';
      }).join('\n') +
      '\n        </div>\n      </div>\n' +
      '      <button class="piste-fleche piste-prev" aria-label="Photos précédentes">&#8249;</button>\n' +
      '      <button class="piste-fleche piste-next" aria-label="Photos suivantes">&#8250;</button>\n' +
      '    </div>\n  </div>';
  }

  /* ---------- boutons de filtre ---------- */

  function filtres(c) {
    var f = (c.filtres || []).filter(function (x) { return x && x.id; });
    if (!f.length) return '';
    return '      <button data-f="tous" class="on">Tous</button>\n' +
      f.map(function (x) {
        return '      <button data-f="' + esc(x.id) + '">' + esc(x.label) + '</button>';
      }).join('\n');
  }

  var API = {
    esc: esc,
    article: article,
    apercuCategorie: apercuCategorie,
    slug: slug,
    liensProduits: liensProduits,
    prix: prix,
    bouton: bouton,
    mentionStock: mentionStock,
    stockDe: stockDe,
    epuise: epuise,
    carrousel: carrousel,
    grilleCategories: grilleCategories,
    grilleProduits: grilleProduits,
    enteteCategorie: enteteCategorie,
    filtres: filtres
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else racine.ATELIA_RENDER = API;

})(typeof window !== 'undefined' ? window : this);
