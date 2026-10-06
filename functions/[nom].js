/* ------------------------------------------------------------------
   Sert les pages de catégorie créées depuis la gestion.

   Une page déjà présente dans le site est servie telle quelle.
   Ce n'est que si elle n'existe pas — catégorie ajoutée après la
   mise en ligne — que cette fonction la fabrique depuis le catalogue.
------------------------------------------------------------------ */

const esc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const article = t => /^[aeiouyéèêà]/i.test(t) ? "l'" : 'les ';

function carrousel(liste) {
  const p = (liste || []).filter(x => x && x.image);
  const photos = p.length ? p : [{ image: 'images/a-venir.jpg', alt: 'Photos à venir' }];
  const slides = photos.map(x =>
    `            <img src="${esc(x.image)}" alt="${esc(x.alt || '')}">`).join('\n');
  const fleches = photos.length > 1 ? `
          <button class="car-arrow car-prev" aria-label="Photo précédente">&#8249;</button>
          <button class="car-arrow car-next" aria-label="Photo suivante">&#8250;</button>
          <div class="car-dots"></div>` : '';
  return `        <div class="carousel">
          <div class="frame">
${slides}
          </div>${fleches}
          <span class="car-count"></span>
        </div>`;
}

const prix = (p, note) => p
  ? `          <p class="from">${esc(p)}${note ? `<small>${esc(note)}</small>` : ''}</p>`
  : `          <p class="from"><span class="soon">Photos à venir</span></p>`;

function stockDe(p) {
  if (p.stock === '' || p.stock == null) return null;
  const n = parseInt(p.stock, 10);
  return isNaN(n) ? null : Math.max(0, n);
}
const epuise = p => stockDe(p) === 0;

function mentionStock(p) {
  const n = stockDe(p);
  if (n === null) return '';
  if (n === 0) return '          <p class="stock rupture">Épuisé</p>';
  return '          <p class="stock dispo">En stock</p>';
}

function bouton(p) {
  if (p.personnalisable === 'prenom' && !epuise(p)) return `          <a href="contact-creations.html?objet=personnalise&article=${encodeURIComponent(p.titre || '')}#prenom" class="btn">Personnaliser</a>`;
  if (epuise(p)) return `          <a href="contact-creations.html?objet=epuise&article=${encodeURIComponent(p.titre || '')}" class="btn btn-outline">Passer commande</a>`;
  if (p.lien_paiement) return `          <a href="${esc(p.lien_paiement)}" class="btn">Ajouter au panier</a>`;
  if (p.prix && /[0-9]/.test(p.prix)) return `          <a href="contact-creations.html?objet=commande&article=${encodeURIComponent(p.titre || '')}" class="btn">Commander</a>`;
  return '          <a href="contact-creations.html" class="btn btn-outline">Me contacter</a>';
}

function page(c, cats) {
  const entete = (c.photos_entete || []).filter(x => x && x.image);
  const filtres = (c.filtres || []).filter(f => f && f.id);

  const produits = (c.produits || []).map(p => {
    const st = mentionStock(p);
    return `      <div class="pcard"${p.filtre ? ` data-cat="${esc(p.filtre)}"` : ''}>
${carrousel(p.photos)}
        <div class="body">
${p.etiquette ? `          <span class="tag">${esc(p.etiquette)}</span>\n` : ''}          <h3 class="serif">${esc(p.titre)}</h3>
${p.description ? `          <p>${esc(p.description)}</p>\n` : ''}${prix(p.prix, p.note)}
${st ? st + '\n' : ''}${bouton(p)}
        </div>
      </div>`;
  }).join('\n\n');

  const liste = [
    '          <li><a href="plans-de-table.html">Plans de table mariage</a></li>',
    '          <li><a href="le-voyage.html">Le Voyage</a></li>',
    '          <li><a href="le-signature.html">Le Signature</a></li>',
    '          <li><a href="creations.html">Créations</a></li>',
    ...cats.map(x => `          <li><a href="${esc(x.id)}.html">${esc(x.titre)}</a></li>`),
    '          <li><a href="a-propos.html">À propos</a></li>'
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.titre)} — Atélia</title>
<meta name="description" content="${esc(c.intro || c.resume || '')}">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>

<header>
  <nav class="nav">
    <a href="index.html" class="logo">Atélia</a>
    <button class="nav-toggle" aria-label="Menu" onclick="document.getElementById('menu').classList.toggle('open')">≡</button>
    <div class="nav-links" id="menu">
      <a href="plans-de-table.html">Plans de table mariage</a>
      <a href="creations.html" class="active">Créations</a>
      <a href="a-propos.html">À propos</a>
      <a href="contact.html">Contact</a>
    </div>
  </nav>
