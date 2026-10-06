/* ------------------------------------------------------------------
   Fonctions partagées par l'espace de gestion.
------------------------------------------------------------------ */

export const json = (donnees, statut = 200) =>
  new Response(JSON.stringify(donnees), {
    status: statut,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });

export const erreur = (message, statut = 400) => json({ erreur: message }, statut);

/* Vérifie le jeton de session envoyé par la page de gestion. */
export async function session(request, env) {
  const jeton = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!jeton) return null;
  const brut = await env.ATELIA.get('session:' + jeton);
  if (!brut) return null;
  try { return JSON.parse(brut); } catch { return null; }
}

/* Petit garde-fou contre les tentatives répétées. */
export async function trop(env, cle, max, secondes) {
  const k = 'limite:' + cle;
  const n = parseInt(await env.ATELIA.get(k) || '0', 10);
  if (n >= max) return true;
  await env.ATELIA.put(k, String(n + 1), { expirationTtl: secondes });
  return false;
}

export const alea = (n = 32) => {
  const o = new Uint8Array(n);
  crypto.getRandomValues(o);
  return Array.from(o).map(b => b.toString(16).padStart(2, '0')).join('');
};

/* Comparaison à durée constante, pour ne pas fuiter le code. */
export function egal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
