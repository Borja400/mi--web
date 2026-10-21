/* api.js — widget "Mi GitHub" · JS puro, sin librerías */
(() => {
  'use strict';

  // Respeta a quien tiene el sistema con "reducir movimiento" (como main.js)
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mi usuario de GitHub y la URL de la API pública (sin clave)
  const USUARIO = 'Borja400';
  const URL_API = `https://api.github.com/users/${USUARIO}`;

  // Recarga cada N segundos; 0 = nunca (déjalo en 0 por el límite de 60 peticiones/hora)
  const RELOAD = 0;

  // El hueco del HTML donde se pinta el widget
  const hueco = document.getElementById('mi-github');
  if (!hueco) return; // si el hueco no existe, no hace nada y no da error

  // (1) Esqueleto de carga: formas grises que parpadean mientras llega el dato
  const skeleton = () => {
    hueco.innerHTML = `<div class="gh-gh ${REDUCED ? '' : 'is-loading'}">
      <span class="gh-av"></span>
      <span class="gh-txt"><span class="gh-l1"></span><span class="gh-l2"></span></span>
    </div>`;
  };

  // (2) Si la API falla: aviso amable con enlace a mi perfil, nunca "cargando" eterno
  const error = () => {
    hueco.innerHTML = `<p class="gh-err">GitHub no responde ahora. Mira mi perfil en
      <a href="https://github.com/${USUARIO}" target="_blank" rel="noopener">github.com/${USUARIO}</a>.</p>`;
  };

  // (3) Pinta el dato: saco login, avatar_url, public_repos y followers del JSON
  const render = (d) => {
    hueco.innerHTML = `
      <a class="gh-gh" href="https://github.com/${USUARIO}" target="_blank" rel="noopener">
        <img class="gh-av" src="${d.avatar_url}" alt="Avatar de ${d.login}" width="56" height="56" loading="lazy">
        <span class="gh-txt"><b>${d.login}</b>
          <span>${d.public_repos} repositorios públicos · ${d.followers} seguidores</span>
        </span>
      </a>`;
  };

  // (4) Petición completa: esqueleto → fetch → si va bien pinta, si falla muestra el error
  const cargar = async () => {
    skeleton();
    try {
      const res = await fetch(URL_API, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw new Error('HTTP ' + res.status); // 403, 404... cuentan como fallo
      render(await res.json());
    } catch {
      error();
    }
  };

  cargar();

  // (5) Recarga automática opcional
  if (RELOAD > 0 && !REDUCED) setInterval(cargar, RELOAD * 1000);
})();