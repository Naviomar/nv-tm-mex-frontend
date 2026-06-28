# Documentación — Módulo de Plantillas de Correo

> **Propósito:** Este documento sirve como referencia completa para que cualquier modelo o desarrollador pueda continuar trabajando en el módulo de plantillas de correo. Incluye arquitectura, decisiones técnicas, estado actual, y guía de dark mode.

---

## 📌 Contexto del Proyecto

- **Frontend:** Nuxt 3 + Vuetify 3 + Tailwind CSS v4
- **Backend:** Laravel (carpeta `nv-tm-backend`)
- **Editor visual:** GrapesJS 0.22 (iframe-based)
- **Dark mode:** Toggleado por clase `.dark` en `document.documentElement` + Vuetify theme `dark`
- **Tailwind dark mode:** `@custom-variant dark (&:is(.dark *, .v-theme--dark *));` en `assets/css/main.css`
- **Store de dark mode:** `stores/darkModeStore.ts` — sincroniza Vuetify `useTheme` + clase `.dark` en `<html>`

### Configuración de Vuetify (`plugins/00.vuetify.ts`)
- El tema `dark` define `background: '#080808'` pero **NO define `surface`**.
- Esto causa que los componentes Vuetify (`v-card`, `v-navigation-drawer`, etc.) usen un color surface por defecto que no coincide con el deseado.
- **Solución aplicada:** Usar el modificador `!` (important) de Tailwind v4 en clases `dark:bg-zinc-900!` para forzar el background sobre Vuetify.

---

## 🏗️ Arquitectura del Módulo

### Flujo de datos
```
Backend (Laravel)
  ├── EmailTemplateService.php — Orquesta CRUD, preview, validación, renderización
  ├── EmailTemplateRenderer.php — Renderiza Blade components → HTML
  ├── TemplateContextFactory.php — Construye contexto de datos para cada template
  ├── SeaImportTemplateRegistry.php — Registry de templates con keys, componentes, extra_vars
  ├── Contexts/SeaImportNotifyArrivalContext.php — Tokens específicos por template
  └── resources/views/emails/mx/ — Vistas Blade (layouts + components)

Frontend (Nuxt 3)
  ├── pages/system/email-templates/index.vue — Catálogo agrupado + drawer
  ├── pages/system/email-templates/edit/[id].vue — Editor con GrapesJS + settings panel
  ├── components/emailTemplates/EmailTemplateEditor.client.vue — Wrapper de GrapesJS
  └── repository/modules/catalogs/emailTemplates.ts — API client
```

### Concepto clave: Split de contenido
- **`body_html`** (editable en GrapesJS): Texto estático + tokens `{{ ref.xxx }}` para datos dinámicos.
- **Vistas Blade** (no editables): Solo `@foreach` loops y lógica condicional que no se puede expresar con tokens.
- **Marcadores:** `<div data-tm-component="component-key">` en `body_html` indican dónde se insertan componentes Blade renderizados.

### Componentes Blade (resources/views/emails/mx/components/)
**Sin foreach (texto 100% a body_html):**
- `notify-revalidation-content`: Blade reducido a `{{ $referencia->revalidation->sent_notes ?? '' }}`
- `pending-revalidation-ind-content`: Blade reducido a solo `@includeIf` de contactos por puerto

**Con foreach (texto estático a body_html, Blade conserva solo loops):**
- `checklist-content`: `@foreach($containers)` + comentarios
- `intermodal-content`: 3 tablas por `transportation_mode_id` con `@foreach($containers)`
- `intermodal-rail-content`: tabla con `@foreach($data['containers'])`
- `vessel-eta-no-ata-content`: `@foreach($voyageDestinations)`
- `vessel-no-ata-content`: `@foreach($voyageDestinations)`
- `pending-revalidation-content`: tabla con `@foreach($referencias)`
- `no-vessel-weekly-content`: tabla con `@foreach($referencias)`
- `pending-arrival-tm-content`: tabla con `@foreach($referencias)`
- `intermodal-truck-pending-content`: tabla con `@foreach($referencias)` + contactos
- `intermodal-rail-truck-pending-content`: bloque con `@foreach($referencias)` + contenedores + contactos
- `demurrages-cut-notify-content`: tabla con `@foreach($referencia->containers)`

---

## ✅ Trabajo Completado

### Sesión 1 — Funcionalidad base

#### 1. Canvas GrapesJS — altura y error `setConfig`
- `EmailTemplateEditor.client.vue`: mide altura real del contenedor con `getBoundingClientRect().height`, pasa píxeles explícitos a GrapesJS.
- `await nextTick()` antes de inicializar. `ResizeObserver` para reajustar al abrir/cerrar drawer.
- Eliminado `editor.setConfig()` (no existe en GrapesJS 0.22).

