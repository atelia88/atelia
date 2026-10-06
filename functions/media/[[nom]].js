/* ------------------------------------------------------------------
   Sert les photos envoyées depuis la gestion.
------------------------------------------------------------------ */

export async function onRequestGet({ params, env }) {
  if (!env.ATELIA) return new Response('Stockage non configuré', { status: 500 });

  const nom = Array.isArray(params.nom) ? params.nom.join('/') : String(params.nom || '');
  if (!/^[a-z0-9._-]+$/i.test(nom)) return new Response('Introuvable', { status: 404 });

  const { value, metadata } = await env.ATELIA.getWithMetadata('media:' + nom, { type: 'arrayBuffer' });
  if (!value) return new Response('Introuvable', { status: 404 });

  return new Response(value, {
    headers: {
      'content-type': (metadata && metadata.type) || 'image/jpeg',
      'cache-control': 'public, max-age=31536000, immutable'
    }
  });
}
