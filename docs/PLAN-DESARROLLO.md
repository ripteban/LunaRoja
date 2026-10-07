# Luna Roja: plan de desarrollo web

> Plan para pasar el diseño de Figma ([Luna Roja](https://www.figma.com/design/HGL6ey7HrhDm4XqJp2GSsM/Luna-Roja)) a un sitio en producción, **mobile-first**, rápido y con un sistema sencillo para agregar modelos.
> Todo lo de este documento sale de leer el archivo con el MCP de Figma (Dev Mode): estructura de páginas, IDs de nodos, variables, estilos de texto y capturas.

---

## 0. Resumen

| Tema | Decisión |
|---|---|
| Framework | **Astro** (salida estática) + **React** en "islas" para todo lo interactivo |
| Lenguaje | TypeScript estricto |
| Estilos | **Tailwind CSS v4**, con los tokens de Figma en `@theme` |
| Micro-animaciones | **CSS primero** (transform/opacity) + **Motion** (`motion/react`, con `LazyMotion`) en las islas + **View Transitions** entre páginas |
| Carruseles / swipe | **Embla Carousel** (pesa poco y está pensado para táctil) |
| Estado de la reserva | **nanostores** + `@nanostores/persistent` (se comparte entre islas y páginas) |
| Fechas | `date-fns` + `@date-fns/tz` (zona `America/El_Salvador`) |
| Modelos (contenido) | **Content Collections** de Astro: una carpeta por modelo, validada con Zod |
| Panel para agregar modelos (fase 2) | **Sveltia CMS** (compatible con Decap): panel `/admin` basado en Git, sin backend |
| Calidad | ESLint, Prettier (con plugin de Tailwind), Playwright (e2e + capturas comparadas con Figma), Lighthouse CI |
| Deploy | `dist/` estático, así que corre en cualquier hosting o VPS (ver §11 sobre la política de uso del proveedor) |

### ¿Por qué Astro + React y no solo React (Vite) o Next.js?

- **Velocidad en móvil.** El 80 % del sitio es contenido (home, perfiles, FAQ). Astro lo entrega como HTML ya renderizado **sin JavaScript**, y solo hidrata con React lo que se toca: carrusel, calendario, horarios, pago, aviso +18. En un Android de gama media eso se traduce en mejor LCP e INP que una SPA.
- **Sigues escribiendo React.** Todos los componentes interactivos son `.tsx` normales. Los `.astro` son básicamente JSX sin estado para el maquetado.
- **Agregar modelos es crear una carpeta.** Las Content Collections validan cada modelo con un esquema (por ejemplo, edad ≥ 18 o tarifas obligatorias) y el build falla si falta algo.
- **Imágenes optimizadas al compilar.** Las fotos originales (3072×4096) se convierten solas a AVIF/WebP en varios tamaños con `srcset`, sin depender de un servicio de pago.
- **Portabilidad.** La salida es estática, así que no te amarra a Vercel ni a otro proveedor. Esto importa por el tipo de negocio (§11).

> Alternativa si prefieres un framework "100 % React": **Next.js (App Router) con SSG**. Se puede, pero pierdes la optimización de imágenes al usar `output: 'export'` y mandas más JS al cliente. Mi recomendación es Astro.

---

## 1. Inventario del Figma (extraído vía MCP)

Archivo `HGL6ey7HrhDm4XqJp2GSsM`, con tres páginas:

| Página | ID | Uso |
|---|---|---|
| **Luna Roja Branding** | `0:1` | **Diseño final**: todas las pantallas desktop (1920) y mobile (412) |
| Luna Roja — Recreación | `275:244` | Variante tipo wireframe del perfil (pestañas, barra inferior fija en móvil) |
| 02 · Componentes | `364:245` | Librería de componentes de reserva con sus estados |

### 1.1 Pantallas (página `0:1`)

| Pantalla | Desktop (1920) | Mobile (412) | Ruta en el sitio |
|---|---|---|---|
| Aviso +18 | `320:298` | `320:423` | Modal la primera vez que se entra (no es una ruta) |
| Home | `6:2` | `151:328` | `/` |
| Perfil | `299:412` | `514:1544` | `/modelos/[slug]` |
| Disponibilidad | `384:1645` | `518:439` | `/modelos/[slug]/disponibilidad` |
| Pagar | `503:1058` | `522:1008` | `/modelos/[slug]/pagar` |

### 1.2 Secciones de la Home

| Sección | Desktop | Mobile |
|---|---|---|
| Navbar (logo + "Consultas" WhatsApp) | `122:682` | `245:884` |
| Hero (luna, silueta, título SVG "Luna Roja", CTA) | `67:152` | `151:329` (+ CTA `195:464`) |
| Así de fácil (3 pasos) | `238:320` | título `514:2343`, pasos `195:471` |
| Alcance actual (banner con mapa) | `122:683` | `245:491` |
| Título "Modelos Disponibles" + ubicación | `480:718` | `245:534` |
| Grid de tarjetas de modelos | `95:125` | `514:2151` (6 tarjetas apiladas) |
| Atención personalizada | `238:327` | `250:990` |
| Preguntas frecuentes | `225:729` | `256:273` |
| ¿Tienes alguna consulta? (CTA WhatsApp) | `238:326` | `256:290` |
| Cierre (logo sobre nubes) | `225:733` | `256:305` |

### 1.3 Perfil, Disponibilidad y Pagar

| Bloque | Desktop | Mobile |
|---|---|---|
| Perfil: contenido | `299:804` (carrusel `495:895`, info `299:817`) | `514:1544` |
| Perfil: componente carrusel (estados 1–3) | `486:443` | — |
| Disponibilidad: título | `384:2329` | — |
| Disponibilidad: tarjeta modelo | `514:1503` (componente `514:1410`) | — |
| Disponibilidad: duración, modalidad, calendario y horas | `384:2344` | — |
| Disponibilidad: resumen "Tu selección" | `396:499` | — |
| Pagar: Efectivo / Tarjeta / Transferencia | `503:1124` / `503:1362` / `509:1372` | — |
| Pagar: resumen + confirmar por WhatsApp | `560:498` | — |

### 1.4 Componentes de marca (página `0:1`)

| Componente | ID |
|---|---|
| Logo (símbolo + wordmark) | `151:326` → `151:325` |
| Silueta mujer (vector) | `63:9` → `63:8` |
| Avatar logo (máscara circular) | `544:515` |
| Product-card (`desactive` / `active`) | `95:327` → `95:326` / `95:328` |
| Product-card 2 (estados 1–3, tarjeta de Disponibilidad) | `514:1410` |
| Fotos de modelos (Alala/Alana, Sirse, Sharlott, Aurora, Elizz, Danna; 3 cada una) | `523:1339`, `478:586`, `478:597`, `523:1337`, `478:594`, `525:1342`, … |

### 1.5 Librería "02 · Componentes" (página `364:245`)

Cada componente pasa a ser un componente React con una prop `state` que coincide con la variante de Figma:

| Figma | ID | Estados | Componente en código |
|---|---|---|---|
| Booking/Button | `365:252` | primary, disabled, secondary, link | `<Button variant>` |
| Booking/Calendar day | `365:263` | default, today, selected, disabled, outside | `<CalendarDay state>` |
| Booking/Timeslot | `365:282` | available, selected, occupied, rest, past, unavailable | `<TimeSlot state>` |
| Booking/Current status | `365:303` | available, rest, empty, inactive | `<StatusBadge state>` |
| Booking/Summary state | `365:310` | valid, missing, inactive | `<SummaryState state>` |
| Booking/Top navigation | `367:244` | — | `<Navbar>` |
| Booking/Progress step | `367:305` | complete, active, pending | `<ProgressStep state>` |
| Booking/Profile compact | `367:306` | — | `<ProfileCompact>` |
| Booking/Service option | `367:323` | — | `<ServiceOption>` |
| Booking/Summary row | `367:332` | — | `<SummaryRow>` |
| Booking/Timeslot legend | `367:335` | — | `<TimeSlotLegend>` |
| Booking/Agenda empty | `367:355` | empty, inactive | `<AgendaEmpty state>` |
| Booking/Availability notice | `367:356` | — | `<AvailabilityNotice>` |

---

## 2. Design tokens (variables reales del Figma)

Extraídos con `get_variable_defs` y `get_design_context`:

**Colores**

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#080711` | Fondo general (Hero) |
| `surface` | `#1b161d` | Paneles de reserva |
| `surface-raised` | `#251e25` | Botones de horario, chips |
| `soft-border` | `#777088` | Bordes suaves |
| `muted` | `#aba7bb` | Texto secundario, botón deshabilitado |
| `white` (`--lr-white`) | `#f6f5f5` | Texto principal |
| `red` (`--lr-red`) | `#ff3348` | Acento, CTA |
| `rim` (`--lr-rim`) | `#a72437` | CTA deshabilitado, bordes |
| `mint` | `#75eec0` | Punto "Disponible" |
| `amber` | `#ffb048` | Estado "Descanso" |
| Gradiente CTA | `#ff5e62` → `#ff0006` (a 142.74 %) | Botones "Ver perfil", "Modelos disponibles", chips |
| Glow | `inset 0 0 21.1px #ff383c` | Brillo rojo interno de tarjetas y botones |

**Tipografía** (todas en Google Fonts; se autohospedan con Fontsource)

| Familia | Uso | Pesos |
|---|---|---|
| **Playfair Display** | Títulos ("Modelos Disponibles", "Alana", "Atención Personalizada") | 400 |
| **Poppins** | UI y cuerpo | 400, 500, 600 |
| **Kapakana** | Títulos en script ("Efectivo", "Tarjeta", "Transferencia") | 400 |

Estilos de texto definidos en Figma: `Booking/H3` Playfair 23/26.45 · `Booking/Body Medium` Poppins 500 16/22.4 · `Booking/Small` Poppins 13/18.2 · `Booking/Label` Poppins 500 12/15.6 · `Booking/Button` Poppins 500 15/18.

> "Luna Roja" (hero y cierre) y "Alcance Actual" **no son texto**: son vectores o imágenes en Figma. Se exportan como SVG/imagen para conservar el acabado.

**`src/styles/global.css` (Tailwind v4)**

```css
@import "tailwindcss";

@theme {
  --color-bg: #080711;
  --color-surface: #1b161d;
  --color-surface-raised: #251e25;
  --color-soft-border: #777088;
  --color-muted: #aba7bb;
  --color-ink: #f6f5f5;
  --color-red: #ff3348;
  --color-rim: #a72437;
  --color-mint: #75eec0;
  --color-amber: #ffb048;
  --color-grad-from: #ff5e62;
  --color-grad-to: #ff0006;
  --color-glow: #ff383c;

  --font-display: "Playfair Display", ui-serif, Georgia, serif;
  --font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;
  --font-script: "Kapakana", cursive;

  --shadow-glow: inset 0 0 21px 0 var(--color-glow);
  --shadow-chip: inset 0 -4px 4px rgb(255 255 255 / .25), inset 0 4px 4px rgb(255 255 255 / .25), inset 0 0 21px var(--color-glow);
  --shadow-card: 0 25px 126px rgb(72 72 72 / .28);

  --ease-out-soft: cubic-bezier(.22, 1, .36, 1);
  --ease-spring: cubic-bezier(.34, 1.56, .64, 1);

  /* Tipografía fluida 412 → 1920: valores a ajustar con get_design_context */
  --text-hero-sub: clamp(1rem, .8rem + .9vw, 2.18rem);
  --text-h2: clamp(2rem, 1.4rem + 2.6vw, 4.5rem);
}

@utility bg-cta {
  background-image: linear-gradient(to top, var(--color-grad-from), var(--color-grad-to) 142.74%);
}
```

---

## 3. Arquitectura del proyecto

```
LunaRoja/
├─ public/                     favicon, og-image, robots.txt
├─ docs/                       este plan + figma-map.md (nodo → componente)
├─ scripts/
│  └─ nueva-modelo.ts          genera la carpeta de una modelo nueva desde una plantilla
├─ src/
│  ├─ assets/
│  │  ├─ brand/                logo.svg, logo-mark.svg, titulo-luna-roja.svg, silueta.svg
│  │  ├─ backgrounds/          luna-nubes (desktop/mobile), estrellas, nubes-cierre
│  │  ├─ illustrations/        alcance-actual, billetes, tarjetas, bancos, candado-reloj
│  │  ├─ map/                  el-salvador.svg (un <path id> por departamento)
│  │  └─ icons/                SVG fuente (person, height, pin, globe, chat, whatsapp, …)
│  ├─ components/
│  │  ├─ ui/                   Button, Chip, Badge, StatusDot, SectionTitle, Divider, GlassPanel, Icon
│  │  ├─ layout/               Navbar.astro, Cierre.astro, CosmicBackground.astro, BottomBar.tsx
│  │  ├─ home/                 Hero, Pasos, AlcanceActual, ModelGrid, ModelCard, Atencion, Faq, ContactoCta
│  │  ├─ perfil/               PhotoCarousel.tsx, StatusBadge.tsx, ProfileStats, PriceTag, CoverageMap
│  │  ├─ booking/              BookingFlow.tsx, DurationPicker, ModalityPicker, Calendar, TimeSlots,
│  │  │                        TimeSlotLegend, Summary, SummaryRow, ProgressStep
│  │  ├─ pago/                 PaymentMethods.tsx, PaymentCard, ConfirmWhatsApp
│  │  └─ AgeGate.tsx
│  ├─ content/
│  │  ├─ modelos/<slug>/index.md + fotos/   ← AQUÍ SE AGREGAN MODELOS
│  │  └─ faq/*.md
│  ├─ content.config.ts        esquemas Zod de modelos y FAQ
│  ├─ config/site.ts           WhatsApp, ciudad, métodos de pago activos, textos legales
│  ├─ lib/
│  │  ├─ booking-store.ts      nanostores de la reserva (persistente en sessionStorage)
│  │  ├─ availability.ts       genera horarios y estados (zona America/El_Salvador)
│  │  ├─ status.ts             estado actual de la modelo, calculado en el cliente
│  │  ├─ whatsapp.ts           arma el mensaje y el link wa.me
│  │  └─ format.ts             precios, fechas en español, "07:00 p.m."
│  ├─ layouts/BaseLayout.astro head, fuentes, meta, AgeGate, View Transitions
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ modelos/[slug]/index.astro
│  │  ├─ modelos/[slug]/disponibilidad.astro
│  │  ├─ modelos/[slug]/pagar.astro
│  │  └─ 404.astro
│  └─ styles/global.css
└─ tests/  e2e/  visual/
```

**Regla de islas** (para mantener el JS al mínimo):

| Componente | Hidratación |
|---|---|
| `AgeGate` | `client:load` (debe aparecer al instante) |
| `PhotoCarousel` (perfil y tarjeta) | `client:visible` |
| `BookingFlow` | `client:load` (es la página entera) |
| `PaymentMethods` | `client:load` |
| `StatusBadge` | `client:idle` (calcula "Disponible/Descanso" con la hora real) |
| `BottomBar` (CTA fijo en móvil) | `client:idle` |
| FAQ, navbar, tarjetas, secciones | **Sin JS** (`<details>` + CSS para el acordeón) |

---

## 4. Sistema para agregar modelos (punto clave)

### 4.1 Una carpeta por modelo

```
src/content/modelos/alana/
├─ index.md
└─ fotos/
   ├─ 01.jpg   ← portada (tarjeta y primera foto del perfil)
   ├─ 02.jpg
   └─ 03.jpg
```

**`index.md`**

```yaml
---
nombre: Alana
estado: activa            # activa | inactiva (inactiva = no sale en el listado)
orden: 1                  # posición en el grid
destacada: true
frase: "Soy una persona alegre y dinámica, te encantarán mis servicios."
edad: 26
estatura: 170             # cm
tatuajes: true
idiomas: [Español]
cobertura: [san-salvador] # ids de departamentos del mapa
modalidades: [domicilio, presencial]
tarifas:
  - { horas: 1, precio: 100 }
  - { horas: 2, precio: 190 }
  - { horas: 3, precio: 270 }
  - { horas: 4, precio: 340 }
incluye: "Información por completar"
fotos: [./fotos/01.jpg, ./fotos/02.jpg, ./fotos/03.jpg]
horario:                  # disponibilidad semanal, hora de El Salvador
  lun: ["18:00-04:00"]
  mar: ["18:00-04:00"]
  mie: []
  jue: ["18:00-04:00"]
  vie: ["18:00-04:00"]
  sab: ["16:00-04:00"]
  dom: []
bloqueos: ["2026-10-24"]  # días sin agenda
ocupados: []              # ["2026-10-02T19:00"] horarios ya reservados
---
Texto largo opcional de "Sobre ella".
```

### 4.2 Esquema (`src/content.config.ts`)

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const rango = z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/);

const modelos = defineCollection({
  loader: glob({ pattern: "*/index.md", base: "./src/content/modelos" }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      estado: z.enum(["activa", "inactiva"]).default("activa"),
      orden: z.number().default(99),
      destacada: z.boolean().default(false),
      frase: z.string().max(120),
      edad: z.number().int().min(18, "Solo mayores de 18 años"),
      estatura: z.number().optional(),
      tatuajes: z.boolean().optional(),
      idiomas: z.array(z.string()).default(["Español"]),
      cobertura: z.array(z.string()).min(1),
      modalidades: z.array(z.enum(["domicilio", "presencial"])).min(1),
      tarifas: z.array(z.object({ horas: z.number(), precio: z.number() })).min(1),
      incluye: z.string().optional(),
      fotos: z.array(image()).min(1),
      horario: z.record(z.enum(["lun","mar","mie","jue","vie","sab","dom"]), z.array(rango)),
      bloqueos: z.array(z.string()).default([]),
      ocupados: z.array(z.string()).default([]),
    }),
});

