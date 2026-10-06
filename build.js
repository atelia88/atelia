/* ------------------------------------------------------------------
   Génère les pages du site à partir de data/catalogue.json.
   Lancé par Cloudflare à chaque mise en ligne, ou à la main :
       node build.js
------------------------------------------------------------------ */

const fs = require('fs');
const path = require('path');
const R = require('./render.js');

const RACINE = __dirname;
const cat = JSON.parse(fs.readFileSync(path.join(RACINE, 'data/catalogue.json'), 'utf8'));
const CATS = (cat.categories || []).filter(c => c && c.id && c.titre);
const esc = R.esc;

/* ---------- fragments communs ---------- */

/* Le menu principal : trois entrées, deux d'entre elles déroulent un
   sous-menu au survol. Le sous-menu Créations suit le catalogue. */
function navLiens(actif) {
  const item = (id, lien, titre, sous) => `      <div class="nav-item">
        <a href="${lien}"${actif === id ? ' class="active"' : ''}>${titre}</a>
        <button class="sub-toggle" aria-label="Dérouler ${titre}" aria-expanded="false">&#9662;</button>
        <div class="submenu"><div class="boite">
${sous.map(([h, t]) => `          <a href="${h}">${esc(t)}</a>`).join('\n')}
        </div></div>
      </div>`;

  return [
    item('mariage', 'plans-de-table.html', 'Plans de table mariage', [
      ['plans-de-table.html', 'Tous les plans de table'],
      ['le-voyage.html', 'Le Voyage'],
      ['le-signature.html', 'Le Signature'],
      ['contact.html', 'Commander ou demander un devis']
    ]),
    item('creations', 'creations.html', 'Créations', [
      ['creations.html', 'Toutes les créations'],
      ...CATS.map(c => [c.id + '.html', c.titre]),
      ['panier.html', 'Mon panier'],
      ['contact-creations.html', "M'écrire"]
    ]),
    `      <a href="a-propos.html"${actif === 'apropos' ? ' class="active"' : ''}>À propos</a>`
  ].join('\n');
}

function nav(cote) {
  const actif = cote === 'mariage' ? 'mariage' : cote === 'apropos' ? 'apropos' : 'creations';

  return `<header>
  <nav class="nav">
    <a href="index.html" class="logo">Atélia</a>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false">≡</button>
    <div class="nav-links" id="menu">
<!--NAV:START-->
${navLiens(actif)}
<!--NAV:END-->
    </div>
  </nav>
</header>`;
}

function listeSite() {
  return [
    '          <li><a href="creations.html">Toutes les créations</a></li>',
    ...CATS.map(c => `          <li><a href="${c.id}.html">${esc(c.titre)}</a></li>`),
    '          <li><a href="panier.html">Mon panier</a></li>',
    '          <li><a href="contact-creations.html">M\'écrire</a></li>'
  ].join('\n');
}

function pied(cote) {
  const mariage = `      <div>
        <h4>Côté mariage</h4>
        <ul>
          <li><a href="plans-de-table.html">Plans de table mariage</a></li>
          <li><a href="le-voyage.html">Le Voyage</a></li>
          <li><a href="le-signature.html">Le Signature</a></li>
          <li><a href="contact.html">Commander</a></li>
        </ul>
      </div>`;

  const creations = `      <div>
        <h4>Côté créations</h4>
        <ul>
<!--LISTE:START-->
${listeSite()}
<!--LISTE:END-->
        </ul>
      </div>`;

  const infos = `      <div>
        <h4>Informations</h4>
        <ul>
          <li><a href="a-propos.html">À propos</a></li>
          <li><a href="mentions-legales.html">Mentions légales</a></li>
          <li><a href="cgv.html">Conditions de vente</a></li>
        </ul>
      </div>`;

  return `<footer>
  <div class="wrap">
    <div class="cols quatre">
      <div>
        <span class="logo">Atélia</span>
        <p>Plans de table de mariage peints à la main et petites créations artisanales. Paris.</p>
      </div>
${cote === 'mariage' ? mariage + '\n' + creations : creations + '\n' + mariage}
${infos}
    </div>
    <div class="base">
      <span>© 2026 Atélia — Tous droits réservés</span>
      <span>Créations faites main, cédées à titre occasionnel · Paris</span>
    </div>
  </div>
</footer>`;
}

