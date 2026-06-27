<template>
  <div ref="wrapperEl" class="tm-email-editor d-flex" style="width:100%; height:100% ;">
    <!-- Panel izquierdo fijo: Bloques / Estilo / Ajustes / Capas, con pestañas -->
    <div class="tm-left-panel d-flex flex-column border-r bg-white dark:bg-zinc-900! dark:border-zinc-800" style="width:260px; flex-shrink:0;">
      <!-- Selector de pestaña -->
      <div class="d-flex border-b border-zinc-100 dark:border-zinc-800" style="flex-shrink:0;">
        <button
          v-for="tab in leftTabs"
          :key="tab.key"
          class="tm-left-tab flex-1 d-flex flex-column align-center gap-1 py-2"
          :class="{ 'tm-left-tab-active': leftTab === tab.key }"
          @click="leftTab = tab.key"
        >
          <v-icon :icon="tab.icon" size="16" />
          <span style="font-size:10px; font-weight:600; letter-spacing:0.01em;">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Buscador, solo aplica a la pestaña de Bloques -->
      <div v-if="leftTab === 'blocks'" class="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
        <input
          v-model="blockSearch"
          type="text"
          placeholder="Buscar bloque o variable…"
          class="w-full h-8 px-2.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800! text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>

      <!-- Texto de ayuda cuando Estilo/Ajustes no tienen nada seleccionado -->
      <div
        v-if="(leftTab === 'style' || leftTab === 'traits') && !hasSelection"
        class="px-3 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500"
      >
        Selecciona un elemento en el lienzo para {{ leftTab === 'style' ? 'editar su estilo' : 'ver sus ajustes' }}.
      </div>

      <!-- Mounts nativos de GrapesJS; se muestran/ocultan por pestaña sin desmontar -->
      <div class="flex-1 overflow-y-auto">
        <div ref="blocksEl" v-show="leftTab === 'blocks'" class="tm-blocks-mount"></div>
        <div ref="styleEl" v-show="leftTab === 'style'" class="tm-style-mount"></div>
        <div ref="traitsEl" v-show="leftTab === 'traits'" class="tm-traits-mount"></div>
        <div ref="layersEl" v-show="leftTab === 'layers'" class="tm-layers-mount"></div>
      </div>
    </div>

    <!-- Lienzo + barra de herramientas de GrapesJS. flex:1 + min-width:0 es
         necesario para que el hijo flex no se expanda a su min-content (el
         iframe interno de GrapesJS fuerza eso si falta min-width:0 en algún
         punto de la cadena de ancestros). overflow-x:hidden cubre ese caso
         sin recortar verticalmente. -->
    <div style="flex: 1 1 0%; min-width: 0; overflow-x: hidden; overflow-y: auto;">
      <div ref="editorEl" style="width: 100%; height: 100%;"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import presetNewsletter from 'grapesjs-preset-newsletter'

interface ComponentDef {
  key: string
  name: string
  category: string
  scope?: string
  default_html?: string
  icon?: string
}

interface VariableDef {
  token: string
  label: string
  group: string
}

const props = defineProps<{
  initialHtml?: string
  initialCss?: string
  components?: ComponentDef[]
  variables?: VariableDef[]
}>()

const emit = defineEmits<{ dirty: [] }>()

const wrapperEl = ref<HTMLElement | null>(null)
const editorEl = ref<HTMLElement | null>(null)
const blocksEl = ref<HTMLElement | null>(null)
const styleEl = ref<HTMLElement | null>(null)
const traitsEl = ref<HTMLElement | null>(null)
const layersEl = ref<HTMLElement | null>(null)
const blockSearch = ref('')
const hasSelection = ref(false)

const leftTabs = [
  { key: 'blocks', icon: 'mdi-shape-outline', label: 'Bloques' },
  { key: 'style', icon: 'mdi-brush-outline', label: 'Estilo' },
  { key: 'traits', icon: 'mdi-cog-outline', label: 'Ajustes' },
  { key: 'layers', icon: 'mdi-layers-outline', label: 'Capas' },
] as const
const leftTab = ref<'blocks' | 'style' | 'traits' | 'layers'>('blocks')
let editor: any = null
let ro: ResizeObserver | null = null

