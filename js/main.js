// Asistec EOS — interacciones de la página (sin dependencias).
// TODO: dato real — número de WhatsApp de Esteban (formato internacional, sin +).
const WHATSAPP = '593990000000';

const root = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

root.classList.replace('no-js', 'js');

/* ---- Nombre a todo el ancho ---- */
const mark = $('[data-fit]');
function fitMark() {
  if (!mark) return;
  const inner = $('.mask > span', mark);
  const probe = 200;
  mark.style.fontSize = probe + 'px';
  const w = inner.getBoundingClientRect().width;
  mark.style.fontSize = '';
  const avail = mark.clientWidth;
  if (w > 0) root.style.setProperty('--fit', (probe * avail / w * 0.995).toFixed(2) + 'px');
}
fitMark();
addEventListener('resize', fitMark);
(document.fonts?.ready ?? Promise.resolve()).then(fitMark);
requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));

/* ---- Hora de Quito ---- */
const clocks = $$('[data-clock]');
const fmt = new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Guayaquil' });
const tick = () => clocks.forEach((c) => { c.textContent = fmt.format(new Date()); });
tick();
setInterval(tick, 1000);

/* ---- Menú en teléfono ---- */
const menuBtn = $('.menu-btn');
const menu = $('#menu');
menuBtn?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Cerrar' : 'Menú';
});
menu?.addEventListener('click', (e) => {
  if (e.target.closest('a') && menu.classList.contains('open')) menuBtn.click();
});

/* ---- Entradas al hacer scroll ---- */
$$('.moment, .tile, .f-big, .f-col, .f-mark, .f-legal').forEach((el) => el.classList.add('reveal'));
// Se revisa la posición en cada scroll (sin IntersectionObserver): todo lo que ya está
// en pantalla o quedó arriba tras un salto se muestra, así nada se queda oculto.
let pending = $$('.reveal');
function revealCheck() {
  const limit = innerHeight * 0.95;
  let i = 0;
  pending = pending.filter((el) => {
    if (el.getBoundingClientRect().top > limit) return true;
    el.style.setProperty('--d', Math.min(i++, 6) * 0.075 + 's');
    el.classList.add('in');
    return false;
  });
  if (!pending.length) {
    removeEventListener('scroll', revealQueue);
    removeEventListener('resize', revealQueue);
  }
}
const revealQueue = () => revealCheck();
addEventListener('scroll', revealQueue, { passive: true });
addEventListener('resize', revealQueue);
addEventListener('load', revealCheck);
revealCheck();
$('[data-row]')?.addEventListener('scroll', revealQueue, { passive: true });

/* ---- Servicios: descripción en un punto fijo ---- */
const svcDesc = $('[data-svc-desc]');
if (svcDesc) {
  const base = svcDesc.textContent;
  $$('.svc-col a').forEach((a) => {
    const show = () => { svcDesc.textContent = a.dataset.desc; };
    const hide = () => { svcDesc.textContent = base; };
    a.addEventListener('mouseenter', show);
    a.addEventListener('focus', show);
    a.addEventListener('mouseleave', hide);
    a.addEventListener('blur', hide);
  });
}

/* ---- Proceso: fila que se arrastra ---- */
const row = $('[data-row]');
const bar = $('[data-row-bar]');
if (row) {
  const update = () => {
    const max = row.scrollWidth - row.clientWidth;
    const seen = row.clientWidth / row.scrollWidth;
    const p = max > 0 ? row.scrollLeft / max : 1;
    bar?.style.setProperty('--p', (seen + (1 - seen) * p).toFixed(3));
  };
  const step = (dir) => row.scrollBy({ left: dir * 312, behavior: reduced ? 'auto' : 'smooth' });
  row.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  $('[data-row-prev]')?.addEventListener('click', () => step(-1));
  $('[data-row-next]')?.addEventListener('click', () => step(1));
  update();

  let drag = null;
  row.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    drag = { x: e.clientX, left: row.scrollLeft };
    row.style.scrollSnapType = 'none';
    row.style.cursor = 'grabbing';
  });
  addEventListener('pointermove', (e) => { if (drag) row.scrollLeft = drag.left - (e.clientX - drag.x); });
  addEventListener('pointerup', () => {
    if (!drag) return;
    drag = null;
    row.style.scrollSnapType = '';
    row.style.cursor = '';
  });
  row.addEventListener('dragstart', (e) => e.preventDefault());
}