const LIGHTBOX = `<div class="lightbox" id="lb">
  <span class="close" aria-label="Fermer">&times;</span>
  <span class="arrow prev" aria-label="Photo précédente">&#8249;</span>
  <span class="arrow next" aria-label="Photo suivante">&#8250;</span>
  <img id="lbimg" src="" alt="">
  <span class="counter" id="lbcount"></span>
</div>`;

const SCRIPTS = `<script src="panier.js?v=9"></script>
<script src="nav.js?v=9"></script>
<script src="gallery.js?v=9"></script>
<script src="render.js?v=9"></script>
<script src="live.js?v=9"></script>`;

function tete(titre, description) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css?v=9">
</head>
<body>`;
}

/* ---------- page « Les créations » ---------- */

function pageCreations() {
  const cote = 'creations';
  return `${tete('Créations — Bracelets, marque-pages, mosaïque | Atélia',
    'Petites créations faites main : bracelets personnalisés, marque-pages coloriés, mosaïque, couture et broderie. Commande en ligne.')}

${nav('creations')}

<div class="backlink">
  <div class="wrap">
    <a href="index.html"><span aria-hidden="true">&#8592;</span> Accueil</a>
  </div>
</div>

<section class="tight">
  <div class="wrap" style="text-align:center; max-width:640px">
    <p class="eyebrow">Fait main · Paris</p>
    <h1 class="serif" style="font-size:42px; line-height:1.15; margin-bottom:16px">Les créations</h1>
    <p style="color:var(--violet-mid)">Des pièces faites main, en petite quantité, déjà fabriquées et prêtes à partir.</p>
  </div>
</section>

<section class="bg-white">
  <div class="wrap">
    <div class="product-cards" id="grille-categories">

${R.grilleCategories(CATS)}

    </div>
    <p class="note">Cliquez sur une photo ou sur les flèches pour parcourir une catégorie.</p>
  </div>
</section>

<section>
  <div class="wrap" style="text-align:center">
    <p class="eyebrow">Une envie précise ?</p>
    <h2 class="serif" style="font-size:32px; margin-bottom:14px">Je fabrique aussi sur commande</h2>
    <p style="color:var(--violet-mid); max-width:520px; margin:0 auto 30px">Je fabrique aussi des pièces qui ne sont pas sur le site. Dites-moi ce que vous avez en tête — un objet, des couleurs, un prénom, une occasion — et je vous dis si c'est faisable. N'hésitez pas à me faire part de vos envies.</p>
    <a href="contact-creations.html" class="btn">Me contacter</a>
  </div>
</section>

${pied(cote)}

${LIGHTBOX}

${SCRIPTS}

</body>
</html>
`;
}

/* ---------- page d'une catégorie ---------- */

function pageCategorie(c) {
  const cote = 'categorie';
  const entete = R.enteteCategorie(c);
  const filtres = R.filtres(c);

  return `${tete(`${c.titre} — Atélia`, c.intro || c.resume || '')}

${nav('creations')}

<div class="backlink">
  <div class="wrap">
    <a href="creations.html"><span aria-hidden="true">&#8592;</span> Toutes les créations</a>
  </div>
</div>

<section class="tight">
  <div class="wrap" style="text-align:center; max-width:640px">
    <p class="eyebrow" id="cat-eyebrow">${esc(c.eyebrow || 'Créations · Faits main')}</p>
    <h1 class="serif" id="cat-titre" style="font-size:42px; line-height:1.15; margin-bottom:16px">${esc(c.titre)}</h1>
    <p style="color:var(--violet-mid)" id="cat-intro">${esc(c.resume || c.intro || '')}</p>
