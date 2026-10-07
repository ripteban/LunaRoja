# Luna Roja

Sitio web de Luna Roja construido a partir del diseño de Figma ([Luna Roja Branding](https://www.figma.com/design/HGL6ey7HrhDm4XqJp2GSsM/Luna-Roja)).
Mobile-first, rápido y con un sistema de contenido para agregar modelos sin tocar código de componentes.

**Stack:** Astro 7 (salida estática) · React 19 (solo en las partes interactivas) · Tailwind CSS v4 · Motion (micro-animaciones) · Embla Carousel · TypeScript · Vitest · Playwright.

## Desarrollo local

```bash
npm install
npm run dev        # http://localhost:4321
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Genera el sitio estático en `dist/` (optimiza imágenes a WebP) |
| `npm run preview` | Sirve `dist/` para probar el build |
| `npm run check` | Chequeo de tipos de Astro + TypeScript |
| `npm test` | Tests unitarios (horarios, calendario, formato, WhatsApp) |
| `npm run test:e2e` | Tests end-to-end del flujo completo (requiere `npm run build`) |
| `npm run nueva-modelo -- <slug> "Nombre"` | Crea la carpeta de una modelo nueva |
| `npm run capturas -- <url> <carpeta> [rutas…]` | Capturas a 412 px y 1920 px para comparar con el Figma |

> En el entorno de la nube de Claude Code, Playwright usa el Chromium preinstalado:
> `CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm run test:e2e`.

## Páginas

| Ruta | Pantalla del Figma |
|---|---|
| `/` | Home (6:2 desktop / 151:328 móvil) + aviso +18 (320:298 / 320:423) |
| `/modelos/<slug>` | Perfil (299:412 / 514:1544) |
| `/modelos/<slug>/disponibilidad` | Disponibilidad, servicio y duración (384:1645 / 518:439) |
| `/modelos/<slug>/pagar` | Método de pago (503:1058 / 522:1008) |

La selección de la reserva viaja en la URL (`?h=2&m=presencial&f=2026-10-09&t=1200`), así que recargar, volver atrás o usar "Editar" no pierde nada.
Al confirmar se abre WhatsApp con el mensaje de la reserva ya escrito.

## Agregar una modelo

1. `npm run nueva-modelo -- sofia "Sofía"`. Esto crea `src/content/modelos/sofia/` con un `index.md` de plantilla.
2. Copia las fotos a `src/content/modelos/sofia/fotos/` (`01.jpg` es la portada). **El rostro debe venir difuminado en el archivo**: un difuminado con CSS se puede saltar descargando la imagen.
3. Completa `index.md`: frase, cobertura, modalidades, tarifa y horario.
4. `npm run dev` para revisarla. La tarjeta en la home, el perfil y su flujo de reserva se generan solos.

El esquema (`src/content.config.ts`) valida cada archivo. Si falta un dato obligatorio, si la edad es menor de 18 o si un horario tiene mal formato, el build falla con un mensaje claro.
Para ocultar una modelo sin borrarla, cambia `estado: inactiva`.

## Configuración (`src/config/site.ts`)

- `whatsapp`: **número de prueba (50370000000), pendiente del real.**
- `disponibilidadForzada: true`: todas las modelos se muestran "Disponible" y solo se bloquean los horarios que ya pasaron. Cuando la disponibilidad venga de la app externa, se pone en `false` y se usan `horario`, `bloqueos` y `ocupados`, o se conecta la fuente externa en `src/lib/availability.ts`.
- `pagos`: activa `tarjeta` o `transferencia` cuando haya procesador. La tarjeta deja de mostrarse bloqueada sola.
- `duraciones`, `diasReservables`, `margenMinutos`: reglas de la reserva.

## Estructura

```
src/
├─ assets/          imágenes del Figma (fondos, logo, ilustraciones de pago)
├─ components/
│  ├─ ui/           íconos SVG del Figma, botones, chips
│  ├─ layout/       navbar, fondo cósmico, logo, cierre
│  ├─ home/         secciones de la home
│  ├─ perfil/       carrusel, estado actual, datos, mapa de cobertura
│  └─ booking/      disponibilidad, pago y resumen (islas React)
├─ content/modelos/ una carpeta por modelo (index.md + fotos)
├─ data/            mapa de El Salvador por departamento
├─ lib/             lógica pura: horarios, estado, formato, WhatsApp
├─ config/site.ts   ajustes del sitio
└─ pages/           rutas
docs/PLAN-DESARROLLO.md  plan técnico y mapa de nodos del Figma
```

## Rendimiento

- La home no carga React: solo HTML, CSS y unos 4 KB de JS (View Transitions + el aviso +18 con `<dialog>` nativo).
- React y Motion se cargan únicamente en el perfil (carrusel) y en los pasos de reserva.
- Las imágenes se generan en WebP con varios tamaños (`srcset`). El fondo del hero tiene una versión recortada para móvil.
- Las animaciones usan solo `transform` y `opacity`, y respetan `prefers-reduced-motion`.