</header>

<div class="backlink">
  <div class="wrap">
    <a href="creations.html"><span aria-hidden="true">&#8592;</span> Toutes les créations</a>
  </div>
</div>

<section class="tight">
  <div class="wrap" style="text-align:center; max-width:640px">
    <p class="eyebrow" id="cat-eyebrow">${esc(c.eyebrow || 'Créations · Faits main')}</p>
    <h1 class="serif" id="cat-titre" style="font-size:42px; line-height:1.15; margin-bottom:16px">${esc(c.titre)}</h1>
    <p style="color:var(--violet-mid)" id="cat-intro">${esc(c.intro || c.resume || '')}</p>
  </div>
</section>

<section class="tight" style="padding-top:0" id="cat-entete"${entete.length ? '' : ' hidden'}>
${entete.length ? `  <div class="wrap" style="max-width:840px">
${entete.map((x, n) => `    <img src="${esc(x.image)}" data-full="${esc(x.image)}" alt="${esc(x.alt || '')}" class="hero-shot" style="width:100%; display:block${n ? '; margin-top:18px' : ''}">`).join('\n')}
  </div>` : ''}
</section>

<section class="bg-white" style="padding-top:24px" data-cat-id="${esc(c.id)}">
  <div class="wrap">
    <div class="filters" id="filtres"${filtres.length ? '' : ' hidden'}>
${filtres.length ? `      <button data-f="tous" class="on">Tous</button>
${filtres.map(f => `      <button data-f="${esc(f.id)}">${esc(f.label)}</button>`).join('\n')}` : ''}
    </div>
    <div class="product-cards" id="grille">

${produits}

    </div>
    <p class="note" id="vide" hidden>Aucune pièce dans cette catégorie pour le moment.</p>
    <p class="note">Cliquez sur les flèches pour faire défiler les photos, ou sur une photo pour la voir en grand.</p>
  </div>
</section>

<section>
  <div class="wrap" style="text-align:center">
    <p class="eyebrow">Une envie précise ?</p>
    <h2 class="serif" id="cat-bas-titre" style="font-size:32px; margin-bottom:14px">${esc(c.bas_de_page_titre || 'Je fabrique aussi sur commande')}</h2>
    <p style="color:var(--violet-mid); max-width:440px; margin:0 auto 30px" id="cat-bas-texte">${esc(c.bas_de_page_texte || '')}</p>
    <a href="contact.html" class="btn">Me contacter</a>
    <p style="margin-top:26px"><a href="creations.html" class="btn btn-outline"><span aria-hidden="true">&#8592;</span> Toutes les créations</a></p>
  </div>
</section>

<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <span class="logo">Atélia</span>
        <p>Plans de table de mariage peints à la main et petites créations artisanales. Paris.</p>
      </div>
      <div>
        <h4>Le site</h4>
        <ul>
${liste}
        </ul>
      </div>
      <div>
        <h4>Informations</h4>
        <ul>
          <li><a href="contact.html">Contact et devis</a></li>
          <li><a href="mentions-legales.html">Mentions légales</a></li>
          <li><a href="cgv.html">Conditions de vente</a></li>
        </ul>
      </div>
    </div>
    <div class="base">
      <span>© 2026 Atélia — Tous droits réservés</span>
      <span>Créations artisanales · Paris</span>
    </div>
  </div>
</footer>

<div class="lightbox" id="lb">
  <span class="close" aria-label="Fermer">&times;</span>
  <span class="arrow prev" aria-label="Photo précédente">&#8249;</span>
  <span class="arrow next" aria-label="Photo suivante">&#8250;</span>
  <img id="lbimg" src="" alt="">
  <span class="counter" id="lbcount"></span>
</div>

<script src="gallery.js"></script>

</body>
</html>`;
}

/* ---------- pages des pièces ---------- */

const slug = t => String(t == null ? '' : t)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function liensProduits(c) {
  const vus = {};
  return (c.produits || []).map(p => {
    let s = slug(p.titre) || 'piece';
    if (vus[s]) { vus[s] += 1; s = s + '-' + vus[s]; } else { vus[s] = 1; }
    return c.id + '-' + s + '.html';
  });
}

function pageProduit(c, p, autres, cats) {
  const desc = p.description || c.resume || '';
  const st = mentionStock(p);
  const liens = liensProduits(c);

  const grille = autres.length ? `
<section class="bg-white">
  <div class="wrap">
    <div class="section-head" style="margin-bottom:34px">
      <h2>${autres.length > 1 ? 'Les autres pièces' : "L'autre pièce"} de la catégorie</h2>
    </div>
    <div class="product-cards" id="grille">
