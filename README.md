# mi--web · marca personal de Borja (1º DAM · IES Simarro)

Web de una sola página hecha con HTML, CSS y JavaScript a mano, sin frameworks.
**En directo:** https://borja400.github.io/mi--web/

## Secciones
Hero con mi nombre · Sobre mí · Lo que he hecho · Me gusta · Hacia dónde · Contacto.

## Árbol de ficheros
mi--web/
├── index.html    estructura de la página
├── styles.css    estilos y diseño responsive
├── main.js       interacciones
├── favicon.svg   icono propio de la web
├── .nojekyll     desactiva Jekyll en GitHub Pages
├── .gitignore    secretos y basura que no se suben
└── prompts/      órdenes clave que di a la IA

## Decisiones de arquitectura
**ADR-1 · HTML, CSS y JS a mano, sin frameworks**
*Situación:* primer curso de DAM, quiero entender HTML, CSS y DOM antes de usar herramientas.
*Decisión:* sin frameworks ni librerías; colores y medidas en variables CSS.
*Consecuencia:* cero dependencias y control total; más código escrito a mano.

**ADR-2 · Publicar desde `main` y la raíz**
*Situación:* web estática que ya vive en `main`, sin paso de compilación.
*Decisión:* GitHub Pages con "Deploy from a branch" → `main` / `(root)`.
*Consecuencia:* publicar es hacer `git push`; sin ramas extra ni mover ficheros.

**ADR-3 · Paleta morada elegida entre dos diseños**
*Situación:* tenía dos diseños candidatos (morado y ámbar) en ramas distintas.
*Decisión:* probé los dos, fusioné el morado en `main` con `--no-ff` y borré el ámbar.
*Consecuencia:* cambiar el acento es una sola línea (`--green: #a855f7`); la variable sigue llamándose `--green` aunque ahora sea morada.

## Cómo se publica
GitHub Pages desde `main` en la raíz, con `.nojekyll` para servir el HTML tal cual.

## Créditos
Tipografías Syne, Public Sans y JetBrains Mono (Google Fonts).