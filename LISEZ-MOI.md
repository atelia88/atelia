# Atélia — mode d'emploi

Site statique, sans base de données ni serveur. Tout tient dans ce dossier.

## Ce qu'il y a dedans

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil |
| `plans-de-table.html` | Comparatif des deux formules, tarifs, déroulé, galerie |
| `le-voyage.html` | Page produit du Voyage : carrousel, tarif, bouton « Je commande » |
| `le-signature.html` | Page produit du Signature |
| `creations.html` | Liste des catégories, **générée** par `build.js` |
| `bracelets.html`, `marque-pages.html`… | Une page par catégorie, **générée** par `build.js` |
| `build.js` | Régénère les pages à partir du catalogue |
| `data/catalogue.json` | **Tous les produits, prix et photos** — piloté depuis `/admin` |
| `admin/` | L'interface d'administration (voir GUIDE-ADMIN.md) |
| `functions/api/` | Connexion sécurisée à l'administration |
| `a-propos.html` | Ton histoire et ta façon de travailler |
| `contact.html` | Devis mariage : calculateur de tarif + formulaire |
| `contact-creations.html` | Formulaire créations : pièce épuisée, commande, question |
| `tarifs.js` | **Les prix** — c'est le seul fichier à modifier pour les changer |
| `gallery.js` | Carrousels et visionneuse plein écran (flèches, clavier, balayage) |
| `mentions-legales.html` / `cgv.html` | Obligatoires pour vendre en ligne — **à compléter** |
| `style.css` | Toutes les couleurs et la mise en page |
| `images/` | Tes 37 photos converties en JPG et optimisées (+ `images/thumbs/` pour les vignettes) |

## Les 3 choses à faire avant la mise en ligne

### 1. Le formulaire de devis