const buildDynamicBlock = (c: ComponentDef) =>
  `<div data-tm-component="${c.key}" style="border:1px dashed #6366f1;padding:10px;background:#eef2ff;color:#3730a3;font-size:12px;text-align:center;font-weight:600;">[ ${c.name} ]</div>`

const EMAIL_FONT_FAMILY = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

/**
 * Replaces <div data-tm-component="key"></div> placeholders in the HTML
 * with the real rendered component HTML from the backend, wrapped in a
 * visible "dynamic component" container so the user sees the actual layout.
 */
async function resolveComponentPlaceholders(html: string): Promise<string> {
  if (!html || !html.includes('data-tm-component')) return html

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const placeholders = doc.querySelectorAll<HTMLElement>('[data-tm-component]')

  if (!placeholders.length) return html

  const { $api } = useNuxtApp()

  await Promise.all(
    Array.from(placeholders).map(async (el) => {
      const key = el.getAttribute('data-tm-component')
      if (!key) return

      try {
        const res: any = await $api.emailTemplates.componentPreview(key)
        const renderedHtml = res?.html || ''
        if (renderedHtml) {
          const wrapper = doc.createElement('div')
          wrapper.setAttribute('data-tm-component', key)
          wrapper.setAttribute('data-gjs-locked', '1')
          wrapper.style.cssText = 'border:2px dashed #6366f1;border-radius:8px;padding:4px;margin:8px 0;position:relative;'
          wrapper.innerHTML = `
            <div style="position:absolute;top:-10px;left:8px;background:#6366f1;color:#fff;font-size:10px;font-weight:600;padding:1px 8px;border-radius:4px;z-index:10;font-family:${EMAIL_FONT_FAMILY};">⚙ ${key}</div>
            <div style="pointer-events:none;">${renderedHtml}</div>
          `
          el.replaceWith(wrapper)
        }
      } catch (e) {
        console.warn(`componentPreview failed for ${key}:`, e)
      }
    })
  )

  return doc.body.innerHTML
}

