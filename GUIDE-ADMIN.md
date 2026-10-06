# Ta page de gestion

Elle vit sur ton site, à une adresse que toi seule connais, et se protège par un code envoyé sur ton email.

**Ton adresse secrète :**

```
gestion-6mutway8qgspmni7i42pbk.html
```

Soit, une fois en ligne : `https://ton-site.pages.dev/gestion-6mutway8qgspmni7i42pbk.html`

Mets-la en favori et ne la partage à personne. Elle n'est référencée nulle part : ni dans le menu, ni dans le pied de page, ni pour Google.

> **Elle ne marche pas depuis ton dossier.** Si tu ouvres le fichier directement sur ton ordinateur, la page s'affiche mais le bouton reste inactif : il n'y a pas de serveur pour envoyer le code. Elle ne fonctionne qu'une fois le site déposé sur Cloudflare, en passant par l'adresse en `.pages.dev`.

---

# Mise en place — une seule fois

Compte une vingtaine de minutes. Deux comptes gratuits à créer : Cloudflare pour héberger, Resend pour envoyer les codes par email.

## 1. Mettre le site en ligne

1. Va sur **dash.cloudflare.com**, crée un compte gratuit
2. **Workers & Pages** → *Create* → **Upload assets**
3. Nom du projet : `atelia`
4. Dépose le fichier **atelia-site.zip** — Cloudflare le décompresse tout seul
5. *Deploy*

> **Pourquoi un `_worker.js` et pas un dossier `functions` ?** Cloudflare ignore le dossier `functions` quand on dépose un site à la main : il ne le compile que lors d'un déploiement en ligne de commande. Tout le côté serveur — connexion, catalogue, photos, pages fabriquées à la volée — est donc réuni dans le fichier `_worker.js` à la racine, qui lui est bien pris en compte. N'y touche pas et ne le supprime pas.

Cloudflare te donne une adresse en `.pages.dev`. **Note-la.**

## 2. Créer l'espace de stockage

C'est là que vivront ton catalogue et tes photos.

1. Menu de gauche : **Storage & Databases** → *KV* → **Create instance**
2. Nom : `atelia`
3. Retourne dans ton projet Pages → *Settings* → **Bindings** → *Add* → **KV namespace**
   - Variable name : `ATELIA` — en majuscules, exactement
   - KV namespace : `atelia`
4. Enregistre

## 3. Brancher l'envoi des codes par email

1. Va sur **resend.com**, crée un compte gratuit (3 000 emails par mois, largement assez)
2. Menu **API Keys** → *Create API Key* → copie la clé qui commence par `re_`
3. Retourne sur Cloudflare → ton projet → *Settings* → **Variables and Secrets**, et ajoute :

| Nom | Valeur | Chiffrer |
|---|---|---|
| `ADMIN_EMAIL` | ton adresse email | oui |
| `RESEND_API_KEY` | la clé `re_…` | oui |

4. *Deployments* → **Retry deployment** pour que tout soit pris en compte

## 4. Première connexion

Va sur `https://ton-site.pages.dev/gestion-6mutway8qgspmni7i42pbk.html`

Clique sur **Recevoir mon code**, regarde tes emails, entre les six chiffres. Tu es dedans.

La première fois, la gestion charge le catalogue de départ. **Clique sur Publier** pour l'enregistrer.

---

# Au quotidien

### Ajouter une photo

Déplie la catégorie, puis le produit, clique sur le **+** dans les photos, choisis un ou plusieurs fichiers. Écris une courte description sous chaque photo — c'est ce que lit Google. Puis **Publier**.

### Changer l'ordre

Attrape une photo et fais-la glisser sur une autre : elles échangent leur place. Le numéro en haut à gauche indique le rang. La première est celle qu'on voit en premier.

Pour les produits et les catégories, attrape la poignée **⠿** à gauche du titre.

### Créer une catégorie — par exemple des coussins

1. **+ Nouvelle catégorie** en bas de page
2. Remplis le nom (`Coussins`) et l'adresse de la page (`coussins`, en minuscules, sans accent ni espace)
3. Ajoute le résumé, l'introduction, le prix affiché
4. Ajoute des photos au carrousel, puis des produits
5. **Publier**

Elle apparaît aussitôt sur la page Créations, sur l'accueil et dans le pied de page, avec sa propre page `/coussins.html`.

