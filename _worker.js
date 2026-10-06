/* ------------------------------------------------------------------
   Atélia — un seul fichier pour tout le côté serveur.

   Cloudflare ignore le dossier « functions » quand le site est déposé
   par glisser-déposer ; ce fichier-ci, en revanche, est bien pris en
   compte. Il regroupe :

     /api/code       envoi du code de connexion par email
     /api/verifier   vérification du code, ouverture de session
     /api/catalogue  lecture et écriture du catalogue
     /api/photo      dépôt d'une photo
     /media/…        les photos déposées depuis la gestion
     le reste        les fichiers du site, et les pages fabriquées
                     à la volée pour une catégorie ou une pièce
                     ajoutée depuis la gestion.

   Réglages attendus sur Cloudflare :
     ATELIA          l'espace de stockage (KV)
     ADMIN_EMAIL     l'adresse qui reçoit les codes
     RESEND_API_KEY  la clé d'envoi d'emails
------------------------------------------------------------------ */


/* ------------------------------------------------------------------
   Fonctions partagées par l'espace de gestion.
------------------------------------------------------------------ */

const json = (donnees, statut = 200) =>
  new Response(JSON.stringify(donnees), {
    status: statut,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });

const erreur = (message, statut = 400) => json({ erreur: message }, statut);

/* Vérifie le jeton de session envoyé par la page de gestion. */
async function session(request, env) {
  const jeton = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!jeton) return null;
  const brut = await env.ATELIA.get('session:' + jeton);
  if (!brut) return null;
  try { return JSON.parse(brut); } catch { return null; }
}

/* Petit garde-fou contre les tentatives répétées. */
async function trop(env, cle, max, secondes) {
  const k = 'limite:' + cle;
  const n = parseInt(await env.ATELIA.get(k) || '0', 10);
  if (n >= max) return true;
  await env.ATELIA.put(k, String(n + 1), { expirationTtl: secondes });
  return false;
}

const alea = (n = 32) => {
  const o = new Uint8Array(n);
  crypto.getRandomValues(o);
  return Array.from(o).map(b => b.toString(16).padStart(2, '0')).join('');
};

/* Comparaison à durée constante, pour ne pas fuiter le code. */
function egal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/* ------------------------------------------------------------------
   Envoie un code à six chiffres sur l'adresse email de l'atelier.
   Le code vaut dix minutes.

   Variables Cloudflare attendues :
     ADMIN_EMAIL     l'adresse qui reçoit les codes
     RESEND_API_KEY  la clé d'envoi d'emails
     EXPEDITEUR      facultatif, par défaut onboarding@resend.dev
   Espace de stockage : ATELIA
------------------------------------------------------------------ */


async function envoieCode({ request, env }) {
  if (!env.ATELIA) return erreur("Le stockage n'est pas configuré.", 500);
  if (!env.ADMIN_EMAIL) return erreur("L'adresse de réception n'est pas configurée.", 500);

  const ip = request.headers.get('cf-connecting-ip') || 'inconnue';
  if (await trop(env, 'code:' + ip, 5, 900)) {
    return erreur('Trop de demandes. Réessayez dans un quart d\'heure.', 429);
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await env.ATELIA.put('code', JSON.stringify({ code, essais: 0 }), { expirationTtl: 600 });

  if (!env.RESEND_API_KEY) {
    return erreur("L'envoi d'emails n'est pas configuré.", 500);
  }

  const corps = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;
                max-width:420px;margin:0 auto;padding:32px 24px;color:#3B2A52">
      <p style="font-family:Georgia,serif;font-size:22px;margin:0 0 24px">Atélia</p>
      <p style="font-size:14px;color:#6B5C7D;margin:0 0 18px">
        Voici votre code pour entrer dans la gestion du site :
      </p>
      <p style="font-size:34px;letter-spacing:8px;font-weight:500;margin:0 0 18px">${code}</p>
      <p style="font-size:13px;color:#9B8CA8;margin:0">
        Il est valable dix minutes. Si vous n'êtes pas à l'origine de cette demande,
        ignorez ce message — et changez l'adresse secrète de votre page de gestion.
      </p>
    </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + env.RESEND_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        from: env.EXPEDITEUR || 'Atélia <onboarding@resend.dev>',
        to: [env.ADMIN_EMAIL],
        subject: `Votre code Atélia : ${code}`,
        html: corps
      })
    });
    if (!r.ok) {
      const d = await r.text();
      return erreur("L'email n'a pas pu être envoyé. " + d.slice(0, 200), 502);
    }
  } catch (e) {
    return erreur("L'email n'a pas pu être envoyé.", 502);
  }

  return json({ envoye: true, vers: masque(env.ADMIN_EMAIL) });
}

function masque(email) {
  const [a, b] = String(email).split('@');
  if (!b) return '···';
  return a.slice(0, 2) + '···@' + b;
}

/* ------------------------------------------------------------------
   Vérifie le code reçu par email et ouvre une session de douze heures.
------------------------------------------------------------------ */


