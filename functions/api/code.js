/* ------------------------------------------------------------------
   Envoie un code à six chiffres sur l'adresse email de l'atelier.
   Le code vaut dix minutes.

   Variables Cloudflare attendues :
     ADMIN_EMAIL     l'adresse qui reçoit les codes
     RESEND_API_KEY  la clé d'envoi d'emails
     EXPEDITEUR      facultatif, par défaut onboarding@resend.dev
   Espace de stockage : ATELIA
------------------------------------------------------------------ */

import { json, erreur, trop, alea } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  if (!env.ATELIA) return erreur("Le stockage n'est pas configuré.", 500);
  if (!env.ADMIN_EMAIL) return erreur("L'adresse de réception n'est pas configurée.", 500);

  const ip = request.headers.get('cf-connecting-ip') || 'inconnue';
  if (await trop(env, 'code:' + ip, 5, 900)) {
    return erreur('Trop de demandes. Réessayez dans un quart d\'heure.', 429);
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await env.ATELIA.put('code', JSON.stringify({ code, essais: 0 }), { expirationTtl: 600 });

  if (!env.RESEND_API_KEY) {
    return erreur("L'envoi d'emails n'est pas configuré.", 500);
  }

  const corps = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;
                max-width:420px;margin:0 auto;padding:32px 24px;color:#3B2A52">
      <p style="font-family:Georgia,serif;font-size:22px;margin:0 0 24px">Atélia</p>
      <p style="font-size:14px;color:#6B5C7D;margin:0 0 18px">
        Voici votre code pour entrer dans la gestion du site :
      </p>
      <p style="font-size:34px;letter-spacing:8px;font-weight:500;margin:0 0 18px">${code}</p>
      <p style="font-size:13px;color:#9B8CA8;margin:0">
        Il est valable dix minutes. Si vous n'êtes pas à l'origine de cette demande,
        ignorez ce message — et changez l'adresse secrète de votre page de gestion.
      </p>
    </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + env.RESEND_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        from: env.EXPEDITEUR || 'Atélia <onboarding@resend.dev>',
        to: [env.ADMIN_EMAIL],
        subject: `Votre code Atélia : ${code}`,
        html: corps
      })
    });
    if (!r.ok) {
      const d = await r.text();
      return erreur("L'email n'a pas pu être envoyé. " + d.slice(0, 200), 502);
    }
  } catch (e) {
    return erreur("L'email n'a pas pu être envoyé.", 502);
  }

  return json({ envoye: true, vers: masque(env.ADMIN_EMAIL) });
}

function masque(email) {
  const [a, b] = String(email).split('@');
  if (!b) return '···';
  return a.slice(0, 2) + '···@' + b;
}