### Créer des filtres

Comme Perles et Brésiliens pour les bracelets. Dans le produit, écris le code du filtre dans *Sous-catégorie*. Les filtres eux-mêmes se déclarent dans le fichier `data/catalogue.json` pour l'instant — dis-le moi si tu veux les gérer depuis l'interface.

### Le format d'envoi

Chaque pièce porte un format, qui décide des frais dans le panier :

| Format | Pour quoi | Frais appliqués |
|---|---|---|
| `lettre` | Ce qui rentre dans une enveloppe : bracelets, marque-pages | 1,52 € sans suivi, 3,60 € en suivi |
| `colis` | Ce qui fait plus de 3 cm d'épaisseur : mosaïque, sacs, bananes | 7,59 € |

Une seule pièce en `colis` dans le panier fait basculer toute la commande en colis. Les tarifs eux-mêmes se modifient en haut de `panier.js`.

### Une pièce à personnaliser

Écris `prenom` dans le champ *Personnalisable*. Le bouton devient « Personnaliser » et mène au formulaire, avec un champ pour le prénom à inscrire — c'est le cas du bracelet prénom et du sac brodé. Laisse vide pour une pièce qui part directement au panier.

### Changer un prix

Déplie le produit, modifie le champ *Prix*, publie. Écris-le comme tu veux l'afficher : `2,60 €`, `à partir de 35 €`, `Sur commande`.

### Gérer le stock

Le champ *Stock* pilote ce que voit le visiteur, et la ligne juste à côté te montre le résultat avant même de publier.

| Stock | Sur le site |
|---|---|
| `1` ou plus | Étiquette **En stock** · bouton **Ajouter au panier** |
| `0` | Étiquette **Épuisé** · bouton **Passer commande** |
| vide | Aucune mention · bouton normal |

Les nouveaux produits démarrent à `1`. Quand une pièce part, mets `0` : elle reste visible avec ses photos intactes — c'est bon pour montrer ton travail — mais le bouton invite à te contacter pour en refaire une.

Le nombre exact n'est jamais affiché : le visiteur lit seulement « En stock » ou « Épuisé ». Il te sert à toi, pour t'y retrouver.

### Brancher un paiement

Sur stripe.com : *Produits* → *Créer un lien de paiement* → copie l'adresse, colle-la dans *Lien de paiement Stripe*. Tant que c'est vide, le bouton affiche un message d'attente.

---

# Ce qu'il faut savoir

**Ta session dure douze heures**, puis il faut redemander un code. Le code lui-même vaut dix minutes et ne sert qu'une fois.

**Cinq essais** maximum sur un code, cinq demandes de code par quart d'heure. Au-delà, il faut patienter — c'est ce qui empêche quelqu'un de forcer l'entrée.

**Tes photos** sont redimensionnées automatiquement ? Non — envoie-les à moins de 1500 pixels de large si tu peux, le site restera rapide. Cinq mégaoctets maximum par photo.

**Comment le site se met à jour.** Tes modifications sont enregistrées sur Cloudflare. Les pages du site les affichent immédiatement, sans attendre. Les fichiers HTML de ton dossier, eux, restent tels qu'ils étaient au moment de la mise en ligne : ils servent de version de secours et de base pour Google.

**Conséquence à connaître.** Un produit ajouté depuis la gestion s'affiche tout de suite : sa fiche apparaît dans sa catégorie, sa photo entre dans le carrousel de « Toutes les créations », et **sa page dédiée est fabriquée à la volée** — tu n'as rien à régénérer ni à redéposer. Seul Google mettra du temps à la découvrir. Pour les pages qui comptent vraiment pour être trouvée — celles des plans de table mariage — rien n'a changé, elles restent figées dans le HTML.

**Quand faut-il quand même me demander de régénérer ?** Seulement si tu veux que les nouvelles pages soient écrites en dur dans les fichiers — c'est un peu mieux pour le référencement Google et ça allège le travail du serveur. Une ou deux fois par an suffit largement.

**Sécurité.** Deux barrières : l'adresse secrète et le code par email. Même quelqu'un qui trouverait l'adresse ne pourrait rien modifier sans accéder à ta boîte mail. Si tu penses que l'adresse a fuité, dis-le moi, j'en génère une nouvelle en une minute.
