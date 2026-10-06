/* ------------------------------------------------------------------
   Reçoit une photo depuis la gestion et la range dans le stockage.
   Renvoie son adresse définitive, du type /media/ma-photo-a1b2c3.jpg
------------------------------------------------------------------ */

import { json, erreur, session, alea } from '../_lib.js';

const TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

const MAX = 5 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
  if (!env.ATELIA) return erreur('Stockage non configuré.', 500);
  if (!await session(request, env)) return erreur('Session expirée, reconnectez-vous.', 401);

  let form;
  try { form = await request.formData(); } catch { return erreur('Envoi illisible.', 400); }

  const fichier = form.get('photo');
  if (!fichier || typeof fichier === 'string') return erreur('Aucune photo reçue.', 400);

  const ext = TYPES[fichier.type];
  if (!ext) return erreur('Format non accepté. Utilisez du JPEG, PNG ou WebP.', 400);
  if (fichier.size > MAX) {
    return erreur('Photo trop lourde (' + Math.round(fichier.size / 1024 / 1024) +
                  ' Mo). Cinq mégaoctets au maximum.', 400);
  }

  const base = (fichier.name || 'photo')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'photo';

  const nom = base + '-' + alea(4) + '.' + ext;

  await env.ATELIA.put('media:' + nom, await fichier.arrayBuffer(), {
    metadata: { type: fichier.type }
  });

  return json({ url: '/media/' + nom, nom });
}
