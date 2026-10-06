/* ------------------------------------------------------------------
   Fabrique toutes les pages du site à partir du catalogue.

   C'est la version navigateur de build.js : même sortie, mais sans
   Node ni système de fichiers, pour que la page de gestion puisse
   régénérer le site toute seule avant de l'envoyer sur GitHub.

   Utilisation :
     var fichiers = ATELIA_BUILD.genere(DATA, {
       fixes  : { 'index.html': '…contenu actuel…', … },
       vignettes : { 'images/thumbs/x.jpg': true, … }
     });
   « fichiers » est un objet { chemin : contenu }.
------------------------------------------------------------------ */

(function (racine) {
  'use strict';

  var R = racine.ATELIA_RENDER;
  var esc = function (t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  var VERSION = 10;   // casse le cache des navigateurs quand on change css/js

  /* page → entrée de menu à mettre en évidence */
  var FIXES = {
    'index.html': '',
    'plans-de-table.html': 'mariage',
    'le-voyage.html': 'mariage',
    'le-signature.html': 'mariage',
    'contact.html': 'mariage',
    'contact-creations.html': 'creations',
    'panier.html': 'creations',
    'merci.html': 'creations',
    'a-propos.html': 'apropos',
    'mentions-legales.html': '',
    'cgv.html': ''
  };

  function nomFichier(chemin) {
    return String(chemin || '').split('/').pop();
  }

  /* ---------------- fragments communs ---------------- */

  function navLiens(CATS, actif) {
    function item(id, lien, titre, sous) {
      return '      <div class="nav-item">\n' +
        '        <a href="' + lien + '"' + (actif === id ? ' class="active"' : '') + '>' + titre + '</a>\n' +
        '        <button class="sub-toggle" aria-label="Dérouler ' + titre + '" aria-expanded="false">&#9662;</button>\n' +
        '        <div class="submenu"><div class="boite">\n' +
        sous.map(function (s) { return '          <a href="' + s[0] + '">' + esc(s[1]) + '</a>'; }).join('\n') + '\n' +
        '        </div></div>\n' +
        '      </div>';
    }

    var sousCreations = [['creations.html', 'Toutes les créations']]
      .concat(CATS.map(function (c) { return [c.id + '.html', c.titre]; }))
      .concat([['panier.html', 'Mon panier'], ['contact-creations.html', "M'écrire"]]);

    return [
      item('mariage', 'plans-de-table.html', 'Plans de table mariage', [
        ['plans-de-table.html', 'Tous les plans de table'],
        ['le-voyage.html', 'Le Voyage'],
        ['le-signature.html', 'Le Signature'],
        ['contact.html', 'Commander ou demander un devis']
      ]),
      item('creations', 'creations.html', 'Créations', sousCreations),
      '      <a href="a-propos.html"' + (actif === 'apropos' ? ' class="active"' : '') + '>À propos</a>'
    ].join('\n');
  }

  function nav(CATS, cote) {
    var actif = cote === 'mariage' ? 'mariage' : cote === 'apropos' ? 'apropos' : 'creations';
    return '<header>\n' +
      '  <nav class="nav">\n' +
      '    <a href="index.html" class="logo">Atélia</a>\n' +
      '    <button class="nav-toggle" aria-label="Menu" aria-expanded="false">≡</button>\n' +
      '    <div class="nav-links" id="menu">\n' +
      '<!--NAV:START-->\n' +
      navLiens(CATS, actif) + '\n' +
      '<!--NAV:END-->\n' +
      '    </div>\n' +
      '  </nav>\n' +
      '</header>';
  }

  function listeSite(CATS) {
    return ['          <li><a href="creations.html">Toutes les créations</a></li>']
      .concat(CATS.map(function (c) {
        return '          <li><a href="' + c.id + '.html">' + esc(c.titre) + '</a></li>';
      }))
      .concat([
        '          <li><a href="panier.html">Mon panier</a></li>',
        '          <li><a href="contact-creations.html">M\'écrire</a></li>'
      ]).join('\n');
  }

  function pied(CATS, cote) {
    var mariage = '      <div>\n' +
      '        <h4>Côté mariage</h4>\n' +
      '        <ul>\n' +
      '          <li><a href="plans-de-table.html">Plans de table mariage</a></li>\n' +
      '          <li><a href="le-voyage.html">Le Voyage</a></li>\n' +
      '          <li><a href="le-signature.html">Le Signature</a></li>\n' +
      '          <li><a href="contact.html">Commander</a></li>\n' +
      '        </ul>\n' +
      '      </div>';

    var creations = '      <div>\n' +
      '        <h4>Côté créations</h4>\n' +
      '        <ul>\n' +
      '<!--LISTE:START-->\n' +
      listeSite(CATS) + '\n' +
      '<!--LISTE:END-->\n' +
      '        </ul>\n' +
      '      </div>';

    var infos = '      <div>\n' +
      '        <h4>Informations</h4>\n' +
      '        <ul>\n' +
      '          <li><a href="a-propos.html">À propos</a></li>\n' +
      '          <li><a href="mentions-legales.html">Mentions légales</a></li>\n' +
      '          <li><a href="cgv.html">Conditions de vente</a></li>\n' +
      '        </ul>\n' +
      '      </div>';

    return '<footer>\n' +
      '  <div class="wrap">\n' +
      '    <div class="cols quatre">\n' +
      '      <div>\n' +
      '        <span class="logo">Atélia</span>\n' +
      '        <p>Plans de table de mariage peints à la main et petites créations artisanales. Paris.</p>\n' +
      '      </div>\n' +
      (cote === 'mariage' ? mariage + '\n' + creations : creations + '\n' + mariage) + '\n' +
      infos + '\n' +
      '    </div>\n' +
      '    <div class="base">\n' +
      '      <span>© 2026 Atélia — Tous droits réservés</span>\n' +
      '      <span>Créations faites main, cédées à titre occasionnel · Paris</span>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</footer>';
  }

  var LIGHTBOX = '<div class="lightbox" id="lb">\n' +
    '  <span class="close" aria-label="Fermer">&times;</span>\n' +
    '  <span class="arrow prev" aria-label="Photo précédente">&#8249;</span>\n' +
    '  <span class="arrow next" aria-label="Photo suivante">&#8250;</span>\n' +
    '  <img id="lbimg" src="" alt="">\n' +
    '  <span class="counter" id="lbcount"></span>\n' +
    '</div>';

  function scripts() {
    return ['panier.js', 'nav.js', 'gallery.js', 'render.js', 'live.js']
      .map(function (s) { return '<script src="' + s + '?v=' + VERSION + '"></script>'; })
      .join('\n');
  }

  function tete(titre, description) {
    return '<!DOCTYPE html>\n<html lang="fr">\n<head>\n' +
      '<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<title>' + esc(titre) + '</title>\n' +
      '<meta name="description" content="' + esc(description) + '">\n' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">\n' +
      '<link rel="stylesheet" href="style.css?v=' + VERSION + '">\n' +
      '</head>\n<body>';
  }

  /* ---------------- page « Les créations » ---------------- */

  function pageCreations(CATS) {
    return tete('Créations — Bracelets, marque-pages, mosaïque | Atélia',
      'Petites créations faites main : bracelets personnalisés, marque-pages coloriés, mosaïque, couture et broderie. Commande en ligne.') + '\n\n' +
      nav(CATS, 'creations') + '\n\n' +
      '<div class="backlink">\n  <div class="wrap">\n' +
      '    <a href="index.html"><span aria-hidden="true">&#8592;</span> Accueil</a>\n' +
      '  </div>\n</div>\n\n' +
      '<section class="tight">\n  <div class="wrap" style="text-align:center; max-width:640px">\n' +
      '    <p class="eyebrow">Fait main · Paris</p>\n' +
      '    <h1 class="serif" style="font-size:42px; line-height:1.15; margin-bottom:16px">Les créations</h1>\n' +
      '    <p style="color:var(--violet-mid)">Des pièces faites main, en petite quantité, déjà fabriquées et prêtes à partir.</p>\n' +
      '  </div>\n</section>\n\n' +
      '<section class="bg-white">\n  <div class="wrap">\n' +
      '    <div class="product-cards" id="grille-categories">\n\n' +
      R.grilleCategories(CATS) + '\n\n' +
      '    </div>\n' +
      '    <p class="note">Cliquez sur une photo ou sur les flèches pour parcourir une catégorie.</p>\n' +
      '  </div>\n</section>\n\n' +
      '<section>\n  <div class="wrap" style="text-align:center">\n' +
      '    <p class="eyebrow">Une envie précise ?</p>\n' +
      '    <h2 class="serif" style="font-size:32px; margin-bottom:14px">Je fabrique aussi sur commande</h2>\n' +
      '    <p style="color:var(--violet-mid); max-width:520px; margin:0 auto 30px">Je fabrique aussi des pièces qui ne sont pas sur le site. Dites-moi ce que vous avez en tête — un objet, des couleurs, un prénom, une occasion — et je vous dis si c\'est faisable. N\'hésitez pas à me faire part de vos envies.</p>\n' +
      '    <a href="contact-creations.html" class="btn">Me contacter</a>\n' +
      '  </div>\n</section>\n\n' +
      pied(CATS, 'creations') + '\n\n' + LIGHTBOX + '\n\n' + scripts() + '\n\n</body>\n</html>\n';
  }

  /* ---------------- galerie d'ambiance ---------------- */

  function galerieCategorie(c, vignettes) {
    var g = (c.galerie || []).filter(function (x) { return x && x.image; });
    if (!g.length) return '';
    return '\n<section class="bg-white">\n  <div class="wrap">\n' +
      '    <div class="section-head">\n' +
      '      <h2>' + esc(c.galerie_titre || 'En images') + '</h2>\n' +
      '      <p>' + esc(c.galerie_texte || "L'atelier et les pièces terminées — cliquez pour agrandir") + '</p>\n' +
      '    </div>\n    <div class="gallery">\n' +
      g.map(function (x) {
        var vign = 'images/thumbs/' + nomFichier(x.image);
        var src = (vignettes && vignettes[vign]) ? vign : x.image;
        return '      <img src="' + esc(src) + '" data-full="' + esc(x.image) +
               '" alt="' + esc(x.alt || '') + '" loading="lazy">';
      }).join('\n') + '\n' +
      '    </div>\n  </div>\n</section>\n';
  }

  /* ---------------- page d'une catégorie ---------------- */

  function pageCategorie(CATS, c, vignettes) {
    var entete = R.enteteCategorie(c);
    var filtres = R.filtres(c);
    var introSup = (c.intro && c.intro !== c.resume)
      ? '    <p style="color:var(--violet-mid); margin-top:14px" id="cat-intro-2">' + esc(c.intro) + '</p>\n'
      : '';

    return tete(c.titre + ' — Atélia', c.intro || c.resume || '') + '\n\n' +
      nav(CATS, 'creations') + '\n\n' +
      '<div class="backlink">\n  <div class="wrap">\n' +
      '    <a href="creations.html"><span aria-hidden="true">&#8592;</span> Toutes les créations</a>\n' +
      '  </div>\n</div>\n\n' +
      '<section class="tight">\n  <div class="wrap" style="text-align:center; max-width:640px">\n' +
      '    <p class="eyebrow" id="cat-eyebrow">' + esc(c.eyebrow || 'Créations · Faits main') + '</p>\n' +
      '    <h1 class="serif" id="cat-titre" style="font-size:42px; line-height:1.15; margin-bottom:16px">' + esc(c.titre) + '</h1>\n' +
      '    <p style="color:var(--violet-mid)" id="cat-intro">' + esc(c.resume || c.intro || '') + '</p>\n' +
      introSup +
      '  </div>\n</section>\n\n' +
      '<section class="tight" style="padding-top:0" id="cat-entete"' + (entete ? '' : ' hidden') + '>\n' +
      entete + '\n</section>\n\n' +
      '<section class="bg-white" style="padding-top:24px" data-cat-id="' + esc(c.id) + '">\n' +
      '  <div class="wrap">\n' +
      '    <div class="filters" id="filtres"' + (filtres ? '' : ' hidden') + '>\n' +
      filtres + '\n    </div>\n' +
      '    <p class="compte" id="compte"></p>\n' +
      '    <div class="product-cards" id="grille">\n\n' +
      R.grilleProduits(c) + '\n\n' +
      '    </div>\n' +
      '    <p class="note" id="vide" hidden>Aucune pièce dans cette catégorie pour le moment.</p>\n' +
      '    <p class="note">Cliquez sur une photo ou sur un titre pour ouvrir la pièce.</p>\n' +
      '  </div>\n</section>\n' +
      galerieCategorie(c, vignettes) + '\n' +
      '<section>\n  <div class="wrap" style="text-align:center">\n' +
      '    <p class="eyebrow">Une envie précise ?</p>\n' +
      '    <h2 class="serif" id="cat-bas-titre" style="font-size:32px; margin-bottom:14px">' +
      esc(c.bas_de_page_titre || 'Je fabrique aussi sur commande') + '</h2>\n' +
      '    <p style="color:var(--violet-mid); max-width:440px; margin:0 auto 30px" id="cat-bas-texte">' +
      esc(c.bas_de_page_texte || "Dites-moi ce que vous avez en tête et je vous dis si c'est faisable.") + '</p>\n' +
      '    <a href="contact-creations.html" class="btn">Me contacter</a>\n' +
      '    <p style="margin-top:26px"><a href="creations.html" class="btn btn-outline"><span aria-hidden="true">&#8592;</span> Toutes les créations</a></p>\n' +
      '  </div>\n</section>\n\n' +
      pied(CATS, 'categorie') + '\n\n' + LIGHTBOX + '\n\n' + scripts() + '\n\n</body>\n</html>\n';
  }

  /* ---------------- page d'une pièce ---------------- */

  function pageProduit(CATS, c, p, autres) {
    var desc = p.description || c.resume || '';
    var stock = R.mentionStock(p);

    var suite = autres.length
      ? '\n<section class="bg-white">\n  <div class="wrap">\n' +
        '    <div class="section-head" style="margin-bottom:34px">\n' +
        '      <h2>' + (autres.length > 1 ? 'Les autres pièces' : "L'autre pièce") + ' de la catégorie</h2>\n' +
        '    </div>\n    <div class="product-cards" id="grille">\n\n' +
        R.grilleProduits({ id: c.id, titre: c.titre, resume: c.resume, produits: autres }) + '\n\n' +
        '    </div>\n  </div>\n</section>'
      : '';

    return tete(p.titre + ' — ' + c.titre + ' | Atélia', desc) + '\n\n' +
      nav(CATS, 'creations') + '\n\n' +
      '<div class="backlink">\n  <div class="wrap">\n' +
      '    <a href="' + esc(c.id) + '.html"><span aria-hidden="true">&#8592;</span> ' + esc(c.titre) + '</a>\n' +
      '  </div>\n</div>\n\n' +
      '<div class="product-hero">\n' +
      R.carrousel(p.photos) + '\n' +
      '  <div class="info">\n' +
      '    <p class="eyebrow">Créations · ' + esc(c.titre) + '</p>\n' +
      '    <h1 class="serif">' + esc(p.titre) + '</h1>\n' +
      '    <p class="desc">' + esc(desc) + '</p>\n' +
      R.prix(p.prix, p.note) + '\n' +
      (stock ? stock + '\n' : '') + R.bouton(p) + '\n' +
      '    <p class="note" style="text-align:left; margin-top:22px">Pièce faite main : chaque exemplaire est unique et présente de légères variations.</p>\n' +
      '  </div>\n</div>\n' + suite + '\n\n' +
      '<section>\n  <div class="wrap" style="text-align:center">\n' +
      '    <p class="eyebrow">Une envie précise ?</p>\n' +
      '    <h2 class="serif" style="font-size:32px; margin-bottom:14px">Je fabrique aussi sur commande</h2>\n' +
      '    <p style="color:var(--violet-mid); max-width:440px; margin:0 auto 30px">Une couleur, un prénom, une occasion : dites-moi ce que vous avez en tête.</p>\n' +
      '    <a href="contact-creations.html" class="btn">Me contacter</a>\n' +
      '    <p style="margin-top:26px"><a href="' + esc(c.id) + '.html" class="btn btn-outline"><span aria-hidden="true">&#8592;</span> ' + esc(c.titre) + '</a></p>\n' +
      '  </div>\n</section>\n\n' +
      pied(CATS, 'creations') + '\n\n' + LIGHTBOX + '\n\n' + scripts() + '\n\n</body>\n</html>\n';
  }

  /* ---------------- grille des créations sur l'accueil ---------------- */

  function grilleAccueil(CATS, vignettes) {
    return CATS.map(function (c) {
      var liste = (c.photos_apercu || []).filter(function (x) { return x && x.image; });
      var ph = liste[0] || { image: 'images/a-venir.jpg', alt: 'Photos à venir' };
      var vign = 'images/thumbs/' + nomFichier(ph.image);
      var src = (vignettes && vignettes[vign]) ? vign : ph.image;
      return '      <div class="product">\n' +
        '        <a href="' + c.id + '.html"><img src="' + esc(src) + '" alt="' + esc(ph.alt || c.titre) + '"></a>\n' +
        '        <h3><a href="' + c.id + '.html">' + esc(c.titre) + '</a></h3>\n' +
        '        <p>' + esc((c.resume || '').split(/[.!?]/)[0]) + '</p>\n' +
        '      </div>';
    }).join('\n');
  }

  /* ---------------- assemblage ---------------- */

  function remplaceEntre(texte, debut, fin, contenu) {
    var d = texte.indexOf(debut), f = texte.indexOf(fin);
    if (d === -1 || f === -1) return texte;
    return texte.slice(0, d + debut.length) + '\n' + contenu + '\n' + texte.slice(f);
  }

  /* Met à jour les numéros de version sur les css/js d'une page fixe,
     pour que le navigateur ne serve pas d'anciens fichiers. */
  function majVersion(texte) {
    return texte.replace(/(href|src)="(style\.css|panier\.js|nav\.js|gallery\.js|render\.js|live\.js)(\?v=\d+)?"/g,
      function (_, attr, fichier) { return attr + '="' + fichier + '?v=' + VERSION + '"'; });
  }

  function genere(data, ctx) {
    if (!R) throw new Error('render.js doit être chargé avant builder.js.');
    ctx = ctx || {};
    var vignettes = ctx.vignettes || {};
    var fixes = ctx.fixes || {};

    var CATS = (data.categories || []).filter(function (c) { return c && c.id && c.titre; });
    var sortie = {};

    sortie['creations.html'] = pageCreations(CATS);

    CATS.forEach(function (c) {
      sortie[c.id + '.html'] = pageCategorie(CATS, c, vignettes);

      var liens = R.liensProduits(c);
      (c.produits || []).forEach(function (p, i) {
        if (!p || !p.titre) return;
        var autres = (c.produits || []).filter(function (_, n) { return n !== i; }).slice(0, 4);
        sortie[liens[i]] = pageProduit(CATS, c, p, autres);
      });
    });

    Object.keys(FIXES).forEach(function (f) {
      var s = fixes[f];
      if (typeof s !== 'string' || !s) return;
      var avant = s;
      s = remplaceEntre(s, '<!--NAV:START-->', '<!--NAV:END-->', navLiens(CATS, FIXES[f]));
      s = remplaceEntre(s, '<!--CATS:START-->', '<!--CATS:END-->', grilleAccueil(CATS, vignettes));
      s = remplaceEntre(s, '<!--LISTE:START-->', '<!--LISTE:END-->', listeSite(CATS));
      s = majVersion(s);
      if (s !== avant) sortie[f] = s;
    });

    return sortie;
  }

  /* Liste des pages que ce catalogue produit — sert à repérer les pages
     devenues inutiles après un renommage ou une suppression. */
  function pagesGenerees(data) {
    var CATS = (data.categories || []).filter(function (c) { return c && c.id && c.titre; });
    var liste = ['creations.html'];
    CATS.forEach(function (c) {
      liste.push(c.id + '.html');
      var liens = R.liensProduits(c);
      (c.produits || []).forEach(function (p, i) {
        if (p && p.titre) liste.push(liens[i]);
      });
    });
    return liste;
  }

  racine.ATELIA_BUILD = {
    genere: genere,
    pagesGenerees: pagesGenerees,
    fixes: FIXES,
    version: VERSION
  };

})(typeof window !== 'undefined' ? window : this);
