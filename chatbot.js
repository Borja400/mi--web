/* chatbot.js — Botin, asistente de la web de Borja · árbol de reglas propio, sin API ni clave */
(() => {
  'use strict';

  // Correo público de contacto (el mismo de la sección Contacto)
  const CONTACTO = 'borhergis@alu.edu.gva.es';
  const mail = `<a href="mailto:${CONTACTO}">${CONTACTO}</a>`;

  // Respeta "reducir movimiento", como el resto de la web
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RETRASO_MS = REDUCED ? 0 : 500; // pausa corta para que se vea "escribiendo…"

  /* ==========================================================================
     EL ÁRBOL DE REGLAS: cada tema tiene palabras clave y una respuesta escrita
     por mí. El bot no genera nada: solo elige cuál de estas frases enseñar.
     ========================================================================== */

  // Regla 1 (prioridad máxima): intentos de sacarle las instrucciones o cambiarle el comportamiento
  const INYECCION = {
    claves: ['instruccion', 'ignora', 'olvida', 'prompt', 'system', 'sistema', 'reglas', 'jailbreak'],
    respuesta: `No voy a enseñar cómo funciono por dentro ni a cambiar mi comportamiento. Pregúntame por los estudios, proyectos, experiencia o contacto de Borja.`
  };

  // Regla 2: datos privados que NUNCA se dan
  const PRIVADO = {
    claves: ['direccion', 'address', 'vive', 'viv', 'telefon', 'movil', 'phone', 'dni', 'edad', 'anos',
             'cumple', 'nacimiento', 'madre', 'padre', 'mama', 'papa', 'famili', 'novi', 'hermano'],
    respuesta: `Eso no te lo puedo dar: solo comparto datos públicos de Borja. Si necesitas algo más, escríbele a ${mail}.`
  };

  // Regla 3: los temas normales (si hay empate, gana el primero de la lista)
  const RAMAS = [
    {
      tema: 'estudios',
      claves: ['estudi', 'dam', 'ciclo', 'simarro', 'clase', 'curso', 'formacion', 'instituto', 'study', 'school'],
      respuesta: `Borja estudia 1º de DAM (Desarrollo de Aplicaciones Multiplataforma) en el IES Simarro, en Xàtiva. Ahora mismo está con Java, Python, SQL, HTML, CSS, JavaScript y git.`
    },
    {
      tema: 'proyectos',
      claves: ['proyecto', 'project', 'web', 'hecho', 'portfolio', 'github', 'codigo', 'repo', 'programa'],
      respuesta: `Esta misma web está hecha a mano con HTML, CSS y JavaScript, y tiene un widget con datos reales de GitHub. Mira la sección «Lo que he hecho» y la tarjeta de GitHub de «Sobre mí».`
    },
    {
      tema: 'experiencia',
      claves: ['experiencia', 'trabaj', 'tecnico', 'colegio', 'practicas', 'profesor', 'work', 'job'],
      respuesta: `Antes del ciclo, Borja fue técnico de informática en un colegio (equipos, redes, impresoras y soporte al profesorado) y ha hecho prácticas de apoyo en el aula.`
    },
    {
      tema: 'fct',
      claves: ['fct', 'plaza', 'disponible', 'empresa', 'busca', 'contrat', 'hire'],
      respuesta: `Borja busca plaza de FCT en una empresa de desarrollo y está disponible para prácticas. Para hablarlo, escríbele a ${mail}.`
    },
    {
      tema: 'contacto',
      claves: ['contact', 'correo', 'email', 'mail', 'escrib', 'hablar', 'hablemos', 'mensaje'],
      respuesta: `Lo mejor es escribirle a ${mail} o usar la sección Contacto, al final de la web.`
    },
    {
      tema: 'gustos',
      claves: ['gusta', 'videojuego', 'juego', 'hobby', 'aficion', 'amigos', 'ocio', 'game', 'like'],
      respuesta: `A Borja le gustan los videojuegos, programar, la inteligencia artificial y salir con sus amigos.`
    },
    {
      tema: 'quien',
      claves: ['quien', 'creado', 'creador', 'botin', 'eres', 'who'],
      respuesta: `Soy Botin, el asistente de la web de Borja, alumno de 1º DAM. No soy una persona: respondo con frases que Borja ha escrito. Pregúntame por sus estudios, proyectos, experiencia o contacto.`
    },
    {
      tema: 'saludo',
      claves: ['hola', 'buenas', 'hi', 'hello', 'hey'],
      respuesta: `¡Hola! Soy Botin, el asistente de Borja. Pregúntame por sus estudios, proyectos, experiencia o cómo contactarle.`
    }
  ];

  // Si nada coincide: no inventa, remite al contacto
  const DEFECTO = `Eso no lo sé y prefiero no inventármelo. Puedes escribirle a Borja a ${mail} o preguntarme por sus estudios, proyectos, experiencia o gustos.`;

  /* ==========================================================================
     LA LÓGICA: normalizar texto -> contar coincidencias -> elegir respuesta
     ========================================================================== */

  // Minúsculas y sin tildes, para que "Qué" y "que" cuenten igual
  const normalizar = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Cuántas palabras de la pregunta empiezan por alguna de las claves
  const puntos = (palabras, claves) =>
    palabras.filter((w) => claves.some((k) => w.startsWith(k))).length;

  // Devuelve la respuesta (HTML escrito por mí) para una pregunta
  const responder = (pregunta) => {
    const palabras = normalizar(pregunta).split(/[^a-z0-9]+/).filter(Boolean);
    if (puntos(palabras, INYECCION.claves) > 0) return INYECCION.respuesta;
    if (puntos(palabras, PRIVADO.claves) > 0) return PRIVADO.respuesta;
    let mejor = null, max = 0;
    RAMAS.forEach((r) => {
      const p = puntos(palabras, r.claves);
      if (p > max) { max = p; mejor = r; }
    });
    return mejor ? mejor.respuesta : DEFECTO;
  };

  /* ==========================================================================
     LA INTERFAZ: burbuja, panel y mensajes
     ========================================================================== */

  // (1) CSS del chat, inyectado desde aquí; usa las variables de tu marca (no toca styles.css)
  const css = document.createElement('style');
  css.textContent = `
  .bot-fab{position:fixed;right:18px;bottom:18px;z-index:40;width:56px;height:56px;border-radius:50%;border:1px solid var(--green);background:var(--panel);color:var(--green);font-size:1.4rem;cursor:pointer;display:grid;place-items:center}
  .bot-fab:hover,.bot-fab:focus-visible{background:var(--green);color:#04140b;outline:none}
  .bot-panel{position:fixed;right:18px;bottom:84px;z-index:40;width:min(360px,calc(100vw - 36px));height:min(460px,70vh);display:none;flex-direction:column;background:var(--panel);border:1px solid var(--line-2);border-radius:var(--r);overflow:hidden}
  .bot-panel.open{display:flex}
  .bot-head{padding:.7rem .9rem;background:var(--panel-2);border-bottom:1px solid var(--line);font-family:var(--mono);font-size:.74rem;letter-spacing:.06em;color:var(--green)}
  .bot-log{flex:1;overflow-y:auto;padding:.9rem;display:flex;flex-direction:column;gap:.6rem}
  .bot-msg{max-width:85%;padding:.55rem .8rem;border-radius:12px;font-size:.9rem;line-height:1.4;white-space:pre-wrap;word-break:break-word}
  .bot-msg a{color:var(--green);text-decoration:underline}
  .bot-msg.user{align-self:flex-end;background:var(--green);color:#04140b}
  .bot-msg.bot{align-self:flex-start;background:var(--panel-2);border:1px solid var(--line);color:var(--text)}
  .bot-msg.typing{animation:botpulse 1.2s ease-in-out infinite}
  @keyframes botpulse{50%{opacity:.45}}
  .bot-quick{display:flex;flex-wrap:wrap;gap:.4rem;padding:0 .6rem .6rem}
  .bot-quick button{background:transparent;border:1px solid var(--line-2);color:var(--dim);font-family:var(--mono);font-size:.68rem;padding:.3rem .6rem;border-radius:999px;cursor:pointer}
  .bot-quick button:hover{color:var(--green);border-color:var(--green)}
  .bot-form{display:flex;gap:.5rem;padding:.6rem;border-top:1px solid var(--line)}
  .bot-in{flex:1;min-width:0;background:var(--bg);border:1px solid var(--line-2);color:var(--text);font-family:var(--body);font-size:.9rem;padding:.6rem .8rem;border-radius:10px}
  .bot-in:focus{outline:2px solid var(--green);border-color:transparent}
  .bot-send{background:var(--green);color:#04140b;border:0;border-radius:10px;padding:.6rem .9rem;font-family:var(--mono);font-size:.8rem;font-weight:700;cursor:pointer}
  .bot-send[disabled]{opacity:.6;cursor:wait}
  @media (prefers-reduced-motion:reduce){.bot-msg.typing{animation:none}}`;
  document.head.appendChild(css);

  // (2) Burbuja flotante y panel de chat
  const fab = document.createElement('button');
  fab.className = 'bot-fab'; fab.type = 'button';
  fab.setAttribute('aria-label', 'Abrir chat con Botin'); fab.textContent = '💬';

  const panel = document.createElement('section');
  panel.className = 'bot-panel'; panel.setAttribute('aria-label', 'Chat con Botin');
  panel.innerHTML = `
    <div class="bot-head">Botin · asistente de Borja</div>
    <div class="bot-log" aria-live="polite"></div>
    <div class="bot-quick">
      <button type="button">¿Qué estudias?</button>
      <button type="button">¿Qué proyectos tienes?</button>
      <button type="button">¿Cómo te contacto?</button>
    </div>
    <form class="bot-form">
      <input class="bot-in" placeholder="Escribe tu pregunta…" aria-label="Tu mensaje" maxlength="300">
      <button class="bot-send" type="submit">Enviar</button>
    </form>`;
  document.body.append(fab, panel);

  const log = panel.querySelector('.bot-log');
  const form = panel.querySelector('form');
  const inp = panel.querySelector('.bot-in');
  const send = panel.querySelector('.bot-send');

  // (3) Escapar lo que escribe el visitante para que nunca se interprete como HTML (seguridad)
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // (4) Añadir una burbuja al historial
  const add = (clases, html) => {
    const b = document.createElement('div');
    b.className = 'bot-msg ' + clases;
    b.innerHTML = html;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    return b;
  };

  // (5) Abrir/cerrar el panel (saluda solo la primera vez) y botones de pregunta rápida
  let saludado = false;
  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      if (!saludado) {
        add('bot', '¡Hola! Soy Botin, el asistente de Borja. Pregúntame por sus estudios, proyectos, experiencia o contacto.');
        saludado = true;
      }
      inp.focus();
    }
  });
  panel.querySelectorAll('.bot-quick button').forEach((b) =>
    b.addEventListener('click', () => { inp.value = b.textContent; inp.focus(); })
  );

  // (6) Enviar: pregunta -> árbol de reglas -> burbuja
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = inp.value.trim();
    if (!q) return;
    add('user', esc(q));
    inp.value = ''; send.disabled = true;
    const typing = add('bot typing', 'Botin está escribiendo…');
    setTimeout(() => {
      typing.remove();
      add('bot', responder(q));
      send.disabled = false; inp.focus();
    }, RETRASO_MS);
  });
})();