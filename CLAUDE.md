# Asistec EOS — landing de Esteban Negrete

Proyecto de un cliente de la agencia. Aplican las reglas generales de `../CLAUDE.md` (estándares, ley ecuatoriana, seguridad, portafolio); este archivo manda en lo específico.

## El cliente

- **Esteban Negrete**, emprendedor de Quito. Repara cámaras y lentes **sin local físico** (retira y entrega a domicilio) y además es **fotógrafo**.
- **Nombre comercial "Asistec EOS": sin confirmar.** Se tomó del nombre de la carpeta. "EOS" es marca de Canon; conviene que Esteban lo tenga presente.
- La página es una **demo para mostrársela a Esteban**. Todavía no hay datos reales del negocio.

## Dónde está todo

| Qué | Dónde |
|---|---|
| Sitio publicado | https://asistec-eos.vercel.app (proyecto `asistec-eos` en Vercel) |
| Repositorio (público) | https://github.com/Negret-ez/landing-asistec-eos — rama `master` |
| Vista previa local | `npx serve -l 4173 .` → http://localhost:4173 (configurado en `.claude/launch.json` como `asistec`) |

- GitHub **no** está conectado a Vercel: un push no despliega. Se publica con `npx vercel deploy --prod --yes < /dev/null` (la CLI ya tiene sesión; sin `< /dev/null` se queda esperando).
- Los commits usan el correo `noreply` de GitHub (configurado solo en este repo) para no exponer el correo personal. Mensajes de commit en español.

## Cómo trabajar con Joel en este proyecto

- **Push a GitHub después de cada cambio** (autorización permanente).
- **Publicar en Vercel solo cuando él lo confirme.** El flujo que ha funcionado: hacer el cambio, mostrarlo en local, preguntar, y desplegar con su "sí".
- Sus pedidos son visuales y directos ("no me convence", "está muy negro", "muy sobrio"). Espera que se resuelva con criterio de diseño sin romper lo que ya hay, y que se le explique en simple qué cambió.
- Joel revisa en una pantalla de **1920 px** de ancho: comprobar ahí además de 1440 y móvil.

## Qué pidió y cómo se resolvió

1. **Inicio en 3D**, inspirado en monolithstudio.com: nombre gigante a todo el ancho sobre un objeto 3D. Aquí es un **lente construido por código** con three.js que se desarma al hacer scroll y vuelve a armarse.
2. **Galería**, inspirada en artemiilebedev.com/archive: mosaico disperso con huecos, tarjeta fija arriba a la izquierda, título + año sobre cada foto, las demás se desenfocan al pasar el cursor, visor a pantalla completa.
3. Tonos oscuros, "abstracto pero no tanto", y todo lo que necesita un sitio para publicarse.
4. Ajustes posteriores, todos ya aplicados y publicados:
   - Pie de página rehecho: sin recuadros ni botón ámbar; columnas de texto y el nombre a todo el ancho.
   - "Muy negra": bandas claras en Sobre, Servicios y Preguntas.
   - Sobre y Servicios "muy sobrios": se añadieron imágenes, líneas divisorias y títulos más grandes.
   - Huecos negros del archivo: fondo fijo con un primer plano del lente 3D.

## Diseño

- **Paleta** (tokens en `css/styles.css`): fondo `#0b0c0c`, tinta `#e9e9e6`, gris `#a3a59f`, acento ámbar `#f5a623` (la escala en pies grabada en los lentes). Un solo acento.
- **Bandas claras**: clase `.light` en una sección invierte los tokens (fondo `#e9e9e6`, tinta negra). No se usa blanco puro.
- **Tipografía**: Switzer (Fontshare), pesos 400 y 500. Cinco tamaños: `--small`, `--body`, `--lead`, `--head` y el nombre gigante (`--fit`, calculado en JS para ocupar el ancho).
- **Orden y fondo de las secciones**: Hero (negro) → Sobre (claro) → Servicios (claro) → Proceso (negro) → Archivo (negro con lente de fondo) → Preguntas (claro) → Contacto (ámbar) → Pie (negro).
- Botones cuadrados y planos; sin degradados, sombras ni monoespaciada.
- **Líneas finas**: Joel las pidió en Sobre y Servicios. Van en contra de la regla del skill de diseño, pero se quedan (marcadas con `taste-skill-ignore`).
- Se construyó con el skill `design-taste-frontend` (dirección "contact-sheet", semilla 382549982). Su inspector se corre con `node <skill>/scripts/inspect.mjs http://localhost:4173/`.

