/* ------------------------------------------------------------------
   GET  : renvoie le catalogue (public)
   PUT  : enregistre le catalogue (session requise)
------------------------------------------------------------------ */

import { json, erreur, session } from '../_lib.js';

export async function onRequestGet({ env }) {
  if (!env.ATELIA) return erreur('Stockage non configuré.', 500);
  const brut = await env.ATELIA.get('catalogue');
  if (!brut) return json({ categories: null, vide: true });
  return new Response(brut, {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

export async function onRequestPut({ request, env }) {
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
