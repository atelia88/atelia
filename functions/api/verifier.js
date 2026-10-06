/* ------------------------------------------------------------------
   Vérifie le code reçu par email et ouvre une session de douze heures.
------------------------------------------------------------------ */

import { json, erreur, trop, alea, egal } from '../_lib.js';

export async function onRequestPost({ request, env }) {
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
