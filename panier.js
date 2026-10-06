/* ------------------------------------------------------------------
   Le panier des créations.

   Tout se passe dans le navigateur : rien n'est envoyé nulle part
   tant que la commande n'est pas validée depuis la page Panier.

   FRAIS D'ENVOI — tarifs La Poste 2026, à modifier ici si besoin.
------------------------------------------------------------------ */

var ENVOI = {
  simple: { libelle: 'Lettre simple, sans suivi', prix: 1.52, prixLourd: 3.10, seuil: 3 },
  suivie: { libelle: 'Lettre suivie',             prix: 3.60 },
  colis:  { libelle: 'Colis suivi',               prix: 7.59 }
};

(function () {
  var CLE = 'atelia-panier';

  function lire() {
    try {
      var brut = localStorage.getItem(CLE);
      var l = brut ? JSON.parse(brut) : [];
      return Array.isArray(l) ? l : [];
    } catch (e) { return []; }
  }

  function ecrire(l) {
    try { localStorage.setItem(CLE, JSON.stringify(l)); } catch (e) {}
    majPastille();
  }

  function nombre(prix) {
    var m = String(prix || '').replace(/\s/g, '').match(/([0-9]+)[.,]?([0-9]{0,2})/);
    if (!m) return 0;
    var dec = (m[2] || '0');
    while (dec.length < 2) dec += '0';
    return parseFloat(m[1] + '.' + dec);
  }

  function euros(n) { return n.toFixed(2).replace('.', ',') + ' €'; }
  function total(l) { return l.reduce(function (s, a) { return s + nombre(a.prix) * a.nb; }, 0); }
  function pieces(l) { return l.reduce(function (s, a) { return s + a.nb; }, 0); }
  /* un objet épais ne passe pas au tarif lettre : tout le panier part en colis */
  function formatEnvoi(l) {
    return l.some(function (a) { return a.envoi === 'colis'; }) ? 'colis' : 'lettre';
  }

  /* prix d'un mode d'envoi pour le panier courant */
  function prixEnvoi(mode, l) {
    if (mode === 'retrait') return 0;
    if (formatEnvoi(l) === 'colis') return ENVOI.colis.prix;
    if (mode === 'simple') {
      return pieces(l) > ENVOI.simple.seuil ? ENVOI.simple.prixLourd : ENVOI.simple.prix;
    }
    return ENVOI.suivie.prix;
  }

  function libelleEnvoi(mode, l) {
    if (formatEnvoi(l) === 'colis') return ENVOI.colis.libelle;
    return mode === 'simple' ? ENVOI.simple.libelle : ENVOI.suivie.libelle;
  }

  function majPastille() {
    var n = pieces(lire());
    Array.prototype.forEach.call(document.querySelectorAll('[data-panier-nb]'), function (el) {
      el.textContent = n ? ' (' + n + ')' : '';
    });
  }

  function ajoute(o) {
    var l = lire();
    var trouve = l.filter(function (a) { return a.titre === o.titre; })[0];
    if (trouve) trouve.nb += 1;
    else l.push({ titre: o.titre, prix: o.prix, image: o.image, envoi: o.envoi, nb: 1 });
    ecrire(l);
  }

  function confirme(b) {
    var t = b.textContent;
    b.textContent = 'Ajouté ✓';
    b.disabled = true;
    setTimeout(function () { b.textContent = t; b.disabled = false; }, 1400);
  }

  function initAjouts() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-ajout]'), function (b) {
      if (b.dataset.pret) return;
      b.dataset.pret = '1';
      b.addEventListener('click', function () {
        ajoute({ titre: b.dataset.titre, prix: b.dataset.prix,
                 image: b.dataset.image, envoi: b.dataset.envoi || 'lettre' });
        confirme(b);
      });
    });
  }

  function initPage() {
    var liste = document.getElementById('panier-liste');
    if (!liste) return;

    var vide = document.getElementById('panier-vide');
    var corps = document.getElementById('panier-corps');
    var sTotal = document.getElementById('panier-soustotal');
    var sEnvoi = document.getElementById('panier-envoi');
    var sTotalGen = document.getElementById('panier-total');
    var choixEnvoi = document.getElementById('mode-envoi');
    var blocAdresse = document.getElementById('bloc-adresse');
    var champRecap = document.getElementById('h-commande');
    var champMontant = document.getElementById('h-montant');

    function calcule() {
      var l = lire();
      var st = total(l);
      var choix = choixEnvoi ? choixEnvoi.value : 'retrait';
      var fr = prixEnvoi(choix, l);

      if (sTotal) sTotal.textContent = euros(st);
      if (sEnvoi) sEnvoi.textContent = choix === 'retrait' ? 'Offert' : euros(fr);
      if (sTotalGen) sTotalGen.textContent = euros(st + fr);
      if (blocAdresse) blocAdresse.hidden = choix === 'retrait';
      var avertit = document.getElementById('sans-suivi');
      if (avertit) avertit.hidden = !(choix === 'simple' && formatEnvoi(l) !== 'colis');

      var lignes = l.map(function (a) {
        return '• ' + a.nb + ' × ' + a.titre + ' — ' + euros(nombre(a.prix) * a.nb);
      });
      lignes.push('');
      lignes.push('Sous-total : ' + euros(st));
      lignes.push(choix === 'retrait' ? 'Retrait en main propre à Paris'
                                      : libelleEnvoi(choix, l) + ' : ' + euros(fr));
      lignes.push('TOTAL : ' + euros(st + fr));
      if (champRecap) champRecap.value = lignes.join('\n');
      if (champMontant) champMontant.value = euros(st + fr);

      var suite = document.getElementById('h-next');
      if (suite) {
        var base = location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
        suite.value = base + 'merci.html?total=' + encodeURIComponent(euros(st + fr));
      }
    }

    function dessine() {
      var l = lire();
      if (!l.length) {
        if (vide) vide.hidden = false;
        if (corps) corps.hidden = true;
        return;
      }
      if (vide) vide.hidden = true;
      if (corps) corps.hidden = false;

      liste.innerHTML = '';
      l.forEach(function (a, i) {
        var li = document.createElement('li');
        li.className = 'ligne';

        var img = document.createElement('img');
        img.src = a.image || 'images/a-venir.jpg';
        img.alt = a.titre;
        li.appendChild(img);

        var bloc = document.createElement('div');
        bloc.className = 'infos';
        var t = document.createElement('p');
        t.className = 'titre';
        t.textContent = a.titre;
        var pu = document.createElement('p');
        pu.className = 'pu';
        pu.textContent = euros(nombre(a.prix)) + " l'unité";
        bloc.appendChild(t); bloc.appendChild(pu);
        li.appendChild(bloc);

        var qte = document.createElement('div');
        qte.className = 'qte';
        var moins = document.createElement('button');
        moins.type = 'button'; moins.textContent = '−';
        moins.setAttribute('aria-label', 'Retirer un exemplaire');
        var n = document.createElement('span'); n.textContent = a.nb;
        var plus = document.createElement('button');
        plus.type = 'button'; plus.textContent = '+';
        plus.setAttribute('aria-label', 'Ajouter un exemplaire');
        moins.addEventListener('click', function () {
          var c = lire();
          if (c[i].nb > 1) c[i].nb -= 1; else c.splice(i, 1);
          ecrire(c); dessine();
        });
        plus.addEventListener('click', function () {
          var c = lire(); c[i].nb += 1; ecrire(c); dessine();
        });
        qte.appendChild(moins); qte.appendChild(n); qte.appendChild(plus);
        li.appendChild(qte);

        var somme = document.createElement('p');
        somme.className = 'somme';
        somme.textContent = euros(nombre(a.prix) * a.nb);
        li.appendChild(somme);

        var jeter = document.createElement('button');
        jeter.type = 'button'; jeter.className = 'jeter'; jeter.textContent = 'Retirer';
        jeter.addEventListener('click', function () {
          var c = lire(); c.splice(i, 1); ecrire(c); dessine();
        });
        li.appendChild(jeter);
        liste.appendChild(li);
      });

      if (choixEnvoi) {
        var colis = formatEnvoi(l) === 'colis';
        var oSimple = choixEnvoi.querySelector('option[value="simple"]');
        var oSuivie = choixEnvoi.querySelector('option[value="suivie"]');
        if (oSimple) {
          oSimple.hidden = colis;
          oSimple.textContent = ENVOI.simple.libelle + ' — ' + euros(prixEnvoi('simple', l));
          if (colis && choixEnvoi.value === 'simple') choixEnvoi.value = 'suivie';
        }
        if (oSuivie) {
          oSuivie.textContent = libelleEnvoi('suivie', l) + ' — ' + euros(prixEnvoi('suivie', l));
        }
      }
      calcule();
    }

    if (choixEnvoi) choixEnvoi.addEventListener('change', calcule);

    var formulaire = document.getElementById('form-panier');
    if (formulaire) {
      formulaire.addEventListener('submit', function () {
        try { localStorage.removeItem(CLE); } catch (e) {}
      });
    }

    dessine();
  }

  function demarre() { initAjouts(); majPastille(); initPage(); }
  window.initPanier = demarre;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarre);
  else demarre();
})();