#### 2. Catálogo agrupado por tipo de notificación
- `index.vue`: Plantillas agrupadas por tipo de notificación (deriva grupo del `key` quitando sufijo `-pdf`).
- Una card por tipo. Drawer lateral derecho (`v-navigation-drawer`, 420px) muestra plantillas base (body/pdf) y variantes por naviera.
- Estado visual: verde = todo publicado, ámbar = parcial, gris = solo borradores.

#### 3. Búsqueda de referencia por número
- **Backend** (`EmailTemplateService.php`): `resolveReferenceByNumber()` acepta `MXIM26-0677`, `IM26-0677`, `0677` (fallback a ID).
- **Frontend** (`edit/[id].vue`): `sampleReferenceQuery` + `@change`/`@keydown.enter` → `GET /admin/email-templates/resolve-reference?q=...`.

#### 4. Endpoint de preview de componente
- `EmailTemplateService::renderComponentPreview(string $key, int $referenceId)` — usa contexto real o fallback a dummy.
- Rutas: `GET /admin/email-templates/resolve-reference`, `GET /admin/email-templates/component-preview`.

#### 5. Font-family en layout base de email
- `base.blade.php`: `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...` en `body, table, td, p, a, li, blockquote`.

#### 6. Fix renderización de componentes dinámicos
- `renderComponentPreview` ahora busca primera `Referencia` real como dummy data (con eager loading).
- `extra_vars` (tokens no-ref como `days`, `estadoMovimiento`) mergeados al contexto.

#### 7. Split de componentes Blade
- Ver sección "Concepto clave: Split de contenido" arriba.

#### 8. Seeder con body_html rico
- `EmailTemplateBaseSeeder::ensureBaseVersion` ahora actualiza versiones existentes.
- `registryBodyHtml()` genera HTML editable con tokens + marcadores `data-tm-component`.

#### 9. Tokens ampliados en contexto
- `SeaImportNotifyArrivalContext`: `ref.print_bl_name`, `ref.eta_date`, `ref.mbls`, `ref.containers`, `ref.revalidation_notes` (con `strtoupper()`).
- `SeaImportTemplateRegistry`: `extra_vars` en entradas con tokens no-ref.
- `TemplateContextFactory::buildFromRegistry`: merge de `extra_vars`.
- `ref_tokens = true` en `intermodal-truck-pending` e `intermodal-rail-truck-pending`.

### Sesión 2 — Fixes y mejoras

#### 10. Fix: Error `Call to undefined relationship [houseBls]`
- Relaciones en `Referencia` son snake_case. Corregidas a `house_bls`, `master_bls`, `voyage_discharge`, `containers.container_type`.
- Agregadas relaciones faltantes: `revalidation`, `demurrage_charges`, `origin`, `destination`.

#### 11. Fix: "Se requiere una referencia de muestra"
- `TemplateContextFactory` y `buildSeaImportNotifyArrival` ahora hacen fallback a `getDummyReferencia()`.

#### 12. Font-family en canvas de GrapesJS
- CSS del parent no penetra el iframe. Se inyecta `<style>` en el `document` del iframe tras `grapesjs.init()`.
- Evento `canvas:load` + fallback con `setTimeout` (300ms, 1000ms).

#### 13. Padding del body en canvas
- `padding: 16px` en `body` del iframe.

#### 14. Maquetado visible en canvas
- `resolveComponentPlaceholders()`: intercepta `data-tm-component`, llama `componentPreview`, reemplaza placeholders por HTML renderizado.
- Componentes envueltos en contenedor con borde punteado índigo + badge con nombre.
- `getData()`: revierte componentes renderizados a placeholders limpios al guardar.

### Sesión 2-3 — Modo oscuro completo

#### 15. Modo oscuro — GrapesJS Editor
- ~100 líneas de CSS `html.dark .tm-email-editor .*` para: canvas, paneles, bloques, traits, layers, modales, inputs, selectores, campos, headers.
- Inyección dinámica de dark mode dentro del iframe (background y color del body cuando `html.dark`).
- **Archivo:** `components/emailTemplates/EmailTemplateEditor.client.vue`