export const collections = { modelos };
```

Si a una modelo le falta un dato obligatorio o tiene menos de 18 años, **el build falla** y no se publica.

### 4.3 Flujo para agregar una modelo

1. `npm run nueva-modelo -- sofia` crea `src/content/modelos/sofia/` con la plantilla.
2. Se copian las fotos a `fotos/` (**con el rostro ya difuminado en el archivo**, ver §11).
3. Se llena `index.md`.
4. `npm run dev` para revisarla y `git push`: el deploy publica la home, el perfil y su flujo de reserva automáticamente (`getStaticPaths`).

### 4.4 Fase 2: panel `/admin` sin código

**Sveltia CMS** (o Decap CMS, con la misma configuración) apuntando a la misma colección. Quien administre entra a `/admin`, sube fotos y llena un formulario; el CMS hace el commit y el sitio se reconstruye solo. No hace falta base de datos ni servidor.

### 4.5 Fase 3 (opcional): disponibilidad en vivo

Con un sitio estático, `ocupados` solo cambia cuando se vuelve a publicar. Si se necesita marcar horarios ocupados al momento, `availability.ts` puede leer además un JSON remoto (Supabase o una hoja de Google publicada) desde la isla `BookingFlow`, sin cambiar los componentes.

---

## 5. Flujo de MCP de Figma (Dev Mode), paso a paso

**Reglas:**
- `get_design_context` es la fuente principal. Su código (React + Tailwind con posiciones absolutas) es **una referencia**: se traduce a flex/grid, a los tokens de §2 y a los componentes de `ui/`. **Nunca se pega tal cual.**
- Las URLs de assets que devuelve el MCP **caducan a los 7 días**. Se descargan a `src/assets/` en la misma sesión, con nombres semánticos, y se anotan en `docs/figma-map.md`.
- Siempre se pide la captura (`get_screenshot`) del mismo nodo: es el objetivo visual con el que se compara.

**Orden de extracción:**

1. **Tokens.** `get_variable_defs` sobre `365:252`, `365:263`, `365:282`, `365:303`, `365:310` y las pantallas, para confirmar o completar §2 (radios y espaciados `--lr-space-*`).
2. **Assets de marca.** Logo `151:325`, título hero (`54:79`, "surface-shading"), silueta `63:8`, avatar `544:515`, fondos (luna sobre nubes, estrellas, sombra `47:962`), cierre (`256:305`/`225:733`), banner "Alcance actual" (`122:683`), mapa de El Salvador (del perfil `299:804`), ilustraciones de pago (billetes `503:1359`, tarjetas/bancos `509:1370`/`509:1374`), iconos (`277:312`–`277:610` + WhatsApp, candado-reloj, reloj, reloj de arena, calendario).
   - SVG: pasar por **SVGO**. Iconos: convertir con **SVGR** a componentes `.tsx`, que se usan igual desde Astro y desde React.
   - Mapa: confirmar que **cada departamento es un `<path id="san-salvador">`** para poder pintar la cobertura desde los datos de la modelo.
   - Raster: exportar al doble de tamaño. Astro genera las variantes (no se suben versiones ya reducidas a mano).
3. **Componentes base** (en este orden): Button → Chip (modalidad) → StatusBadge → SectionTitle (título + barra roja) → GlassPanel → ModelCard (`95:328`) → CalendarDay → TimeSlot → SummaryRow.
4. **Pantallas por sección**, primero mobile y luego desktop: `get_design_context` de cada nodo de §1.2 y §1.3, en paralelo por pantalla.
5. **Code Connect** (si tu plan de Figma lo permite): `add_code_connect_map` para enlazar cada componente de Figma con su `.tsx`. Así, la próxima vez que se pida diseño al MCP, devolverá *tus* componentes en lugar de código genérico.
6. **Verificación visual.** Playwright saca capturas a **412 px** y **1920 px** y se comparan con `get_screenshot` del nodo equivalente (pixelmatch con tolerancia). Cualquier diferencia de assets o proporciones se corrige antes de dar la sección por cerrada.

---

## 6. Páginas y comportamiento

### 6.1 Aviso +18 (`AgeGate`)
- Modal a pantalla completa sobre el fondo cósmico: texto legal del Figma + botón "Entrar".
- Al aceptar se guarda `lr_age_ok=1` (cookie de 30 días; `localStorage` como respaldo envuelto en try/catch).
- Bloquea el scroll y atrapa el foco (accesible). Si JS falla, un `<noscript>` muestra el aviso en la página.
- Meta `<meta name="rating" content="adult">` en todo el sitio.

### 6.2 Home
- **Hero:** fondo luna + nubes (versión específica para móvil, recortada y más liviana), silueta, título SVG, subtítulo en Playfair y CTA que baja a `#modelos`.
- **Así de fácil:** tres pasos (Explora perfiles → Consulta disponibilidad → Coordina tu encuentro).
- **Alcance actual:** banner de imagen.
- **Modelos disponibles:** grid 1 col (móvil) → 2 (≥ 768) → 3 (≥ 1024). Se genera de la colección filtrando `estado: activa` y ordenando por `orden`. Selector de ubicación ("San Salvador"), preparado para más ciudades.
- **ModelCard:** foto, chips de modalidad, nombre, precio desde (`100$/1h`), frase y "Ver perfil".
- **Atención personalizada**, **FAQ** (`<details>` animado con CSS, cero JS), **CTA WhatsApp** y **Cierre**.