onMounted(async () => {
  await nextTick()
  if (!editorEl.value || !wrapperEl.value) return

  const getHeight = () => `${wrapperEl.value!.getBoundingClientRect().height || window.innerHeight - 120}px`

  // Resolve data-tm-component placeholders with real rendered HTML from backend
  let resolvedHtml = props.initialHtml || ''
  if (resolvedHtml.includes('data-tm-component')) {
    try {
      resolvedHtml = await resolveComponentPlaceholders(resolvedHtml)
    } catch (e) {
      console.warn('resolveComponentPlaceholders failed, using raw HTML:', e)
    }
  }

  editor = grapesjs.init({
    container: editorEl.value,
    height: getHeight(),
    width: '100%',
    fromElement: false,
    storageManager: false,
    plugins: [presetNewsletter],
    components: resolvedHtml,
    style: props.initialCss || '',
    blockManager: {
      appendTo: blocksEl.value || undefined,
    },
    styleManager: {
      appendTo: styleEl.value || undefined,
    },
    layerManager: {
      appendTo: layersEl.value || undefined,
    },
    traitManager: {
      appendTo: traitsEl.value || undefined,
    },
  })

  // El preset de newsletter agrega botones al toolbar que abren paneles
  // flotantes por defecto (bloques, estilo, ajustes, capas); ya no aplican
  // porque los 4 viven anclados en el panel izquierdo con pestañas propias.
  ;['open-blocks', 'open-sm', 'open-tm', 'open-layers'].forEach((id) => {
    try {
      editor.Panels.removeButton('options', id)
    } catch (e) {
      console.warn(`No se pudo quitar el botón ${id} del toolbar:`, e)
    }
  })

  // El panel de Estilo/Ajustes solo tiene sentido con un elemento seleccionado.
  editor.on('component:selected', () => { hasSelection.value = true })
  editor.on('component:deselected', () => { hasSelection.value = false })

  // El CSS por sí solo (flex + min-width:0) no basta: GrapesJS termina fijando
  // el ancho real del canvas en JS al iniciar, y eso no siempre coincide con
  // el espacio realmente disponible en ese instante. Se fuerza el ancho real
  // leyendo el contenedor con getBoundingClientRect en momentos puntuales y
  // seguros (montaje, resize, cambio de pestaña) — sin vigilar el subárbol
  // del canvas con MutationObserver, que interfiere con los repintados
  // internos de GrapesJS y le hace perder contenido ya resuelto.
  const forceCanvasWidth = () => {
    if (!editorEl.value) return
    const w = editorEl.value.getBoundingClientRect().width
    if (w <= 0) return
    const px = `${w}px`
    editorEl.value.querySelectorAll<HTMLElement>(
      '.gjs-cv-canvas, .gjs-cv-canvas__frames, .gjs-frame-wrapper, .gjs-frame'
    ).forEach((el) => { el.style.width = px })
  }

  // A diferencia del ancho, la altura del canvas NO debe igualar la del host:
  // GrapesJS reserva arriba un espacio para su barra de herramientas interna
  // (var(--gjs-canvas-top), ~40px) y .gjs-cv-canvas ya calcula su propia
  // altura como calc(100% - ese offset) relativo a .gjs-editor. Forzar la
  // misma altura completa en .gjs-cv-canvas/.gjs-frame-wrapper/.gjs-frame
  // (en vez de dejar que la calculen ellos mismos) los hacía desbordar más
  // allá de su contenedor real — esa era la causa del corte vertical. Solo
  // .gjs-editor (el contenedor raíz) necesita el ancho forzado explícito.
  const forceCanvasHeight = () => {
    if (!editorEl.value || !wrapperEl.value) return
    const h = wrapperEl.value.getBoundingClientRect().height
    if (h <= 0) return
    const editorRoot = editorEl.value.querySelector<HTMLElement>('.gjs-editor')
    if (editorRoot) editorRoot.style.height = `${h}px`
  }

  forceCanvasWidth()
  forceCanvasHeight()
  watch(leftTab, () => nextTick(() => { forceCanvasWidth(); forceCanvasHeight() }))

  // Inject font-family CSS into the GrapesJS iframe (parent CSS can't penetrate iframes)
  const injectFontCss = () => {
    const frame = editor?.Canvas?.getDocument?.()
    if (!frame) return false
    const isDark = document.documentElement.classList.contains('dark')
    const styleEl = frame.createElement('style')
    styleEl.id = 'tm-email-font'
    styleEl.textContent = `
      *, *::before, *::after {
        font-family: ${EMAIL_FONT_FAMILY} !important;
      }
      body {
        padding: 16px !important;
        ${isDark ? 'background-color: #18181b !important; color: #d4d4d8 !important;' : ''}
      }
      /* El scrollbar nativo por defecto es casi invisible (gris muy claro
         sobre fondo claro), lo que hace parecer que el contenido del correo
         "se corta" cuando en realidad solo falta hacer scroll para verlo. */
      html {
        scrollbar-width: auto;
        scrollbar-color: #71717a #e4e4e7;
      }
      ::-webkit-scrollbar {
        width: 14px;
      }
      ::-webkit-scrollbar-track {
        background: #e4e4e7;
      }
      ::-webkit-scrollbar-thumb {
        background: #71717a;
        border-radius: 7px;
        border: 3px solid #e4e4e7;
      }
    `
    frame.head.appendChild(styleEl)
    return true
  }

  // Some PDF blade views (e.g. notify-arrival) style themselves with
  // `<script src="cdn.tailwindcss.com">`, which works when Browsershot
  // navigates the real page but never runs when injected via innerHTML
  // (browsers don't execute script tags inserted that way). Load it
  // manually inside the canvas iframe so the editor preview matches the
  // real PDF look.
  const injectTailwindCdn = () => {
    const frame = editor?.Canvas?.getDocument?.()
    if (!frame || frame.getElementById('tm-tailwind-cdn')) return false
    if (!frame.body || !/\bclass="[^"]*\b(text-|bg-|border-|grid-|px-|py-|p-\d|m-\d|w-|flex)/.test(frame.body.innerHTML)) {
      return false
    }
    const scriptEl = frame.createElement('script')
    scriptEl.id = 'tm-tailwind-cdn'
    scriptEl.src = 'https://cdn.tailwindcss.com'
    frame.head.appendChild(scriptEl)
    return true
  }

  // Try immediately, then on canvas:load, then with a delay fallback
  if (!injectFontCss()) {
    editor.on('canvas:load', () => injectFontCss())
    setTimeout(injectFontCss, 300)
    setTimeout(injectFontCss, 1000)
  }
  if (!injectTailwindCdn()) {
    editor.on('canvas:load', () => injectTailwindCdn())
    setTimeout(injectTailwindCdn, 300)
    setTimeout(injectTailwindCdn, 1000)
  }

  // Keep height/width in sync when the wrapper resizes (e.g. drawer open/close,
  // left panel tab switch, sidebar hover expand).
  // Mantiene la altura del editor en sync cuando el wrapper cambia de tamaño
  // (ej. abrir/cerrar el drawer de info a la derecha). El ancho se resuelve
  // por flexbox puro (flex:1 1 0%; min-width:0 en el host del canvas), sin
  // necesidad de forzar estilos del canvas/iframe por JS.
  ro = new ResizeObserver(() => {
    if (editor && wrapperEl.value) {
      forceCanvasWidth()
      forceCanvasHeight()
    }
  })
  ro.observe(wrapperEl.value)

  const bm = editor.BlockManager

  // Componentes de sistema (dinámicos) y bloques estáticos reutilizables,
  // agrupados primero por scope (global vs sea-import) y luego por tipo.
  ;(props.components || []).forEach((c) => {
    const isDynamic = c.category === 'dynamic'
    const scopeLabel = c.scope === 'sea-import' ? '🚢 Sea Import' : '🌐 Globales'
    const typeLabel = isDynamic ? 'Componentes de sistema' : 'Bloques reutilizables'
    bm.add(`tm-${c.key}`, {
      label: c.name,
      category: `${scopeLabel} · ${typeLabel}`,
      attributes: { class: 'gjs-fonts gjs-f-b1' },
      content: isDynamic ? buildDynamicBlock(c) : (c.default_html || `<div>${c.name}</div>`),
    })
  })

  // Variables / tokens dinámicos.
  ;(props.variables || []).forEach((v) => {
    bm.add(`var-${v.token}`, {
      label: v.label,
      category: `🔤 Variables · ${v.group}`,
      content: `<span>{{ ${v.token} }}</span>`,
    })
  })

  editor.on('component:update component:add component:remove', () => emit('dirty'))

  // Búsqueda de bloques/variables: usa el render nativo de categorías de
  // GrapesJS, filtrando por label en el DOM ya montado.
  watch(blockSearch, (term) => {
    const root = blocksEl.value
    if (!root) return
    const needle = term.trim().toLowerCase()
    root.querySelectorAll<HTMLElement>('.gjs-block').forEach((el) => {
      const label = el.textContent?.toLowerCase() || ''
      el.style.display = !needle || label.includes(needle) ? '' : 'none'
    })
    root.querySelectorAll<HTMLElement>('.gjs-block-category').forEach((cat) => {
      const hasVisible = !!cat.querySelector('.gjs-block:not([style*="display: none"])')
      cat.style.display = hasVisible ? '' : 'none'
    })
  })
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  if (editor) {
    editor.destroy()
    editor = null
  }
})