#### 16. Modo oscuro — Página index (`index.vue`)
- Stats cards: `dark:bg-zinc-900!` (con `!` important para override Vuetify)
- Search input: `dark:bg-zinc-900!`, `dark:placeholder:text-zinc-500`
- Module headers, icons, counters: `dark:text-zinc-500`
- Card icons: `dark:text-emerald-400`, `dark:text-amber-400`, `dark:text-zinc-400`
- Chevron/pencil icons: `dark:text-zinc-600`, `dark:group-hover:text-indigo-400`
- Drawer: `class="dark:bg-zinc-900!"` en `v-navigation-drawer`
- Drawer template cards: `dark:bg-zinc-900!`
- Badges: `dark:bg-emerald-950/30 dark:text-emerald-300`, `dark:bg-amber-950/30 dark:text-amber-300`
- Variant cards: `dark:bg-indigo-950/20`, `dark:border-indigo-900/50`
- Hover borders: `dark:hover:border-emerald-600`, `dark:hover:border-amber-600`, `dark:hover:border-indigo-600`
- Border colors: `dark:border-emerald-800`, `dark:border-amber-800` (consistencia)
- Todos los textos `text-zinc-400` tienen `dark:text-zinc-500`

#### 17. Modo oscuro — Página edit (`edit/[id].vue`)
- Topbar: `dark:bg-zinc-900!`, `dark:border-zinc-800`
- Settings panel: `dark:bg-zinc-900!`, `dark:border-zinc-800`
- Todos los `v-card` de diálogos: `dark:bg-zinc-900!` (5 diálogos: validación, preview, código, diff, test send)
- **`v-divider` reemplazados por divs styled:**
  - Topbar (3 verticales): `<div class="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1">`
  - Settings panel (4 horizontales): `<div class="border-t border-zinc-200 dark:border-zinc-800 my-4">`
- Icon backgrounds: `dark:bg-rose-950/40`, `dark:bg-indigo-950/40`
- Icon colors: `dark:text-rose-400`, `dark:text-indigo-400`, `dark:text-amber-400`
- Section titles: `dark:text-zinc-400`
- Textos descriptivos: `dark:text-zinc-500`
- Subtítulo topbar (`key · type`): `dark:text-zinc-500`
- Autosave label: `dark:text-zinc-500`
- Code dialog `<pre>`: `dark:bg-zinc-950 dark:text-zinc-200`
- Diff dialog: `dark:text-zinc-400`, `dark:border-zinc-700`, `dark:text-zinc-500` (empty state)
- Preview dialog background: `dark:bg-zinc-950`
- Loading fallback: `dark:text-zinc-400`

---

## 🎨 Guía de Dark Mode para Vuetify + Tailwind

### Problema principal
Vuetify componentes (`v-card`, `v-navigation-drawer`, `v-divider`) usan CSS variables (`--v-theme-surface`) con alta especificidad que **override** las clases `dark:bg-*` de Tailwind.

### Solución: Modificador `!` (important) de Tailwind v4
```html
<!-- ✅ Correcto: el ! fuerza el background sobre Vuetify -->
<v-card class="dark:bg-zinc-900!">
<v-navigation-drawer class="dark:bg-zinc-900!">

<!-- ❌ Incorrecto: Vuetify override el background -->
<v-card class="dark:bg-zinc-900">
```

### Solución: Reemplazar `v-divider` por divs styled
```html
<!-- ✅ Divs con dark border explícito -->
<div class="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
<div class="border-t border-zinc-200 dark:border-zinc-800 my-4"></div>

<!-- ❌ v-divider no respeta dark mode correctamente -->
<v-divider class="..." />
```

### Paleta de colores dark mode usada
| Elemento | Clase dark |
|----------|-----------|
| Backgrounds principales | `dark:bg-zinc-900!` |
| Backgrounds secundarios | `dark:bg-zinc-800`, `dark:bg-zinc-950` |
| Backgrounds con opacidad | `dark:bg-emerald-950/30`, `dark:bg-indigo-950/40` |
| Borders | `dark:border-zinc-800`, `dark:border-zinc-700` |
| Texto principal | `dark:text-zinc-50`, `dark:text-zinc-100` |
| Texto secundario | `dark:text-zinc-400` |
| Texto terciario/muted | `dark:text-zinc-500` |
| Iconos muted | `dark:text-zinc-600` |
| Iconos accent | `dark:text-indigo-400`, `dark:text-emerald-400`, `dark:text-amber-400`, `dark:text-rose-400` |
| Hover borders | `dark:hover:border-indigo-600`, `dark:hover:border-emerald-600` |

### Reglas a seguir
1. **Toda clase `text-zinc-*` debe tener su `dark:` equivalente** — `text-zinc-400` → `dark:text-zinc-500`, `text-zinc-900` → `dark:text-zinc-50`, etc.
2. **Toda clase `bg-white` debe tener `dark:bg-zinc-900!`** (con `!` si es Vuetify component o div contenedor).
3. **Toda clase `bg-zinc-50` debe tener `dark:bg-zinc-800` o `dark:bg-zinc-900/40`** (sin `!` si es div plain).
4. **`v-divider` → reemplazar por divs styled** con `dark:bg-zinc-700` o `dark:border-zinc-800`.
5. **Hover states necesitan `dark:hover:` variantes** — `hover:border-indigo-400` → `dark:hover:border-indigo-600`.
6. **Placeholders de inputs necesitan `dark:placeholder:` variantes**.