async function verifieCode({ request, env }) {
  if (!env.ATELIA) return erreur("Le stockage n'est pas configuré.", 500);

  const ip = request.headers.get('cf-connecting-ip') || 'inconnue';
  if (await trop(env, 'verif:' + ip, 10, 900)) {
    return erreur('Trop de tentatives. Réessayez dans un quart d\'heure.', 429);
  }

  let saisi = '';
  try { saisi = String((await request.json()).code || '').trim(); } catch {}
  if (!/^\d{6}$/.test(saisi)) return erreur('Code invalide.', 400);

  const brut = await env.ATELIA.get('code');
  if (!brut) return erreur('Le code a expiré. Demandez-en un nouveau.', 400);

  const enregistre = JSON.parse(brut);
  if (enregistre.essais >= 5) {
    await env.ATELIA.delete('code');
    return erreur('Trop d\'erreurs. Demandez un nouveau code.', 429);
  }

  if (!egal(saisi, enregistre.code)) {
    enregistre.essais += 1;
    await env.ATELIA.put('code', JSON.stringify(enregistre), { expirationTtl: 600 });
    return erreur('Code incorrect.', 401);
  }

  await env.ATELIA.delete('code');

  const jeton = alea(32);
  await env.ATELIA.put('session:' + jeton, JSON.stringify({ ouvert: Date.now() }),
    { expirationTtl: 43200 });

  return json({ jeton, duree: 43200 });
}

/* ------------------------------------------------------------------
   GET  : renvoie le catalogue (public)
   PUT  : enregistre le catalogue (session requise)
------------------------------------------------------------------ */


async function litCatalogue({ env }) {
  if (!env.ATELIA) return erreur('Stockage non configuré.', 500);
  const brut = await env.ATELIA.get('catalogue');
  if (!brut) return json({ categories: null, vide: true });
  return new Response(brut, {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

async function ecritCatalogue({ request, env }) {
  if (!env.ATELIA) return erreur('Stockage non configuré.', 500);
  if (!await session(request, env)) return erreur('Session expirée, reconnectez-vous.', 401);

  let data;
  try { data = await request.json(); } catch { return erreur('Données illisibles.', 400); }
  if (!data || !Array.isArray(data.categories)) return erreur('Format inattendu.', 400);

  for (const c of data.categories) {
    if (!c.id || !/^[a-z0-9-]+$/.test(c.id)) {
      return erreur(`L'adresse « ${c.id || '(vide)'} » n'est pas valide : minuscules, chiffres et tirets uniquement.`, 400);
    }
    if (!c.titre) return erreur('Une catégorie est sans nom.', 400);
  }
  const ids = data.categories.map(c => c.id);
  const doublon = ids.find((x, i) => ids.indexOf(x) !== i);
  if (doublon) return erreur(`Deux catégories portent la même adresse : ${doublon}`, 400);

  await env.ATELIA.put('catalogue', JSON.stringify(data));
  await env.ATELIA.put('catalogue:date', new Date().toISOString());

  return json({ enregistre: true, categories: data.categories.length });
}

/* ------------------------------------------------------------------
   Reçoit une photo depuis la gestion et la range dans le stockage.
   Renvoie son adresse définitive, du type /media/ma-photo-a1b2c3.jpg
------------------------------------------------------------------ */


const TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

const MAX = 5 * 1024 * 1024;

async function recoitPhoto({ request, env }) {
  if (!env.ATELIA) return erreur('Stockage non configuré.', 500);
  if (!await session(request, env)) return erreur('Session expirée, reconnectez-vous.', 401);

  let form;
  try { form = await request.formData(); } catch { return erreur('Envoi illisible.', 400); }

  const fichier = form.get('photo');
  if (!fichier || typeof fichier === 'string') return erreur('Aucune photo reçue.', 400);

  const ext = TYPES[fichier.type];
  if (!ext) return erreur('Format non accepté. Utilisez du JPEG, PNG ou WebP.', 400);
  if (fichier.size > MAX) {
    return erreur('Photo trop lourde (' + Math.round(fichier.size / 1024 / 1024) +
                  ' Mo). Cinq mégaoctets au maximum.', 400);
  }

  const base = (fichier.name || 'photo')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'photo';

  const nom = base + '-' + alea(4) + '.' + ext;

  await env.ATELIA.put('media:' + nom, await fichier.arrayBuffer(), {
    metadata: { type: fichier.type }
  });

  return json({ url: '/media/' + nom, nom });
}

/* ------------------------------------------------------------------
   Sert les photos envoyées depuis la gestion.
------------------------------------------------------------------ */

async function sertMedia({ params, env }) {
  if (!env.ATELIA) return new Response('Stockage non configuré', { status: 500 });

  const nom = Array.isArray(params.nom) ? params.nom.join('/') : String(params.nom || '');
  if (!/^[a-z0-9._-]+$/i.test(nom)) return new Response('Introuvable', { status: 404 });

  const { value, metadata } = await env.ATELIA.getWithMetadata('media:' + nom, { type: 'arrayBuffer' });
  if (!value) return new Response('Introuvable', { status: 404 });

  return new Response(value, {
    headers: {
      'content-type': (metadata && metadata.type) || 'image/jpeg',
      'cache-control': 'public, max-age=31536000, immutable'
    }
  });
}

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

async function pageDynamique(context) {
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


/* ---------- routage ---------- */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const chemin = url.pathname;
    const methode = request.method.toUpperCase();

    if (chemin === '/api/code' && methode === 'POST') return envoieCode({ request, env });
    if (chemin === '/api/verifier' && methode === 'POST') return verifieCode({ request, env });
    if (chemin === '/api/catalogue' && methode === 'GET') return litCatalogue({ env });
    if (chemin === '/api/catalogue' && methode === 'PUT') return ecritCatalogue({ request, env });
    if (chemin === '/api/photo' && methode === 'POST') return recoitPhoto({ request, env });

    if (chemin.startsWith('/media/')) {
      return sertMedia({ params: { nom: chemin.slice('/media/'.length) }, env });
    }

    /* le fichier existe-t-il dans le site ? */
    const reponse = await env.ASSETS.fetch(request);
    if (reponse.status !== 404) return reponse;

    /* sinon, page fabriquée à la volée */
    const nom = chemin.replace(/^\//, '');
    return pageDynamique({
      env,
      params: { nom },
      next: async () => reponse
    });
  }
};

