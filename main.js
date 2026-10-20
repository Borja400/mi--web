/* ==========================================================================
   Marca personal de Borja — JS puro, sin dependencias
   ========================================================================== */
(() => {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- 1. Año en el pie ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 2. Reloj local del pie ---------- */
  const clock = $('#clock');
  if (clock) {
    const tick = () => clock.textContent = new Date().toLocaleTimeString('es-ES');
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 3. Navegación: fondo pegajoso, progreso y enlace activo ---------- */
  const nav = $('#nav');
  const fill = $('#scrollbar-fill');
  const links = $$('.nav-link');

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 20);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    fill.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const sections = $$('main section[id], footer[id]');
  const navObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => navObs.observe(s));

  /* ---------- 4. Menú móvil ---------- */
  const burger = $('#burger');
  const menu = $('#nav-links');
  burger?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  menu?.addEventListener('click', (e) => {
    if (e.target.closest('a')) menu.classList.remove('open');
  });

  /* ---------- 5. Revelados al entrar en pantalla ---------- */
  const revealables = $$('.reveal, .mask');
  const hero = $('#inicio');
  requestAnimationFrame(() => hero?.classList.add('in'));

  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('in'), i * 70);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  revealables.forEach((el) => revealObs.observe(el));

  /* ---------- 6. Títulos con descifrado tipo scramble ---------- */
  const GLYPHS = '▓▒░#*+=/<>-_[]{}·01ABCDEFGHKLMNPRSTVXZ';
  const scramble = (el) => {
    const final = el.dataset.text || el.textContent;
    el.dataset.text = final;
    let frame = 0;
    const total = 26;
    const step = () => {
      const progress = frame / total;
      el.textContent = final.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        return i / final.length < progress ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }).join('');
      if (frame++ < total) requestAnimationFrame(step);
      else el.textContent = final;
    };
    step();
  };

  const scrObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      scramble(e.target);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  $$('[data-scramble]').forEach((el) => {
    el.dataset.text = el.textContent;
    if (REDUCED) return;
    el.textContent = el.textContent.replace(/\S/g, '·');
    scrObs.observe(el);
  });

  /* ---------- 7. Consola de la portada: escritura simulada ---------- */
  const lines = $$('#term-body .t-line');
  if (!REDUCED && lines.length) {
    lines.forEach((l) => {
      const text = l.dataset.cmd || l.dataset.out || '';
      const node = l.querySelector('.out') || l;
      node.textContent = '';
      l.dataset.full = text;
    });

    const typeLine = (line, target) => new Promise((res) => {
      const txt = line.dataset.full || '';
      let i = 0;
      const speed = line.dataset.cmd ? 26 : 12;
      const type = () => {
        target.textContent = txt.slice(0, ++i);
        if (i < txt.length) setTimeout(type, speed);
        else res();
      };
      type();
    });

    const runTerm = async () => {
      for (const line of lines) {
        const target = line.querySelector('.out') || line;
        if (line.classList.contains('t-caret')) { target.textContent = line.dataset.full; break; }
        await typeLine(line, target);
        await new Promise((r) => setTimeout(r, line.dataset.cmd ? 190 : 90));
      }
    };

    const termObs = new IntersectionObserver((e, obs) => {
      if (e[0].isIntersecting) { runTerm(); obs.disconnect(); }
    }, { threshold: 0.3 });
    termObs.observe($('#term'));
  }

  /* ---------- 8. Contadores numéricos ---------- */
  const countObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = parseInt(el.dataset.count, 10);
      if (REDUCED) { el.textContent = end; obs.unobserve(el); return; }
      const t0 = performance.now();
      const dur = 1100;
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countObs.observe(el));

  /* ---------- 9. Barras de nivel ---------- */
  const barObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.style.width = e.target.dataset.val + '%';
      obs.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  $$('.bars b').forEach((b) => barObs.observe(b));

  /* ---------- 10. Foco de luz que sigue al ratón ---------- */
  if (!REDUCED && window.matchMedia('(pointer:fine)').matches) {
    const spot = $('.spot');
    let raf = null;
    window.addEventListener('pointermove', (ev) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        spot.style.setProperty('--mx', ev.clientX + 'px');
        spot.style.setProperty('--my', ev.clientY + 'px');
        raf = null;
      });
    });

    /* Botones con ligero imán */
    $$('[data-magnet]').forEach((btn) => {
      btn.addEventListener('pointermove', (ev) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(ev.clientX - r.left - r.width / 2) * .18}px, ${(ev.clientY - r.top - r.height / 2) * .3}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- 11. Copiar correo + aviso ---------- */
  const toast = $('#toast');
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  $('#mail-btn')?.addEventListener('click', async (e) => {
    const mail = e.currentTarget.dataset.mail;
    try {
      await navigator.clipboard.writeText(mail);
      showToast('Correo copiado: ' + mail);
    } catch {
      window.location.href = 'mailto:' + mail;
    }
  });

  /* ---------- 12. Volver arriba ---------- */
  $('#totop')?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' })
  );
})();