---

## 📁 Archivos Modificados — Resumen Completo

### Backend (`nv-tm-backend`)
| Archivo | Qué se hizo |
|---------|-------------|
| `app/Services/V1/Mexico/EmailTemplates/EmailTemplateService.php` | CRUD, `renderComponentPreview` con dummy data, `resolveReferenceByNumber`, fix snake_case eager loading, merge `extra_vars` |
| `app/Services/V1/Mexico/EmailTemplates/EmailTemplateRenderer.php` | `renderComponentByKey` público |
| `app/Services/V1/Mexico/EmailTemplates/SeaImportTemplateRegistry.php` | `extra_vars` en entradas, `ref_tokens` corregidos |
| `app/Services/V1/Mexico/EmailTemplates/TemplateContextFactory.php` | Merge `extra_vars`, fallback `getDummyReferencia()` |
| `app/Services/V1/Mexico/EmailTemplates/Contexts/SeaImportNotifyArrivalContext.php` | Nuevos tokens + `strtoupper` |
| `database/seeders/mexico/EmailTemplateBaseSeeder.php` | `registryBodyHtml()` con HTML rico + `ensureBaseVersion` actualiza |
| `resources/views/emails/mx/components/*.blade.php` | Reducidos a solo `@foreach`/loops |
| `resources/views/emails/mx/layouts/base.blade.php` | Font-family global |
| `app/Http/Controllers/V1/Mexico/System/EmailTemplatesController.php` | Endpoints `resolveReference`, `componentPreview` |
| `routes/mex/api.php` | Rutas GET para resolve-reference y component-preview |

### Frontend (`nv-tm-mex-frontend`)
| Archivo | Qué se hizo |
|---------|-------------|
| `components/emailTemplates/EmailTemplateEditor.client.vue` | Altura dinámica, ResizeObserver, fix setConfig, font-family iframe injection, padding, componentes renderizados en canvas, dark mode CSS completo (~100 líneas) |
| `pages/system/email-templates/index.vue` | Catálogo agrupado + drawer, dark mode completo con `!` important en cards/drawer/inputs, hover borders dark, placeholder dark, todos los textos con `dark:` |
| `pages/system/email-templates/edit/[id].vue` | Búsqueda de referencia por texto, dark mode completo: topbar, settings panel, 5 diálogos `v-card` con `dark:bg-zinc-900!`, `v-divider` reemplazados por divs styled, todos los textos con `dark:` |
| `repository/modules/catalogs/emailTemplates.ts` | Métodos API: `resolveReference`, `componentPreview` |

---

## 🎯 Próximos Pasos Recomendados

1. **Verificar renderización en GrapesJS** — abrir cada template en el editor y confirmar que los componentes dinámicos renderizan correctamente (sin "Error al renderizar").
2. **Verificar edición de texto** — editar texto estático en GrapesJS y confirmar que los cambios persisten al guardar.
3. **Probar envío real** — enviar un correo de prueba con una referencia real para verificar que tokens y componentes se resuelven correctamente.
4. **Verificar dark mode visualmente** — togglear dark mode y revisar cada pantalla: index (cards, drawer, badges), edit (topbar, settings, diálogos, canvas GrapesJS).
5. **Considerar definir `surface` en Vuetify dark theme** (`plugins/00.vuetify.ts`) para reducir la necesidad del modificador `!` en futuros componentes.

---

## ⚠️ Notas Técnicas Importantes

- **GrapesJS usa iframe**: El CSS del parent NO penetra. Toda personalización visual del canvas debe inyectarse via JS en el `document` del iframe.
- **Tailwind v4 `!` syntax**: El modificador va al final de la clase: `dark:bg-zinc-900!` (no `!dark:bg-zinc-900`).
- **`@custom-variant dark`**: Definido en `assets/css/main.css` línea 4. Activa dark mode con `.dark` en `<html>` o `.v-theme--dark` de Vuetify.
- **`darkModeStore.ts`**: Sincroniza ambos sistemas (Tailwind `.dark` class + Vuetify `useTheme`). Persiste en localStorage.
- **Relaciones Laravel snake_case**: El modelo `Referencia` usa relaciones en snake_case (`house_bls`, no `houseBls`). Verificar al hacer eager loading.
- **`data-tm-component` attribute**: Marcador en `body_html` que identifica dónde insertar componentes Blade renderizados. `resolveComponentPlaceholders()` los reemplaza en canvas; `getData()` los revierte al guardar.