/* ---- Archivo: visor de fotos (la página del taller no lo usa; queda para la de fotografía) ---- */
const box = $('[data-box]');
const tiles = $$('.tile');
if (box && tiles.length && typeof box.showModal === 'function') {
  const img = $('[data-box-img]', box);
  const title = $('[data-box-title]', box);
  const count = $('[data-box-count]', box);
  let at = 0;
  const show = (i) => {
    at = (i + tiles.length) % tiles.length;
    const t = tiles[at];
    const thumb = $('img', t);
    img.src = t.getAttribute('href');
    img.alt = thumb.alt;
    img.width = thumb.width;
    img.height = thumb.height;
    title.textContent = `${t.dataset.title}, ${t.dataset.year}`;
    count.textContent = `· ${at + 1} de ${tiles.length}`;
  };
  tiles.forEach((t, i) => t.addEventListener('click', (e) => {
    e.preventDefault();
    show(i);
    box.showModal();
  }));
  $('[data-box-prev]', box).addEventListener('click', () => show(at - 1));
  $('[data-box-next]', box).addEventListener('click', () => show(at + 1));
  $('[data-box-close]', box).addEventListener('click', () => box.close());
  box.addEventListener('close', () => tiles[at]?.focus());
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(at - 1);
    if (e.key === 'ArrowRight') show(at + 1);
  });
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
}

/* ---- Contacto: arma el mensaje y abre WhatsApp (no se guarda nada) ---- */
const form = $('[data-wa-form]');
if (form) {
  const error = $('[data-wa-error]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (data.get('sitio')) return; // honeypot
    const equipo = String(data.get('equipo') || '').trim().slice(0, 60);
    const falla = String(data.get('falla') || '').replace(/\s+/g, ' ').trim().slice(0, 160);
    if (!equipo || falla.length < 3) {
      error.hidden = false;
      (equipo ? form.elements.falla : form.elements.equipo).focus();
      return;
    }
    error.hidden = true;
    const text = `Hola Esteban, escribo desde la web de Asistec EOS.\nEquipo: ${equipo}\nQué le pasa: ${falla}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });
}

/* ---- Hero: progreso del scroll, textos y lente 3D ---- */
const hero = $('[data-hero]');
const line = $('[data-stage-line]');
const stageLines = line ? [
  line.textContent,
  'Cada equipo se abre pieza por pieza: óptica, diafragma, enfoque y montura.',
  'Y vuelve a armarse limpio, calibrado y probado antes de regresar a tus manos.',
] : [];
let progress = 0;
let stage = 0;
function onScroll() {
  if (!hero) return;
  const span = hero.offsetHeight - innerHeight;
  progress = span > 0 ? clamp(-hero.getBoundingClientRect().top / span) : 0;
  root.style.setProperty('--parts', (clamp((progress - 0.38) / 0.14) * (1 - clamp((progress - 0.72) / 0.1))).toFixed(3));
  const next = progress < 0.14 ? 0 : progress < 0.74 ? 1 : 2;
  if (next !== stage && line) {
    stage = next;
    line.textContent = stageLines[stage];
    line.classList.remove('swap');
    void line.offsetWidth;
    line.classList.add('swap');
  }
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

const canvas = $('[data-lens]');
if (canvas && hero) {
  const start = async () => {
    try {
      const { initLens } = await import('./hero3d.js');
      initLens(canvas, { getProgress: () => progress, reduced, onReady: () => root.classList.add('lens-on') });
    } catch (err) {
      root.classList.add('no-webgl');
    }
  };
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}