### 6.3 Perfil `/modelos/[slug]`
- `PhotoCarousel` (Embla): swipe, flecha roja y `StatusBadge` arriba ("ESTADO ACTUAL · Disponible").
- Nombre (Playfair grande), frase, chips de modalidad y panel de datos (Edad, Cobertura, Tatuajes, Estatura).
- Precio `$100 / 1 hora` (la tarifa más baja) y CTA "Consultar disponibilidad".
- "Cobertura y contacto": `CoverageMap` pinta en rojo los departamentos de `cobertura`.
- **Móvil:** barra inferior fija con precio + "Consultar" (idea tomada de la página *Recreación*, `277:751`). Aparece al pasar el CTA principal.

### 6.4 Disponibilidad `/modelos/[slug]/disponibilidad`
- Desktop en tres columnas: tarjeta de la modelo | duración + modalidad + calendario + horas | resumen fijo (sticky).
- Móvil: todo apilado, con el resumen al final y una barra fija con el total.
- **Lógica (`availability.ts`):**
  - Los horarios salen de `horario` en bloques de 1 h, en zona `America/El_Salvador` (UTC-6, sin horario de verano).
  - Estados: `available`, `selected`, `occupied` (en `ocupados`), `rest` (fuera de turno), `past` (antes de *ahora* + margen) y `unavailable` (no caben las horas elegidas: 2 h necesitan 2 bloques libres seguidos).
  - Días del calendario: `today`, `selected`, `disabled` (bloqueado o sin turno), `outside` (otro mes).
  - Un turno que cruza la medianoche (18:00–04:00) se maneja como "noche del viernes".
