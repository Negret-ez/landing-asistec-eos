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
$$('.chap, .f-big, .f-col, .f-mark, .f-legal').forEach((el) => el.classList.add('reveal'));
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

/* ---- Fallas: vitrina con el lente 3D ---- */
// TODO: dato real — textos de muestra; confirmar con Esteban.
// Cada falla lleva sus dos líneas de título, una frase, el mensaje de WhatsApp y la postura del lente:
// rx/ry giro, s tamaño, y altura, e cuánto se desarma (0 a 1), ap apertura del diafragma.
const FAULTS = {
  hongos: { l1: 'Hongos', l2: 'en el cristal', blurb: 'Manchas como telarañas dentro del vidrio. El clima de Quito las adora.', wa: 'Hola Esteban, mi lente tiene hongos.', pose: { rx: 0.14, ry: -0.5, s: 1.15, y: 0.3, e: 0.16, ap: 0.5 } },
  enfoque: { l1: 'Enfoque', l2: 'que no llega', blurb: 'Enfoca delante, detrás o no enfoca. Se calibra con tu cámara puesta.', wa: 'Hola Esteban, mi lente no enfoca bien.', pose: { rx: 0.2, ry: -1.05, s: 0.95, y: 0.3, e: 0.38, ap: 0.36 } },
  diafragma: { l1: 'Diafragma', l2: 'trabado', blurb: 'Láminas con aceite, fotos quemadas. Se desarma, se limpia y vuelve a cerrar.', wa: 'Hola Esteban, el diafragma de mi lente está trabado.', pose: { rx: 0.06, ry: -0.2, s: 1.2, y: 0.3, e: 0, ap: 0.1 } },
  sensor: { l1: 'Sensor', l2: 'con manchas', blurb: 'Puntos grises en cada cielo. Limpieza en húmedo, revisada con lupa.', wa: 'Hola Esteban, necesito una limpieza de sensor.', pose: { rx: -0.1, ry: 2.55, s: 1.15, y: 0.3, e: 0.14, ap: 0.4 } },
  obturador: { l1: 'Obturador', l2: 'cansado', blurb: 'Franjas negras o un error al disparar. Miles de disparos pasan factura.', wa: 'Hola Esteban, mi cámara tiene un problema de obturador.', pose: { rx: 0.2, ry: -1.3, s: 1, y: 0.3, e: 1, ap: 0.3 } },
  golpes: { l1: 'Golpes', l2: 'y caídas', blurb: 'Una caída, una bayoneta doblada. Se endereza lo que se puede y se cambia lo que no.', wa: 'Hola Esteban, mi equipo se golpeó.', pose: { rx: -0.22, ry: 3.75, s: 0.95, y: 0.3, e: 0.42, ap: 0.3 } },
};
const faults = $('[data-faults]');
let faultPose = FAULTS.hongos.pose;
let faultLens = null;
if (faults) {
  const pills = $$('[data-fault]', faults);
  const title = $('.st-title', faults);
  const blurb = $('[data-f-blurb]', faults);
  const replay = (el) => { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); };
  const pick = (btn) => {
    const f = FAULTS[btn.dataset.fault];
    if (!f || btn.getAttribute('aria-pressed') === 'true') return;
    pills.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    $('[data-f-l1]', faults).textContent = f.l1;
    $('[data-f-l2]', faults).textContent = f.l2;
    $('[data-f-num]', faults).textContent = pills.indexOf(btn) + 1;
    blurb.textContent = f.blurb;
    $('[data-f-go]', faults).href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(f.wa)}`;
    faultPose = f.pose;
    replay(title);
    replay(blurb);
    if (reduced) faultLens?.refresh();
  };
  pills.forEach((b) => b.addEventListener('click', () => pick(b)));
  // Enlace directo a una falla: /?falla=sensor#fallas
  const wanted = new URLSearchParams(location.search).get('falla');
  const first = pills.find((b) => b.dataset.fault === wanted);
  if (first) pick(first);
}

/* ---- Botón flotante: visible entre el inicio y el contacto ---- */
const float = $('[data-float]');
const contact = $('#contacto');
function floatCheck() {
  const heroEl = $('[data-hero]');
  if (!float || !heroEl || !contact) return;
  const past = heroEl.getBoundingClientRect().bottom < innerHeight * 0.5;
  const near = contact.getBoundingClientRect().top < innerHeight * 0.75;
  float.classList.toggle('on', past && !near);
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
const onMove = () => { onScroll(); floatCheck(); };
addEventListener('scroll', onMove, { passive: true });
addEventListener('resize', onMove);
onMove();

const canvas = $('[data-lens]');
if (canvas && hero) {
  const start = async () => {
    try {
      const { initLens } = await import('./hero3d.js');
      initLens(canvas, { getProgress: () => progress, reduced, onReady: () => root.classList.add('lens-on') });
      const fc = $('[data-fault-lens]');
      if (fc) faultLens = initLens(fc, { getPose: () => faultPose, reduced, onReady: () => root.classList.add('faults-on') });
    } catch (err) {
      root.classList.add('no-webgl');
    }
  };
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}