${autres.map((x, n) => `      <div class="pcard">
${carrousel(x.photos)}
        <div class="body">
          <h3 class="serif">${esc(x.titre)}</h3>
${prix(x.prix, x.note)}
${bouton(x)}
        </div>
      </div>`).join('\n\n')}
    </div>
  </div>
</section>` : '';

  const liste = [
    '          <li><a href="creations.html">Toutes les créations</a></li>',
    ...cats.map(x => `          <li><a href="${esc(x.id)}.html">${esc(x.titre)}</a></li>`),
    '          <li><a href="panier.html">Mon panier</a></li>'
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.titre)} — ${esc(c.titre)} | Atélia</title>
<meta name="description" content="${esc(desc)}">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>

<header>
  <nav class="nav">
    <a href="index.html" class="logo">Atélia</a>
    <button class="nav-toggle" aria-label="Menu" aria-expanded="false">≡</button>
    <div class="nav-links" id="menu">
      <a href="plans-de-table.html">Plans de table mariage</a>
      <a href="creations.html" class="active">Créations</a>
      <a href="a-propos.html">À propos</a>
    </div>
  </nav>
</header>

<div class="backlink">
  <div class="wrap">
    <a href="${esc(c.id)}.html"><span aria-hidden="true">&#8592;</span> ${esc(c.titre)}</a>
  </div>
</div>

<div class="product-hero">
${carrousel(p.photos)}
  <div class="info">
    <p class="eyebrow">Créations · ${esc(c.titre)}</p>
    <h1 class="serif">${esc(p.titre)}</h1>
    <p class="desc">${esc(desc)}</p>
${prix(p.prix, p.note)}
${st ? st + '\n' : ''}${bouton(p)}
    <p class="note" style="text-align:left; margin-top:22px">Pièce faite main : chaque exemplaire est unique et présente de légères variations.</p>
  </div>
</div>
${grille}

<section>
  <div class="wrap" style="text-align:center">
    <p class="eyebrow">Une envie précise ?</p>
    <h2 class="serif" style="font-size:32px; margin-bottom:14px">Je fabrique aussi sur commande</h2>
    <p style="color:var(--violet-mid); max-width:440px; margin:0 auto 30px">Dites-moi ce que vous avez en tête et je vous dis si c'est faisable.</p>
    <a href="contact-creations.html" class="btn">M'écrire</a>
  </div>
</section>

<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <span class="logo">Atélia</span>
        <p>Plans de table de mariage peints à la main et petites créations. Paris.</p>
      </div>
      <div>
        <h4>Côté créations</h4>
        <ul>
${liste}
        </ul>
      </div>
      <div>
        <h4>Informations</h4>
        <ul>
          <li><a href="a-propos.html">À propos</a></li>
          <li><a href="mentions-legales.html">Mentions légales</a></li>
          <li><a href="cgv.html">Conditions de vente</a></li>
        </ul>
      </div>
    </div>
    <div class="base">
      <span>© 2026 Atélia — Tous droits réservés</span>
      <span>Créations faites main, cédées à titre occasionnel · Paris</span>
    </div>
  </div>
</footer>

<div class="lightbox" id="lb">
  <span class="close" aria-label="Fermer">&times;</span>
  <span class="arrow prev" aria-label="Photo précédente">&#8249;</span>
  <span class="arrow next" aria-label="Photo suivante">&#8250;</span>
  <img id="lbimg" src="" alt="">
  <span class="counter" id="lbcount"></span>
</div>

<script src="panier.js"></script>
<script src="nav.js"></script>
<script src="gallery.js"></script>

</body>
</html>`;
}

export async function onRequest(context) {
  const reponse = await context.next();
  if (reponse.status !== 404) return reponse;

  const { env, params } = context;
  const nom = String(params.nom || '');
  const id = nom.replace(/\.html$/, '');
  if (!/^[a-z0-9-]+$/.test(id) || !env.ATELIA) return reponse;

  const brut = await env.ATELIA.get('catalogue');
  if (!brut) return reponse;

  let cats;
  try { cats = (JSON.parse(brut).categories || []); } catch { return reponse; }

  const c = cats.find(x => x && x.id === id);

  if (!c) {
    /* pas une catégorie : peut-être la page d'une pièce */
    for (const cat of cats) {
      const liens = liensProduits(cat);
      const k = liens.indexOf(id + '.html');
      if (k === -1) continue;
      const p = (cat.produits || [])[k];
      if (!p) continue;
      const autres = (cat.produits || []).filter((_, n) => n !== k).slice(0, 4);
      return new Response(pageProduit(cat, p, autres, cats), {
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }
      });
    }
    return reponse;
  }

  return new Response(page(c, cats), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }
  });
}