- El resumen muestra un `SummaryState` (`valid` / `missing`) y "Continuar a pagar" queda deshabilitado mientras falte algo.
- La selección se guarda en `booking-store` (sessionStorage), así que si recargas o vuelves no se pierde.

### 6.5 Pagar `/modelos/[slug]/pagar`
- Tres tarjetas: **Efectivo** (activa, con check), **Tarjeta** y **Transferencia** ("Próximamente", con candado).
- Los métodos se activan desde `config/site.ts` (`pagos: { efectivo: true, tarjeta: false, transferencia: false }`).
- **"Confirmar por WhatsApp"** abre `https://wa.me/<numero>?text=…` con el mensaje armado:

```
Hola Luna Roja 👋 Quiero reservar:
• Modelo: Alana
• Duración: 1 hora
• Modalidad: A domicilio
• Fecha: viernes, 2 de octubre
• Horario: 07:00 p.m. – 08:00 p.m.
• Zona: San Salvador
• Pago: Efectivo
Total: $100
```

- Si alguien entra directo sin haber elegido horario, se le redirige a Disponibilidad.

### 6.6 Estado actual de la modelo
Se calcula **en el navegador** (`status.ts`) con la hora real. Si se calculara al compilar, quedaría congelado.
- `inactive`: `estado: inactiva`
- `empty`: hoy está en `bloqueos` o no tiene turno
- `rest`: tiene turno hoy, pero no en este momento
- `available`: está dentro de su turno ahora mismo

