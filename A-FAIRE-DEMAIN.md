# Atélia — reprendre ici

## Où on en est

Le site est **terminé** et se trouve dans ce dossier.
Il n'est **pas en ligne** : Cloudflare a bloqué le compte (« Subdomain is blocked »)
et n'a jamais répondu, ni par email ni sur le forum. On abandonne Cloudflare.

Pour voir le site en attendant : double-cliquer `index.html`.
(En local les formulaires ne s'envoient pas et la page de gestion ne marche pas.)

## Le plan décidé

Mettre le site en ligne sur **GitHub Pages** (gratuit à vie, sans carte bancaire,
sans quota) et réécrire la page de gestion pour qu'elle écrive directement
dans le site via GitHub — au lieu de passer par Cloudflare.

Résultat visé : Célia change un prix, passe un article en épuisé ou ajoute
des photos depuis la page de gestion, et le site en ligne se met à jour seul.
Aucune intervention extérieure ensuite.

## Mes étapes (Célia)

1. Créer un compte sur github.com — email + mot de passe, pas de carte.
2. « New repository », nom `atelia`, public.
3. Glisser le contenu de ce dossier dedans.
   Le navigateur limite à 100 fichiers par glissement et il y en a ~175,
   donc deux ou trois glissements. (Ou l'appli GitHub Desktop, en une fois.)
4. Settings → Pages → branche `main`. Le site est en ligne :
   `mon-pseudo.github.io/atelia`
5. Settings → Developer settings → Personal access tokens → générer une clé,
   **sans date d'expiration**, accès au dépôt `atelia` uniquement.
6. Ouvrir la page de gestion et coller la clé. Une seule fois.

## Les étapes de Claude

- Réécrire `gestion-6mutway8qgspmni7i42pbk.html` : remplacer les appels
  `/api/catalogue`, `/api/photo`, `/api/code`, `/api/verifier` par l'API GitHub
  (lecture + écriture de `data/catalogue.json`, envoi des photos dans `images/`).
  L'apparence de la page ne change pas.
- Porter la régénération des pages HTML côté navigateur (`render.js` sert déjà
  de base, et `_worker.js` contient `page()` et `pageProduit()` à réutiliser).
- Remplacer la connexion par code email (Resend) par la clé d'accès GitHub.
- `live.js` : lire le catalogue depuis le dépôt au lieu de `/api/catalogue`.
- Réactiver les deux formulaires Formspree depuis la nouvelle adresse :
  mariage `mdeoarbj`, créations/commandes `xwlkvdzn`.
- Mettre à jour `GUIDE-ADMIN.md` en français simple : ajouter un produit,
  changer un prix, mettre en épuisé, ajouter une photo.

## À ne pas oublier

- Objectif de Célia : être **autonome sans abonnement Claude** après
  l'installation. Le guide écrit fait partie de la livraison.
- Pas de SIRET affiché, activité de loisir, ventes occasionnelles :
  `mentions-legales.html` et `cgv.html` sont déjà rédigées dans ce sens.
- Paiement : Wero / Lydia / virement au 07 87 32 85 58, nom et prénom
  dans l'intitulé. Pas de Stripe.
- Fichiers devenus inutiles une fois sur GitHub : `_worker.js`, `functions/`.
