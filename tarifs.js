/* ------------------------------------------------------------------
   TARIFS DES PLANS DE TABLE

   NE PAS MODIFIER CE FICHIER À LA MAIN : le tableau ci-dessous est
   réécrit à chaque publication depuis la page de gestion, à partir de
   data/formules.json. Toute retouche faite ici serait effacée.

   Pour changer un prix : page de gestion → « Les deux formules ».

   max        nombre maximum d'invités de la tranche (null = sur devis)
   lancement  le prix affiché
   normal     le prix barré à côté (null = pas d'offre de lancement)
   paiement   lien de paiement en ligne (vide = règlement par virement,
              Wero ou Lydia après confirmation)
------------------------------------------------------------------ */

var TARIFS = [
/*TARIFS:START*/
  { max: 159,  label: "Jusqu'à 159 invités",
    voyage:    { lancement: 290, normal: null, paiement: '' },
    signature: { lancement: 390, normal: null, paiement: '' } },

  { max: 200,  label: "160 à 200 invités",
    voyage:    { lancement: 330, normal: null, paiement: '' },
    signature: { lancement: 430, normal: null, paiement: '' } },

  { max: null, label: 'Plus de 200 invités', voyage: null, signature: null }
/*TARIFS:END*/
];

function tarifPour(nbInvites, formule) {
  var n = parseInt(nbInvites, 10);
  if (isNaN(n) || n < 1) n = 150;
  for (var i = 0; i < TARIFS.length; i++) {
    var t = TARIFS[i];
    if (t.max === null || n <= t.max) return { tranche: t, prix: t[formule] };
  }
  return { tranche: TARIFS[TARIFS.length - 1], prix: null };
}

/* Bloc « je commande » des pages produit -------------------------- */
function initOrderBox(formule) {
  var input = document.getElementById('nb-invites');
  var amount = document.getElementById('order-amount');
  var was = document.getElementById('order-was');
  var fine = document.getElementById('order-fine');
  var link = document.getElementById('order-link');
  if (!input || !amount) return;

  function refresh() {
    var r = tarifPour(input.value, formule);
    if (!r.prix) {
      amount.textContent = 'Sur devis';
      was.textContent = '';
      fine.textContent = 'Au-delà de 200 invités, le tarif dépend du format du support. Écrivez-moi pour un devis.';
      if (link) link.textContent = 'Demander un devis';
    } else {
      amount.textContent = r.prix.lancement + ' €';
      was.textContent = r.prix.normal ? r.prix.normal + ' €' : '';
      fine.textContent = r.tranche.label + (r.prix.normal ? ' · Offre de lancement' : '') + ' · Virement, Wero ou Lydia · Retrait à Paris';
      if (link) link.textContent = 'Je commande';
    }
    if (link) {
      link.href = 'contact.html?formule=' + formule + '&invites=' + encodeURIComponent(input.value || '');
    }
  }

  input.addEventListener('input', refresh);
  refresh();
}

/* Calculateur de la page devis ----------------------------------- */
function initDevis() {
  var input = document.getElementById('invites');
  var sel = document.getElementById('formule');
  var amount = document.getElementById('prix-montant');
  var was = document.getElementById('prix-barre');
  var note = document.getElementById('prix-note');
  if (!input || !sel || !amount) return;

  /* Le formulaire bascule entre commande payée en ligne et demande de devis */
  var titreForm = document.getElementById('form-titre');
  var sousForm  = document.getElementById('form-sous');
  var bouton    = document.getElementById('bouton-envoi');
  var notePaie  = document.getElementById('note-paiement');
  var champNext = document.getElementById('h-next');

  function mode(prix) {
    if (!titreForm) return;

    if (!prix) {
      titreForm.textContent = 'Parlez-moi de votre mariage';
      sousForm.textContent = 'Je vous réponds avec un tarif précis sous quelques jours';
      bouton.textContent = 'Envoyer ma demande';
      notePaie.textContent = 'Aucun paiement à cette étape : je reviens vers vous avec un devis.';
      if (champNext) champNext.value = '';
      return;
    }

    titreForm.textContent = 'Parlez-moi de votre mariage';
    sousForm.textContent = 'Ces informations partent avec votre commande';

    if (prix.paiement) {
      bouton.textContent = 'Commander — ' + prix.lancement + ' €';
      notePaie.textContent = 'Vos réponses et vos documents me sont envoyés, puis vous êtes redirigés vers le paiement.';
      if (champNext) champNext.value = prix.paiement;
    } else {
      bouton.textContent = 'Commander — ' + prix.lancement + ' €';
      notePaie.textContent = 'Je vous réponds avec le récapitulatif et les modalités de règlement — virement, Wero ou Lydia. Rien n\'est débité depuis le site.';
      if (champNext) champNext.value = '';
    }
  }

  function refresh() {
    var f = sel.value;
    if (f !== 'voyage' && f !== 'signature') {
      amount.textContent = 'Sur devis';
      was.textContent = '';
      note.textContent = 'Décrivez-moi votre projet et je vous réponds avec un tarif précis.';
      mode(null);
      return;
    }
    var r = tarifPour(input.value, f);
    if (!r.prix) {
      amount.textContent = 'Sur devis';
      was.textContent = '';
      note.textContent = 'Au-delà de 200 invités, le tarif dépend du format du support.';
    } else {
      amount.textContent = r.prix.lancement + ' €';
      was.textContent = r.prix.normal ? r.prix.normal + ' €' : '';
      note.textContent = r.tranche.label + (r.prix.normal ? ' · Offre de lancement' : '') + ' · Virement, Wero ou Lydia';
    }
    mode(r.prix);
  }

  input.addEventListener('input', refresh);
  sel.addEventListener('change', refresh);

  var p = new URLSearchParams(location.search);
  if (p.get('formule')) sel.value = p.get('formule');
  if (p.get('invites')) input.value = p.get('invites');
  refresh();
}

document.addEventListener('DOMContentLoaded', initDevis);