---

## 7. Micro-animaciones (rápidas en móvil)

**Principios:**
1. Solo se animan `transform` y `opacity` (van por GPU y no recalculan el layout). Nada de animar `box-shadow`, `filter`, `width` ni `top`.
2. Primero CSS. Motion solo donde hace falta física, `layout` o `AnimatePresence`.
3. Motion siempre con `LazyMotion` + `m.*` + `domAnimation` (carga diferida), solo dentro de las islas.
4. Todo respeta `prefers-reduced-motion` (en CSS con `motion-safe:` y en Motion con `useReducedMotion`).
5. Los hover solo bajo `@media (hover: hover)`, para que en táctil no queden "pegados".
6. `backdrop-filter: blur()` es caro en Android de gama media: se usa poco, con radios pequeños, y con un fondo semitransparente sólido como alternativa.

| Lugar | Animación | Herramienta |
|---|---|---|
| Hero | Luna flotando (±6 px, 8 s), estrellas titilando, nubes deslizándose, silueta y título con fade + subida al cargar | CSS keyframes |
| Botones CTA | Presión `scale(.97)`, flecha que avanza 3 px y glow que pulsa (opacidad de un `::after`, no `box-shadow`) | CSS |
| Tarjetas | Aparecen escalonadas al hacer scroll; en desktop se elevan y la foto hace un zoom suave al pasar el mouse | CSS `animation-timeline: view()` con IntersectionObserver de respaldo |
| Tarjeta → Perfil | **Transición compartida**: la foto de la tarjeta "vuela" a la del perfil | View Transitions de Astro (`transition:name`) |
| Punto "Disponible" | Pulso suave en mint | CSS |
| Carrusel | Swipe con inercia y puntos indicadores | Embla |
| FAQ | Abre y cierra con altura animada | CSS (`grid-template-rows: 0fr → 1fr` o `interpolate-size`) |
| Duración / modalidad / horas | La pastilla seleccionada se desliza a la nueva opción | Motion `layoutId` |
| Calendario | El mes se desliza a izquierda o derecha al cambiar | Motion `AnimatePresence` |
| Resumen | Los valores cambian con un crossfade y el total "rueda" | Motion |
| Pago | Check con rebote (spring); al tocar una tarjeta bloqueada, se sacude un poco y aparece "Próximamente" | Motion |
| Barra inferior móvil | Entra deslizándose desde abajo después del CTA | CSS + IntersectionObserver |
| Aviso +18 | Fondo que aparece + modal que escala de 0.96 a 1 | Motion |

