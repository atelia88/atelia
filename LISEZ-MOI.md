# Atélia — le site

Site en ligne : **https://atelia88.github.io/atelia/**

- **Pour gérer les créations au quotidien** → lis `GUIDE-ADMIN.md`
- **Pour répondre aux commandes** → modèles d'emails dans `MODELES-EMAILS.md`

---

## Où vit le site

Les fichiers sont sur GitHub : https://github.com/atelia88/atelia
GitHub Pages les publie automatiquement à chaque modification.

Gratuit, sans limite de durée, sans carte bancaire.

Ce dossier-ci, sur le Bureau, est une copie de travail. Tu n'as normalement
plus besoin d'y toucher : la page de gestion écrit directement sur GitHub.

---

## Les fichiers, en bref

| Fichier | Rôle |
| --- | --- |
| `data/catalogue.json` | **Le cœur du site** : toutes les catégories, produits, prix, stocks, photos |
| `gestion-….html` | La page de gestion privée |
| `builder.js` | Refabrique les pages du site à partir du catalogue |
| `render.js` | Dessine les vignettes, carrousels et boutons |
| `panier.js` + `panier.html` | Le panier et le calcul des frais de port |
| `gallery.js` | L'agrandissement des photos et les carrousels |
| `nav.js` | Le menu déroulant |
| `style.css` | Toute l'apparence du site |
| `build.js` | Même chose que `builder.js`, mais en ligne de commande (`node build.js`) |
| `images/` | Les photos. `images/thumbs/` contient les versions allégées |

Les pages `.html` à la racine sont **fabriquées** à partir du catalogue pour
les créations, et **écrites à la main** pour l'accueil, À propos, les mariages
et les pages légales.

---

## Les formulaires

Trois formulaires passent par Formspree (compte gratuit, 50 envois par mois) :

| Formulaire | Identifiant |
| --- | --- |
| Devis mariage (`contact.html`) | `mdeoarbj` |
| Contact créations (`contact-creations.html`) | `xwlkvdzn` |
| Commande / panier (`panier.html`) | `xwlkvdzn` |

Ils envoient tout sur `celia_moulin@icloud.com`.

---

## Les paiements

Wero, Lydia ou virement au **07 87 32 85 58**, nom et prénom dans l'intitulé.
Aucun prestataire de paiement, aucune commission.

Les conditions de vente et les mentions légales sont rédigées pour des
**ventes occasionnelles entre particuliers** : pas de SIRET affiché, pas de
droit de rétractation de 14 jours, pas de garanties professionnelles.
Si l'activité devient régulière, il faudra les refaire et déclarer l'activité.

---

## Les frais de port

Tarifs La Poste inscrits dans `panier.js` (en haut du fichier) :

| Mode | Prix |
| --- | --- |
| Lettre simple, sans suivi | 1,52 € (3,10 € au-delà de 3 pièces) |
| Lettre suivie | 3,60 € |
| Colis suivi | 7,59 € |

Dès qu'une pièce du panier est en `colis`, tout le panier passe en colis.
Pense à vérifier ces tarifs une fois par an, La Poste les change en janvier.