Il utilise Formspree (gratuit jusqu'à 50 messages/mois).

**C'est déjà fait.** Deux formulaires Formspree sont branchés :

| Page | Identifiant |
|---|---|
| `contact.html` — devis et commandes mariage | `mdeoarbj` |
| `contact-creations.html` et `panier.html` — créations | `xwlkvdzn` |

Une fois le site en ligne, envoie-toi un message de test depuis chaque page. Formspree n'active un formulaire qu'au premier envoi : tu recevras un email de confirmation à valider, et seulement ensuite les vrais messages arriveront. Le test ne fonctionne pas depuis un fichier ouvert sur ton ordinateur, il faut passer par l'adresse `.pages.dev`.

Tu peux créer deux formulaires Formspree distincts — un par univers — pour ne pas mélanger les demandes de devis mariage et les commandes de créations.

**Les pièces jointes du formulaire de devis.** Le champ « Vos documents » permet aux mariés de joindre leur faire-part, leur save the date ou une photo de leur décoration. Attention : Formspree n'accepte les fichiers qu'à partir de son offre payante. Sur le plan gratuit, le reste du message arrive bien mais les fichiers sont ignorés — remplace alors le paragraphe d'aide par une invitation à te les envoyer par email, ou dis-le moi et je branche l'envoi sur ton propre espace Cloudflare, sans abonnement.

### 2 bis. Le paiement des plans de table

Jusqu'à 200 invités, le prix est ferme et les mariés règlent en ligne. Il te faut **quatre liens de paiement Stripe** :

| Formule | Invités | Montant |
|---|---|---|
| Le Voyage | jusqu'à 159 | 290 € |
| Le Voyage | 160 à 200 | 330 € |
| Le Signature | jusqu'à 159 | 390 € |
| Le Signature | 160 à 200 | 430 € |

Colle chaque adresse dans le champ `paiement` correspondant, en haut de `tarifs.js`. Tant qu'un champ reste vide, le bouton dit « Valider ma commande » et tu envoies le lien de paiement toi-même par email — le formulaire fonctionne quand même.

Au-delà de 200 invités, la page bascule automatiquement en demande de devis, sans paiement.

**Comment ça s'enchaîne** : le formulaire part chez Formspree avec toutes les réponses et les documents, puis Formspree redirige vers Stripe. Tu reçois donc le brief *avant* le paiement, même si quelqu'un abandonne au moment de payer.

### 2. Le paiement de la boutique

Utilise les **Payment Links** de Stripe : pas de code, pas de backend.

1. Crée un compte sur stripe.com
2. Pour chaque article : Produits → Créer un lien de paiement → copie l'URL
3. Colle l'URL dans le champ *Lien de paiement Stripe* du produit, depuis `/admin`

Stripe prend 1,5 % + 0,25 € par transaction européenne, sans abonnement.

### 3. Les mentions légales et CGV

Les deux pages sont pré-rédigées mais contiennent des champs entre crochets : nom, SIRET, adresse, email, médiateur. **Il faut les compléter** — c'est une obligation légale dès qu'on vend en ligne.

## Mettre en ligne sur Cloudflare Pages

1. Compte gratuit sur dash.cloudflare.com
2. Workers & Pages → Create → Pages → Upload assets
3. Glisse le dossier `atelia` entier
4. C'est en ligne, sur une adresse en `.pages.dev`

Pour un vrai nom de domaine (`atelia.fr`, ~10 €/an) : achète-le, puis dans Cloudflare Pages → Custom domains, ajoute-le. Le HTTPS est automatique.

**Pourquoi Cloudflare plutôt que Netlify ou Vercel** : bande passante illimitée, usage commercial autorisé sur le plan gratuit (ce n'est pas le cas de Vercel Hobby), pas de système de crédits qui s'épuise.

## Changer des choses

**Les couleurs** — tout est en haut de `style.css`, dans le bloc `:root`. Change une valeur, elle se répercute partout.

**Les prix** — ouvre `tarifs.js`, tout est en haut du fichier dans le tableau `TARIFS`. Change une valeur : le calculateur de la page devis et celui des deux pages produit suivent automatiquement.

Trois endroits affichent encore les mêmes chiffres écrits en dur, à mettre à jour à la main : les tableaux de `plans-de-table.html`, `le-voyage.html` et `le-signature.html`, plus les mentions « à partir de » sur l'accueil.

**Ajouter une photo à un carrousel** — dans la page concernée, ajoute une ligne `<img src="images/photo-XX.jpg" alt="...">` à l'intérieur du `<div class="frame">`. Les flèches, les points et le compteur s'ajustent tout seuls.

**Ajouter une photo** — dépose-la dans `images/`, puis copie-colle une ligne `<img>` existante dans la galerie en changeant le nom du fichier. Pense à écrire une description dans `alt=""` : c'est ce que Google lit.

**Retirer l'offre de lancement du Signature** — dans `tarifs.js`, mets `normal: null` sur les deux lignes `signature`. Le prix barré disparaît partout, comme pour Le Voyage. Pense aussi aux tableaux écrits en dur dans `plans-de-table.html` et `le-signature.html`.

## Correspondance des photos

Les fichiers ont été renommés `photo-01` à `photo-37` dans l'ordre alphabétique de tes originaux. Les principales :

- `photo-35`, `photo-29` — carte du monde verte (photo d'accueil)
- `photo-21`, `photo-17`, `photo-36` — Inès & Ziryab, carte orange sur bleu
- `photo-13`, `photo-14`, `photo-15` — tournesols
- `photo-23`, `photo-27`, `photo-24` — détails peints
- `photo-08`, `photo-09`, `photo-10`, `photo-12` — coulisses
- `photo-01` mosaïque, `photo-02`/`photo-37` bracelets

## L'administration

Pour ajouter une photo, un produit ou une catégorie depuis ton navigateur, suis **GUIDE-ADMIN.md**. Une fois en place, tu n'auras plus jamais à toucher aux fichiers.

## Ce qu'il reste à faire un jour

- Ajouter des photos de tes bracelets, marque-pages et couture (la page Créations réutilise pour l'instant des photos de dépannage)
- Redresser ou recadrer les photos prises de travers
- Une page par article de boutique si le catalogue grossit
- Des témoignages de mariés — c'est ce qui convertit le mieux sur ce type de site