---

## 8. Rendimiento: presupuesto y técnicas

**Metas (Lighthouse móvil, 4G simulada):** Performance ≥ 95 · LCP ≤ 2.0 s · INP ≤ 100 ms · CLS ≤ 0.05 · JS de la home ≤ 40 kB gz.

- **Imágenes:** `<Picture>` de Astro con formatos `avif` y `webp`, anchos `[360, 480, 720, 960, 1280]` y `sizes` correctos (tarjeta móvil ≈ `90vw`, desktop ≈ `30vw`). Calidad ~70.
- **Imagen LCP** (fondo del hero en la home, foto principal en el perfil): `loading="eager"`, `fetchpriority="high"` y preload. Todo lo demás con `loading="lazy"` y `decoding="async"`.
- **Fondo del hero:** versión móvil propia (recorte vertical, < 120 kB en AVIF).
- **Fuentes:** Fontsource autohospedado, solo `latin`, solo los pesos usados, `font-display: swap` y preload de Poppins 400 y Playfair 400. Kapakana se carga solo en `/pagar`.
- **Secciones bajo el pliegue:** `content-visibility: auto` + `contain-intrinsic-size`.
- **Sin CLS:** `width` y `height` en todas las imágenes, `aspect-ratio` en las tarjetas y alto reservado para el navbar.
- **CSS:** Tailwind v4 solo genera lo que se usa.
- **Prefetch** de Astro al pasar el mouse o tocar "Ver perfil".
- **Lighthouse CI** en cada PR, que falla si se sale del presupuesto.