const getData = () => {
  if (!editor) return { html: props.initialHtml || '', css: props.initialCss || '', json: '' }
  let html = editor.getHtml()

  // Convert rendered component wrappers back to clean placeholders for storage
  // GrapesJS may wrap content in its own divs; find all data-tm-component elements
  // and strip them back to <div data-tm-component="key"></div>
  if (html.includes('data-tm-component')) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const components = doc.querySelectorAll<HTMLElement>('[data-tm-component]')
    components.forEach((el) => {
      const key = el.getAttribute('data-tm-component')
      const clean = doc.createElement('div')
      clean.setAttribute('data-tm-component', key || '')
      el.replaceWith(clean)
    })
    html = doc.body.innerHTML
  }

  return {
    html,
    css: editor.getCss(),
    json: JSON.stringify(editor.getProjectData()),
  }
}

const setDevice = (device: string) => {
  if (editor) editor.setDevice(device)
}

defineExpose({ getData, setDevice })
</script>

<style>
/* Tema de marca para GrapesJS (acento índigo, paneles limpios) */
.tm-email-editor {
  --tm-accent: #4f46e5;
  /* GrapesJS reserva por defecto un 15% de ancho del canvas para su panel
     izquierdo nativo (.gjs-pn-views), que aquí no existe — los 4 managers
     (Bloques/Estilo/Ajustes/Capas) viven anclados en .tm-left-panel, fuera
     de la jerarquía de paneles de GrapesJS. Sin este override, el canvas
     siempre descuenta ese 15% de más, dejando una franja vacía a la derecha. */
  --gjs-left-width: 0px;
}
.tm-email-editor .gjs-cv-canvas {
  background: #f4f4f5;
  /* Fix directo, sin depender de la variable --gjs-left-width: el canvas
     debe ocupar siempre el 100% de su contenedor (.tm-email-editor > .flex-1),
     que ya está correctamente dimensionado por el flexbox externo. */
  width: 100% !important;
  left: 0 !important;
}
.tm-email-editor .gjs-cv-canvas__frames,
.tm-email-editor .gjs-frame-wrapper,
.tm-email-editor .gjs-frame {
  width: 100% !important;
}
.tm-email-editor .gjs-one-bg {
  background-color: #fafafa;
}
.tm-email-editor .gjs-two-color,
.tm-email-editor .gjs-title {
  color: #3f3f46;
}
.tm-email-editor .gjs-pn-btn.gjs-pn-active,
.tm-email-editor .gjs-pn-btn:hover {
  color: var(--tm-accent);
}
/* Bloques como tarjetas, en columna única dentro del panel izquierdo fijo */
.tm-blocks-mount .gjs-blocks-c {
  display: block;
  padding: 10px;
}
.tm-blocks-mount .gjs-block {
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 10px;
  border: 1px solid #e4e4e7;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.15s ease;
  min-height: 44px;
  margin-bottom: 6px;
  padding: 8px 10px;
  font-size: 12px;
  text-align: left;
}
.tm-blocks-mount .gjs-block:hover {
  border-color: var(--tm-accent);
  color: var(--tm-accent);
  background: #eef2ff;
  transform: translateX(2px);
}
.tm-blocks-mount .gjs-block-category {
  margin-bottom: 4px;
}
.tm-blocks-mount .gjs-block-category .gjs-title {
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.02em;
  padding: 8px 10px 4px;
}
.tm-left-panel input::placeholder {
  color: #a1a1aa;
}