## Archivos

- `index.html` — toda la página. `privacidad.html` — política de privacidad (borrador).
- `css/styles.css` — estilos; los cortes responsive son 1000 px (tablet) y 700 px (teléfono).
- `js/main.js` — nombre a todo el ancho, reloj de Quito, menú móvil, aparición al hacer scroll, servicios, fila de proceso, visor de fotos, formulario de WhatsApp, progreso del hero. El número de WhatsApp está en la constante `WHATSAPP` y también en los enlaces del HTML.
- `js/hero3d.js` — el lente 3D. Se carga con `import()` después de `load`. Acepta una opción `pose` para encuadre fijo (se usó para generar imágenes).
- `vendor/three.module.min.js` — three.js r170, servido desde el propio sitio.
- `assets/img/g/01–24.webp` (archivo), `assets/img/p/1–6.webp` (proceso), `assets/img/archive-bg.webp` (fondo del archivo), `assets/og.png` (imagen para compartir; también es la foto de la columna Lentes).
- `vercel.json` — cabeceras de seguridad. La CSP no permite scripts ni estilos en línea: **no usar atributos `style` ni `<script>` en línea** en el HTML.

## Datos de muestra que hay que reemplazar

Buscar `TODO: dato real` en el proyecto. Nada de esto es real todavía:

- WhatsApp y teléfono `+593 99 000 0000` (el botón escribe a un número que no es de Esteban), Instagram, RUC `0000000000001`, horario "lunes a sábado, 09:00 a 18:00".
- Lista de servicios, equipos y marcas, sectores de cobertura.
- Respuestas de Preguntas: afirman garantía por escrito, pago contra entrega, plazos y cobertura en los valles. Esteban debe confirmarlas.
- **Fotos**: las 24 del archivo y las 6 del proceso son de picsum.photos (licencia Unsplash). La foto de Sobre debería ser un retrato de Esteban o su banco de trabajo. La tarjeta del archivo dice a la vista "Fotos de muestra".
- Política de privacidad: borrador, falta el responsable y validarla con un abogado.
- Dominio: `asistec-eos.vercel.app` aparece en canonical, Open Graph y JSON-LD.

Mientras haya datos de muestra, el sitio lleva `noindex` en `index.html` y `Disallow: /` en `robots.txt`. **Quitar ambos cuando los datos sean reales y Esteban apruebe.**

## Pendientes y cosas sin comprobar

- **Revisar en un celular real.** El inspector marca un "hueco en blanco" en móvil a la altura de Preguntas; al medir la página el contenido está en su sitio, pero no se confirmó con una captura real.
- La aparición del contenido al hacer scroll se cambió a un chequeo por posición (`revealCheck` en `main.js`) para que nada quede oculto al saltar con el menú. No se pudo probar en el panel del navegador porque estaba oculto.
- No se ha corrido Lighthouse.
- El README del perfil de GitHub no se ha actualizado con este proyecto (Joel dijo "no por ahora").
- Vercel avisó que la cuenta no tiene verificación en dos pasos.

## Avisos prácticos

- El panel del navegador, cuando está oculto, no dispara eventos de scroll ni animaciones: las pruebas de scroll ahí dan falsos negativos. Sirve para medir posiciones y para capturas si está visible.
- Chrome sin interfaz sirve para capturas del inicio (así se generó `assets/og.png`), pero no para secciones más abajo.
- Para convertir imágenes a WebP funciona `npx sharp-cli -i entrada.png -o salida.webp -f webp -q 72`.
- picsum.photos a veces se cae (errores 521/522); reintentar más tarde. No falsificar el navegador para bajar fotos de otros bancos.