---

## 9. Responsive

Mobile-first. Base del diseño: **412 px** (mobile) y **1920 px** (desktop).

| Breakpoint | Cambios |
|---|---|
| Base (< 640) | Una columna, navbar con logo + botón WhatsApp redondo, barras inferiores fijas, márgenes de 16–24 px |
| `md` ≥ 768 | Grid de modelos a 2 columnas, perfil todavía apilado |
| `lg` ≥ 1024 | Perfil en 2 columnas (foto | info), reserva en 3 columnas, navbar con "Consultas" en texto |
| `xl` ≥ 1280 / `2xl` ≥ 1536 | Contenedor máximo ≈ 1744 px (el ancho del navbar en Figma) y tipografía al máximo |

Las tipografías grandes se interpolan con `clamp()` entre el valor de 412 y el de 1920 que da el Figma.

---

## 10. Fases de trabajo (checklist)

### Fase 0: Setup
- [ ] `npm create astro@latest` (TypeScript estricto) + `@astrojs/react` + `@tailwindcss/vite`
- [ ] ESLint, Prettier (`prettier-plugin-tailwindcss` + `prettier-plugin-astro`)
- [ ] Fontsource: Poppins, Playfair Display, Kapakana
- [ ] `global.css` con los tokens de §2
- [ ] Playwright + Lighthouse CI + workflow de GitHub Actions (lint, typecheck, build, e2e)

### Fase 1: Extracción del Figma
- [ ] Confirmar tokens con `get_variable_defs` (radios y espaciados)
- [ ] Descargar todos los assets de §5.2 a `src/assets/` y optimizarlos (SVGO/SVGR)
- [ ] Mapa SVG con un `id` por departamento
- [ ] Llenar `docs/figma-map.md` (nodo → archivo o componente)

### Fase 2: Sistema de diseño
- [ ] `ui/`: Button (4 variantes), Chip, Badge, StatusDot, SectionTitle, Divider, GlassPanel, Icon
- [ ] Página interna `/_ui` (solo en dev) con todos los componentes y estados para revisarlos
- [ ] Code Connect de los componentes (si el plan lo permite)