${c.intro && c.intro !== c.resume ? `    <p style="color:var(--violet-mid); margin-top:14px" id="cat-intro-2">${esc(c.intro)}</p>` : ''}
  </div>
</section>

<section class="tight" style="padding-top:0" id="cat-entete"${entete ? '' : ' hidden'}>
${entete}
</section>

<section class="bg-white" style="padding-top:24px" data-cat-id="${esc(c.id)}">
  <div class="wrap">
    <div class="filters" id="filtres"${filtres ? '' : ' hidden'}>
${filtres}
    </div>
    <p class="compte" id="compte"></p>
    <div class="product-cards" id="grille">

${R.grilleProduits(c)}

    </div>
    <p class="note" id="vide" hidden>Aucune pièce dans cette catégorie pour le moment.</p>
    <p class="note">Cliquez sur une photo ou sur un titre pour ouvrir la pièce.</p>
  </div>
</section>
${galerieCategorie(c)}
<section>
  <div class="wrap" style="text-align:center">
    <p class="eyebrow">Une envie précise ?</p>
    <h2 class="serif" id="cat-bas-titre" style="font-size:32px; margin-bottom:14px">${esc(c.bas_de_page_titre || 'Je fabrique aussi sur commande')}</h2>
    <p style="color:var(--violet-mid); max-width:440px; margin:0 auto 30px" id="cat-bas-texte">${esc(c.bas_de_page_texte || "Dites-moi ce que vous avez en tête et je vous dis si c'est faisable.")}</p>
    <a href="contact-creations.html" class="btn">Me contacter</a>
    <p style="margin-top:26px"><a href="creations.html" class="btn btn-outline"><span aria-hidden="true">&#8592;</span> Toutes les créations</a></p>
  </div>
</section>

${pied(cote)}

${LIGHTBOX}

${SCRIPTS}

</body>
</html>
`;
}

/* ---------- galerie d'ambiance d'une catégorie ---------- */

function galerieCategorie(c) {
  const g = (c.galerie || []).filter(x => x && x.image);
  if (!g.length) return '';
  return `
<section class="bg-white">
  <div class="wrap">
    <div class="section-head">
      <h2>${esc(c.galerie_titre || 'En images')}</h2>
      <p>${esc(c.galerie_texte || "L'atelier et les pièces terminées — cliquez pour agrandir")}</p>
    </div>
    <div class="gallery">
${g.map(x => `      <img src="images/thumbs/${esc(x.image.split('/').pop())}" data-full="${esc(x.image)}" alt="${esc(x.alt || '')}" loading="lazy">`).join('\n')}
    </div>
  </div>
</section>
`;
}

/* ---------- page d'une pièce ---------- */

function pageProduit(c, p, autres) {
  const desc = p.description || c.resume || '';
  const stock = R.mentionStock(p);

  const suite = autres.length ? `
<section class="bg-white">
  <div class="wrap">
    <div class="section-head" style="margin-bottom:34px">
      <h2>${autres.length > 1 ? 'Les autres pièces' : "L'autre pièce"} de la catégorie</h2>
    </div>
    <div class="product-cards" id="grille">

${R.grilleProduits(Object.assign({}, c, { produits: autres }))}

    </div>
  </div>
</section>` : '';

  return `${tete(`${p.titre} — ${c.titre} | Atélia`, desc)}

${nav('creations')}

<div class="backlink">
  <div class="wrap">
    <a href="${esc(c.id)}.html"><span aria-hidden="true">&#8592;</span> ${esc(c.titre)}</a>
  </div>
</div>

<div class="product-hero">
${R.carrousel(p.photos)}
  <div class="info">
    <p class="eyebrow">Créations · ${esc(c.titre)}</p>
    <h1 class="serif">${esc(p.titre)}</h1>
    <p class="desc">${esc(desc)}</p>
${R.prix(p.prix, p.note)}
${stock ? stock + '\n' : ''}${R.bouton(p)}
    <p class="note" style="text-align:left; margin-top:22px">Pièce faite main : chaque exemplaire est unique et présente de légères variations.</p>
  </div>