/* Pestañas del panel izquierdo (Bloques / Estilo / Ajustes / Capas) */
.tm-left-tab {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #71717a;
  transition: all 0.15s ease;
}
.tm-left-tab:hover {
  color: var(--tm-accent);
  background: #f4f4f5;
}
.tm-left-tab-active {
  color: var(--tm-accent);
  background: #eef2ff;
  box-shadow: inset 0 -2px 0 var(--tm-accent);
}

/* Style / Trait / Layer managers anclados en el panel izquierdo */
.tm-style-mount .gjs-sm-sector,
.tm-traits-mount .gjs-trt-traits {
  padding: 4px 10px;
}
.tm-style-mount .gjs-sm-sector-title {
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.02em;
}
.tm-layers-mount .gjs-layer-title {
  font-size: 12px;
}
/* Font-family is injected into the GrapesJS iframe via JS (see onMounted) */

/* ── Dark mode ────────────────────────────────────────────── */
html.dark .tm-email-editor .gjs-cv-canvas {
  background: #18181b;
}
html.dark .tm-email-editor .gjs-one-bg {
  background-color: #18181b;
}
html.dark .tm-email-editor .gjs-two-color,
html.dark .tm-email-editor .gjs-title {
  color: #d4d4d8;
}
html.dark .tm-email-editor .gjs-three-bg {
  background-color: #27272a;
}
html.dark .tm-email-editor .gjs-pn {
  background-color: #18181b;
  border-color: #27272a;
}
html.dark .tm-email-editor .gjs-pn-btn {
  color: #a1a1aa;
}
html.dark .tm-email-editor .gjs-pn-btn.gjs-pn-active,
html.dark .tm-email-editor .gjs-pn-btn:hover {
  color: #818cf8;
}
html.dark .tm-email-editor .gjs-block {
  border: 1px solid #27272a;
  background-color: #1f1f23;
  color: #d4d4d8;
}
html.dark .tm-email-editor .gjs-block:hover {
  border-color: #4f46e5;
  color: #818cf8;
  background-color: #27272a;
}
html.dark .tm-email-editor .gjs-block-category .gjs-title {
  color: #a1a1aa;
}
html.dark .tm-left-tab {
  color: #a1a1aa;
}
html.dark .tm-left-tab:hover {
  color: #818cf8;
  background: #27272a;
}
html.dark .tm-left-tab-active {
  color: #818cf8;
  background: #27272a;
  box-shadow: inset 0 -2px 0 #4f46e5;
}
html.dark .tm-email-editor .gjs-blocks-c {
  background-color: #18181b;
}
html.dark .tm-email-editor .gjs-ameta,
html.dark .tm-email-editor .gjs-sm-sector .gjs-sm-title,
html.dark .tm-email-editor .gjs-clm-tags .gjs-sm-tag,
html.dark .tm-email-editor .gjs-input {
  background-color: #27272a;
  color: #d4d4d8;
  border-color: #3f3f46;
}
html.dark .tm-email-editor .gjs-sm-sector .gjs-sm-property,
html.dark .tm-email-editor .gjs-clm-tags {
  border-color: #27272a;
}
html.dark .tm-email-editor .gjs-editor .gjs-frmsc,
html.dark .tm-email-editor .gjs-editor .gjs-sm,
html.dark .tm-email-editor .gjs-editor .gjs-traits {
  background-color: #18181b;
  color: #d4d4d8;
}
html.dark .tm-email-editor .gjs-trt-header,
html.dark .tm-email-editor .gjs-sm-header,
html.dark .tm-email-editor .gjs-clm-header {
  background-color: #27272a;
  border-color: #3f3f46;
  color: #d4d4d8;
}
html.dark .tm-email-editor .gjs-trt-trait {
  border-color: #27272a;
}
html.dark .tm-email-editor .gjs-field {
  background-color: #1f1f23;
  border-color: #3f3f46;
}
html.dark .tm-email-editor .gjs-field input,
html.dark .tm-email-editor .gjs-field select {
  color: #d4d4d8;
}
html.dark .tm-email-editor .gjs-select option {
  background-color: #18181b;
}
html.dark .tm-email-editor .gjs-mdl-dialog {
  background-color: #18181b;
  border-color: #27272a;
}
html.dark .tm-email-editor .gjs-mdl-header {
  background-color: #27272a;
  color: #d4d4d8;
  border-color: #3f3f46;
}
html.dark .tm-email-editor .gjs-layer {
  background-color: #18181b;
  border-color: #27272a;
}
html.dark .tm-email-editor .gjs-layer-name {
  color: #d4d4d8;
}
html.dark .tm-email-editor .gjs-layer.toggled .gjs-layer-name {
  color: #818cf8;
}
html.dark .tm-email-editor .gjs-cv-canvas .gjs-comp-selected {
  outline: 2px solid #818cf8 !important;
}
</style>