### Fase 3: Contenido
- [ ] `content.config.ts` (modelos + FAQ)
- [ ] Las 6 modelos del Figma cargadas (Alana, Sirse, Sharlott, Aurora, Elizz, Danna) con sus fotos
- [ ] `scripts/nueva-modelo.ts` + `npm run nueva-modelo`
- [ ] `config/site.ts` (WhatsApp, ciudad, pagos)

### Fase 4: Páginas estáticas
- [ ] BaseLayout (meta, OG, rating adult, View Transitions) + Navbar + Cierre + CosmicBackground
- [ ] AgeGate
- [ ] Home completa (mobile y desktop)
- [ ] Perfil completo + CoverageMap + barra inferior móvil

### Fase 5: Reserva
- [ ] `availability.ts` + `status.ts` con **tests unitarios** (Vitest): turnos que cruzan la medianoche, duración de 2–4 h, horas pasadas, bloqueos
- [ ] `booking-store.ts`
- [ ] Disponibilidad (DurationPicker, ModalityPicker, Calendar, TimeSlots, Legend, Summary)
- [ ] Pagar (PaymentMethods, ConfirmWhatsApp con mensaje armado)
- [ ] Redirecciones y estados vacíos (`AgendaEmpty`, `AvailabilityNotice`)

### Fase 6: Animaciones y pulido
- [ ] Animaciones de §7
- [ ] Revisión con `prefers-reduced-motion`
- [ ] Pruebas en dispositivos reales: iPhone (Safari) + Android de gama media (Chrome)

### Fase 7: QA y lanzamiento
- [ ] Comparación visual con Figma a 412 y 1920 px en cada pantalla
- [ ] Accesibilidad: contraste (rojo sobre oscuro), foco visible, `aria-*` en calendario y horarios, navegación con teclado
- [ ] Lighthouse dentro del presupuesto de §8
- [ ] SEO básico: títulos y descripciones por modelo, sitemap, OG image, `robots.txt`
- [ ] Analítica respetuosa de la privacidad (Plausible/Umami) o ninguna
- [ ] Deploy + dominio + HTTPS

### Fase 8 (después del lanzamiento)
- [ ] Panel `/admin` con Sveltia CMS
- [ ] Disponibilidad en vivo (JSON remoto)
- [ ] Más ciudades en el selector de ubicación
- [ ] Activar Tarjeta / Transferencia cuando haya procesador

---

## 11. Riesgos y temas a cuidar

- **Hosting y pagos.** Muchos proveedores (hosting, CDN y sobre todo procesadores de tarjeta) restringen en su política de uso aceptable los servicios para adultos o de compañía. Hay que **revisarla antes de elegir proveedor**. La salida estática permite moverse a un VPS propio (Caddy/Nginx) si hace falta. Con "Tarjeta" pasa lo mismo: confirmar con el procesador antes de activarla.
- **Privacidad de las modelos.** El difuminado del rostro tiene que estar **dentro del archivo de imagen** antes de subirlo. Si se hace con CSS o con un círculo encima, el original sigue siendo descargable. Hay que quitar los metadatos EXIF y GPS de todas las fotos (Astro lo hace al reprocesar, pero conviene limpiar también los originales del repo).
- **Edad y consentimiento.** El esquema exige `edad ≥ 18`. Los documentos de verificación (DUI) y los consentimientos **no van en el repositorio** ni en el sitio: se guardan fuera, como dice el propio texto del Aviso.
- **Datos personales.** No se guarda nada del cliente: la reserva solo vive en su navegador (sessionStorage) hasta que la envía por WhatsApp.
- **Repositorio.** Mejor **privado**, porque contiene las fotos.

---

## 12. Decisiones pendientes

1. **Página "Recreación" (`275:244`)**: ¿es un borrador o otra versión del perfil con pestañas (Sobre ella / Tarifas / Galería / Cobertura)? Propuesta: usar *Branding* como diseño final y tomar de *Recreación* solo la barra inferior fija de móvil.
2. **Número de WhatsApp** y texto del mensaje.
3. **Nombres**: en Figma aparecen "Alana" en pantalla y "Alala" en los assets. ¿Cuál es el correcto?
4. **Tarifas de 2, 3 y 4 horas** de cada modelo, y qué incluye cada servicio.
5. **Quién actualiza la disponibilidad** y con qué frecuencia. Esto decide si basta con el archivo (fase 1) o si hace falta disponibilidad en vivo (fase 3).
6. **Dominio y hosting.**
7. **Menú en móvil**: *Recreación* tiene un ícono de menú, pero *Branding* mobile solo muestra logo + WhatsApp. ¿Se necesita menú?
