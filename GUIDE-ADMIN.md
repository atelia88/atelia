# Atélia — guide de la page de gestion

Tout ce qu'il faut savoir pour faire vivre le site toute seule.
Rien ici ne demande de savoir coder.

---

## Les trois adresses à connaître

| À quoi ça sert | Adresse |
| --- | --- |
| Le site, ce que voient les visiteurs | https://atelia88.github.io/atelia/ |
| **La page de gestion** (privée) | https://atelia88.github.io/atelia/gestion-6mutway8qgspmni7i42pbk.html |
| Les fichiers du site | https://github.com/atelia88/atelia |

Mets la page de gestion en favori dans Safari. Son adresse est volontairement
imprononçable : c'est ce qui la rend introuvable pour les visiteurs.

---

## Se connecter

Ouvre la page de gestion, colle ta clé d'accès, clique **Entrer**.

Le navigateur retient la clé : les fois suivantes la page s'ouvre directement.
Si tu cliques **Sortir**, il faudra la recoller.

**Si tu as perdu ta clé**, il suffit d'en refaire une :
GitHub → ta photo en haut à droite → `Settings` → tout en bas `Developer settings`
→ `Personal access tokens` → `Fine-grained tokens` → `Generate new token`.
Nom `atelia`, expiration `No expiration`, dépôt `atelia` uniquement,
permission `Contents` en `Read and write`.

---

## Les gestes du quotidien

Après chaque modification, clique **Publier** en bas de la page.
Le site se met à jour tout seul, compte **une minute environ** avant de voir
le changement en ligne (recharge la page du site si besoin).

### Changer un prix

Ouvre la catégorie → ouvre le produit → modifie la case **Prix** → **Publier**.

Écris le prix comme tu veux qu'il s'affiche : `6,90 €`, `à partir de 12 €`,
`Sur commande`. Si le prix ne contient aucun chiffre, le bouton du site
devient « Me contacter » au lieu de « Ajouter au panier ».

### Passer un article en épuisé (ou le remettre en stock)

Ouvre le produit → case **Stock** :

- `0` → le site affiche **Épuisé** et le bouton devient « Passer commande »
- `1` ou plus → le site affiche **En stock** et le bouton « Ajouter au panier »
- case vide → aucune mention de stock

La ligne **« Ce que verra le visiteur »** juste à côté te montre le résultat
en direct, avant même de publier.

### Ajouter des photos

Ouvre le produit → clique le carré **+** sous « Photos du produit » →
choisis une ou plusieurs photos sur ton ordinateur ou ton téléphone.

Les photos sont automatiquement réduites et converties — tu peux envoyer
des photos d'iPhone en pleine taille sans y penser.

**La première photo de la liste est celle qu'on voit en premier sur le site.**
Pour changer l'ordre, attrape une vignette et fais-la glisser.
Le petit **×** en haut à droite retire une photo.

La petite case sous chaque vignette sert à décrire la photo (« bracelet rose
porté au poignet »). Ce n'est pas obligatoire, mais c'est utile pour Google
et pour les personnes malvoyantes.

### Ajouter un produit

Ouvre la catégorie → **+ Ajouter un produit** en bas de la liste des produits.
Un produit vide apparaît, remplis-le, ajoute ses photos, **Publier**.

Sa page est créée toute seule, et il apparaît dans sa catégorie et dans
« Toutes les créations ».

### Ajouter une catégorie

**+ Nouvelle catégorie** tout en bas de la page.

Deux cases comptent :

- **Nom affiché** : ce que lisent les visiteurs (ex. « Colliers »)
- **Adresse de la page** : en minuscules, sans accent ni espace (ex. `colliers`)

La catégorie apparaît automatiquement dans le menu du haut et dans le bas de
page de tout le site.

### Changer l'ordre

Attrape le petit symbole **⠿** à gauche d'une catégorie ou d'un produit et
fais-le glisser. L'ordre à l'écran est l'ordre sur le site.

---

## Les autres cases, en clair

| Case | À quoi ça sert |
| --- | --- |
| Petite étiquette | Le petit mot au-dessus du nom sur la vignette |
| Précision sous le prix | Ligne grise sous le prix, ex. « Envoi en France ou retrait à Paris » |
| Description | Le texte sous le nom du produit |
| Sous-catégorie (filtre) | Pour les boutons de tri en haut d'une catégorie. Laisse vide s'il n'y en a pas |
| Format d'envoi | `lettre` pour ce qui tient dans une enveloppe, `colis` pour un objet épais. Ça change le prix du port calculé dans le panier |
| Personnalisable | `prenom` envoie le visiteur vers le formulaire au lieu du panier. Vide sinon |
| Résumé / Introduction | Les textes en haut d'une page de catégorie |
| Photos du carrousel | Les photos qui défilent sur la vignette de la catégorie |
| Photos d'ambiance | Le bandeau de photos en haut de la page de la catégorie |

---

## Les commandes

Quand quelqu'un commande, tu reçois un **email** à `celia_moulin@icloud.com`
avec son nom, son adresse, les pièces commandées et le montant total.

Le site lui a demandé de payer par **Wero, Lydia ou virement** au
**07 87 32 85 58**, en mettant son nom et prénom dans l'intitulé.

Ta marche à suivre :

1. Vérifie que les pièces sont bien disponibles
2. Confirme-lui par email que tu as les pièces (modèles prêts dans `MODELES-EMAILS.md`)
3. Attends le paiement
4. Envoie, et préviens-la par email
5. **Reviens ici passer les pièces vendues en stock `0`**

Ce dernier point est le seul vraiment important : c'est ce qui évite qu'on te
commande une pièce que tu n'as plus.

---

## Si quelque chose ne va pas

**« Clé refusée »** — la clé est mal collée ou expirée. Refais-en une
(voir plus haut).

**« Clé acceptée mais sans les droits d'écriture »** — à la création de la clé,
la permission `Contents` n'était pas sur `Read and write`. Refais-en une.

**« Le dépôt a changé entre-temps »** — recharge la page et recommence.
Ça arrive si tu as deux onglets de gestion ouverts en même temps.

**Le site n'affiche pas mon changement** — attends une minute, puis recharge
avec **Cmd+Maj+R** (ça force Safari à oublier son ancienne version).

**J'ai fait une bêtise et je veux revenir en arrière** — sur
github.com/atelia88/atelia, onglet **Commits** : chaque publication y est
enregistrée avec sa date. Rien n'est jamais perdu, tout est réversible.

**Le bouton Publier ne fait rien** — regarde le texte en bas à gauche de la
page, l'erreur y est écrite en français.

---

## Ce que la page de gestion ne fait pas

Elle gère les **créations** : catégories, produits, prix, stock, photos, ordre.

Elle ne touche pas aux pages écrites à la main : l'accueil, À propos, les deux
formules de mariage, les galeries de mariage, les mentions légales, les
conditions de vente. Pour celles-là il faut modifier les fichiers directement —
c'est du code, il faut quelqu'un qui sache le faire.

Elle ne change pas non plus la mise en page, les couleurs, ni le fonctionnement
du panier.

---

## Comment ça marche, en deux phrases

Tes fichiers vivent sur GitHub. Quand tu cliques **Publier**, la page de gestion
refabrique toutes les pages du site à partir de ce que tu as saisi, et les
dépose sur GitHub. GitHub les met en ligne tout seul, en une minute.

Il n'y a aucun abonnement, aucun serveur à payer, aucune limite de durée.
