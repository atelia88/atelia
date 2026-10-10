/* ------------------------------------------------------------------
   Carrousels, galeries et visionneuse plein écran.
   initGalleries() peut être rappelé après un affichage dynamique.
------------------------------------------------------------------ */

(function () {
  var lb, lbimg, lbvid, counter, set = [], i = 0, lbReady = false;

  function dezoom() {
    if (!lbimg) return;
    lbimg.classList.remove('zoom');
    lbimg.style.transformOrigin = '';
  }

  function show(n) {
    if (!set.length) return;
    dezoom();
    i = (n + set.length) % set.length;
    var x = set[i];

    if (x.video && lbvid) {
      lbimg.hidden = true;
      lbimg.removeAttribute('src');
      lbvid.hidden = false;
      if (lbvid.getAttribute('src') !== x.video) lbvid.setAttribute('src', x.video);
      if (x.poster) lbvid.setAttribute('poster', x.poster);
      lbvid.setAttribute('aria-label', x.alt || '');
      var p = lbvid.play();
      if (p && p.catch) p.catch(function () { /* lecture refusée : les contrôles suffisent */ });
    } else {
      if (lbvid) { lbvid.pause(); lbvid.hidden = true; }
      lbimg.hidden = false;
      lbimg.src = x.full;
      lbimg.alt = x.alt;
    }

    if (counter) counter.textContent = (i + 1) + ' / ' + set.length;
  }

  function open(list, n) {
    if (!lb) return;
    set = list;
    show(n);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!lb) return;
    dezoom();
    if (lbvid) lbvid.pause();
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function setupLightbox() {
    lb = document.getElementById('lb');
    if (!lb || lbReady) return;
    lbimg = document.getElementById('lbimg');
    counter = document.getElementById('lbcount');
    lbReady = true;

    /* Le lecteur vidéo est créé à la volée : aucune page n'a besoin
       de le contenir, il suffit qu'elle ait la visionneuse. */
    lbvid = document.createElement('video');
    lbvid.id = 'lbvid';
    lbvid.setAttribute('controls', '');
    lbvid.setAttribute('playsinline', '');
    lbvid.setAttribute('preload', 'metadata');
    lbvid.loop = true;
    lbvid.hidden = true;
    lbvid.addEventListener('click', function (e) { e.stopPropagation(); });
    lbimg.parentNode.insertBefore(lbvid, lbimg.nextSibling);

    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

    /* un clic sur la photo agrandie la grossit encore, un second la remet */
    function origine(e) {
      var r = lbimg.getBoundingClientRect();
      var x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
      var y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
      lbimg.style.transformOrigin = x + '% ' + y + '%';
    }
    lbimg.addEventListener('click', function (e) {
      e.stopPropagation();
      if (lbimg.classList.contains('zoom')) { dezoom(); return; }
      origine(e);
      lbimg.classList.add('zoom');
    });
    lbimg.addEventListener('mousemove', function (e) {
      if (lbimg.classList.contains('zoom')) origine(e);
    });
    var p = lb.querySelector('.prev'), n = lb.querySelector('.next'), c = lb.querySelector('.close');
    if (p) p.addEventListener('click', function (e) { e.stopPropagation(); show(i - 1); });
    if (n) n.addEventListener('click', function (e) { e.stopPropagation(); show(i + 1); });
    if (c) c.addEventListener('click', function (e) { e.stopPropagation(); close(); });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'Escape') close();
    });

    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) show(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    }, { passive: true });
  }

  function initGalleries() {
    setupLightbox();

    /* ---------- Galeries en grille ---------- */
    document.querySelectorAll('.gallery').forEach(function (g) {
      if (g.dataset.ready) return;
      g.dataset.ready = '1';
      /* photos et vidéos mêlées, dans l'ordre où elles sont affichées */
      var items = Array.prototype.slice.call(g.querySelectorAll('img, video'));
      var list = items.map(function (el) {
        if (el.tagName === 'VIDEO') {
          return {
            video: el.getAttribute('src') || el.currentSrc || '',
            poster: el.getAttribute('poster') || '',
            alt: el.getAttribute('aria-label') || ''
          };
        }
        return { full: el.dataset.full || el.src, alt: el.alt || '' };
      });
      items.forEach(function (el, n) {
        el.style.cursor = 'zoom-in';
        el.addEventListener('click', function () { open(list, n); });
      });
    });

    /* ---------- Photos isolées ---------- */
    var solo = Array.prototype.slice.call(document.querySelectorAll('.hero-shot, .product img'));
    if (solo.length) {
      var soloList = solo.map(function (el) { return { full: el.dataset.full || el.src, alt: el.alt || '' }; });
      solo.forEach(function (el, n) {
        if (el.dataset.ready) return;
        el.dataset.ready = '1';
        el.style.cursor = 'zoom-in';
        el.addEventListener('click', function () { open(soloList, n); });
      });
    }

    /* ---------- Carrousels ---------- */
    document.querySelectorAll('.carousel').forEach(function (car) {
      if (car.dataset.ready) return;
      car.dataset.ready = '1';

      var imgs = Array.prototype.slice.call(car.querySelectorAll('.frame img'));
      if (!imgs.length) return;
      var list = imgs.map(function (el) { return { full: el.dataset.full || el.src, alt: el.alt || '' }; });
      var k = 0;
      var dots = car.querySelector('.car-dots');
      var count = car.querySelector('.car-count');

      if (dots) {
        dots.innerHTML = '';
        imgs.forEach(function (_, n) {
          var d = document.createElement('span');
          d.addEventListener('click', function (e) { e.stopPropagation(); go(n); });
          dots.appendChild(d);
        });
      }

      function go(n) {
        k = (n + imgs.length) % imgs.length;
        imgs.forEach(function (el, x) { el.classList.toggle('on', x === k); });
        if (dots) Array.prototype.forEach.call(dots.children, function (d, x) { d.classList.toggle('on', x === k); });
        if (count) count.textContent = (k + 1) + ' / ' + imgs.length;
      }

      var pv = car.querySelector('.car-prev');
      var nx = car.querySelector('.car-next');
      if (pv) pv.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); go(k - 1); });
      if (nx) nx.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); go(k + 1); });

      var lien = car.dataset.lien;
      imgs.forEach(function (el) {
        if (lien) {
          el.style.cursor = 'pointer';
          el.addEventListener('click', function () { location.href = lien; });
        } else {
          el.addEventListener('click', function () { open(list, k); });
        }
      });

      var sx = null;
      car.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      car.addEventListener('touchend', function (e) {
        if (sx === null) return;
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) go(dx < 0 ? k + 1 : k - 1);
        sx = null;
      }, { passive: true });

      go(0);
    });
  }

  /* ---------- filtres d'une catégorie ---------- */

  function majCompte(n) {
    var el = document.getElementById('compte');
    if (!el) return;
    el.textContent = n === 0 ? '' : n + (n > 1 ? ' pièces' : ' pièce');
  }

  function initFiltres() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('#grille .pcard'));
    var box = document.getElementById('filtres');
    var vide = document.getElementById('vide');

    if (!box || box.hidden) { majCompte(cards.length); return; }
    var btns = Array.prototype.slice.call(box.querySelectorAll('button'));
    if (!btns.length) { majCompte(cards.length); return; }

    function applique(f) {
      var n = 0;
      cards.forEach(function (c) {
        var ok = (f === 'tous' || c.dataset.cat === f);
        c.hidden = !ok;
        if (ok) n++;
      });
      btns.forEach(function (b) { b.classList.toggle('on', b.dataset.f === f); });
      if (vide) vide.hidden = n > 0;
      majCompte(n);
    }

    btns.forEach(function (b) {
      if (b.dataset.ready) return;
      b.dataset.ready = '1';
      b.addEventListener('click', function () { applique(b.dataset.f); });
    });

    var h = location.hash.replace('#', '');
    applique(btns.some(function (b) { return b.dataset.f === h; }) ? h : 'tous');
  }

  /* ---------- boutons de commande ---------- */

  function initStripe() {
    document.querySelectorAll('[data-stripe]').forEach(function (el) {
      if (el.dataset.ready) return;
      el.dataset.ready = '1';
      el.addEventListener('click', function (e) {
        if (el.getAttribute('href') === '#') {
          e.preventDefault();
          alert("Le paiement en ligne n'est pas encore actif pour cet article. Écrivez-moi depuis la page Contact.");
        }
      });
    });
  }

  /* ---------- bande d'ambiance : trois photos, défilement une par une ---------- */

  function initPistes() {
    var pistes = [].slice.call(document.querySelectorAll('.piste'));
    pistes.forEach(function (piste) {
      if (piste.dataset.ready) return;
      piste.dataset.ready = '1';

      var rail = piste.querySelector('.piste-rail');
      var vue = piste.querySelector('.piste-vue');
      var prev = piste.querySelector('.piste-prev');
      var next = piste.querySelector('.piste-next');
      var vraies = [].slice.call(rail.querySelectorAll('img'));
      var n = vraies.length;
      if (!n) return;

      var liste = vraies.map(function (el) {
        return { full: el.dataset.full || el.src, alt: el.alt || '' };
      });

      /* on double la bande de chaque côté pour que le défilement tourne
         en rond et que les aperçus latéraux ne soient jamais vides */
      var MARGE = Math.min(n, 4);
      function clone(el, k) {
        var c = el.cloneNode(true);
        c.dataset.rang = k;
        c.setAttribute('aria-hidden', 'true');
        return c;
      }
      var avant = [], apres = [];
      for (var k = n - MARGE; k < n; k++) avant.push(clone(vraies[k], k));
      for (var j = 0; j < MARGE; j++) apres.push(clone(vraies[j], j));
      vraies.forEach(function (el, k) { el.dataset.rang = k; });
      avant.forEach(function (c) { rail.insertBefore(c, rail.firstChild); });
      apres.forEach(function (c) { rail.appendChild(c); });

      var tous = [].slice.call(rail.querySelectorAll('img'));
      tous.forEach(function (el) {
        el.addEventListener('click', function () {
          open(liste, parseInt(el.dataset.rang, 10) || 0);
        });
      });

      var pos = MARGE;

      function mesure() {
        var l = tous[0].getBoundingClientRect().width;
        var st = getComputedStyle(rail);
        var g = parseFloat(st.columnGap || st.gap) || 0;
        var bord = parseFloat(getComputedStyle(piste).getPropertyValue('--piste-bord')) || 0;
        return { pas: l + g, bord: bord };
      }

      function place(anime) {
        var m = mesure();
        rail.style.transition = anime ? '' : 'none';
        rail.style.transform = 'translateX(' + (m.bord - pos * m.pas) + 'px)';
        if (!anime) rail.getBoundingClientRect();
      }

      function bouge(sens) {
        pos += sens;
        place(true);
      }

      rail.addEventListener('transitionend', function (e) {
        if (e.propertyName !== 'transform') return;
        if (pos >= n + MARGE) { pos -= n; place(false); }
        else if (pos < MARGE) { pos += n; place(false); }
      });

      if (prev) prev.addEventListener('click', function () { bouge(-1); });
      if (next) next.addEventListener('click', function () { bouge(1); });

      var x0 = null;
      piste.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      piste.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 45) bouge(dx < 0 ? 1 : -1);
        x0 = null;
      }, { passive: true });

      window.addEventListener('resize', function () { place(false); });
      place(false);
    });
  }

  function tout() { initGalleries(); initPistes(); initFiltres(); initStripe(); }

  window.initGalleries = initGalleries;
  window.initPistes = initPistes;
  window.initFiltres = initFiltres;
  window.initStripe = initStripe;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tout);
  } else {
    tout();
  }
})();