</div>
${suite}

<section>
  <div class="wrap" style="text-align:center">
    <p class="eyebrow">Une envie précise ?</p>
    <h2 class="serif" style="font-size:32px; margin-bottom:14px">Je fabrique aussi sur commande</h2>
    <p style="color:var(--violet-mid); max-width:440px; margin:0 auto 30px">Une couleur, un prénom, une occasion : dites-moi ce que vous avez en tête.</p>
    <a href="contact-creations.html" class="btn">Me contacter</a>
    <p style="margin-top:26px"><a href="${esc(c.id)}.html" class="btn btn-outline"><span aria-hidden="true">&#8592;</span> ${esc(c.titre)}</a></p>
  </div>
</section>

${pied('creations')}

${LIGHTBOX}

${SCRIPTS}

</body>
</html>
`;
}

/* ---------- grille des créations sur l'accueil ---------- */

function grilleAccueil() {
  return CATS.map(c => {
    const liste = (c.photos_apercu || []).filter(x => x && x.image);
    const ph = liste[0] || { image: 'images/a-venir.jpg', alt: 'Photos à venir' };
    const vign = 'images/thumbs/' + path.basename(ph.image);
    const src = fs.existsSync(path.join(RACINE, vign)) ? vign : ph.image;
    return `      <div class="product">
        <a href="${c.id}.html"><img src="${esc(src)}" alt="${esc(ph.alt || c.titre)}"></a>
        <h3><a href="${c.id}.html">${esc(c.titre)}</a></h3>
        <p>${esc((c.resume || '').split(/[.!?]/)[0])}</p>
      </div>`;
  }).join('\n');
}

/* ---------- écriture ---------- */

function remplaceEntre(texte, debut, fin, contenu) {
  const d = texte.indexOf(debut), f = texte.indexOf(fin);
  if (d === -1 || f === -1) return texte;
  return texte.slice(0, d + debut.length) + '\n' + contenu + '\n' + texte.slice(f);
}

const ecrits = [];

fs.writeFileSync(path.join(RACINE, 'creations.html'), pageCreations());
ecrits.push('creations.html');

CATS.forEach(c => {
  fs.writeFileSync(path.join(RACINE, c.id + '.html'), pageCategorie(c));
  ecrits.push(c.id + '.html');

  const liens = R.liensProduits(c);
  (c.produits || []).forEach((p, i) => {
    if (!p || !p.titre) return;
    const autres = (c.produits || []).filter((_, n) => n !== i).slice(0, 4);
    fs.writeFileSync(path.join(RACINE, liens[i]), pageProduit(c, p, autres));
    ecrits.push('  ' + liens[i]);
  });
});

/* page → entrée de menu à mettre en évidence */
const FIXES = {
  'index.html': '',
  'plans-de-table.html': 'mariage',
  'le-voyage.html': 'mariage',
  'le-signature.html': 'mariage',
  'contact.html': 'mariage',
  'contact-creations.html': 'creations',
  'a-propos.html': 'apropos',
  'mentions-legales.html': '',
  'cgv.html': ''
};

Object.keys(FIXES).forEach(f => {
  const p = path.join(RACINE, f);
  if (!fs.existsSync(p)) return;
  let s = fs.readFileSync(p, 'utf8');
  const avant = s;
  s = remplaceEntre(s, '<!--NAV:START-->', '<!--NAV:END-->', navLiens(FIXES[f]));
  s = remplaceEntre(s, '<!--CATS:START-->', '<!--CATS:END-->', grilleAccueil());
  s = remplaceEntre(s, '<!--LISTE:START-->', '<!--LISTE:END-->', listeSite());
  if (s !== avant) { fs.writeFileSync(p, s); ecrits.push(f + ' (mis à jour)'); }
});

console.log('Pages générées :');
ecrits.forEach(f => console.log('  ' + f));
console.log(CATS.length + ' catégories, ' +
  CATS.reduce((n, c) => n + (c.produits || []).length, 0) + ' produits.');
