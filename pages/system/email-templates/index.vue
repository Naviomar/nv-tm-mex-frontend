<template>
  <div class="px-4 py-6 w-full max-w-7xl mx-auto">
    <!-- Encabezado -->
    <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div class="flex items-start gap-3">
        <div class="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
          <v-icon icon="mdi-email-edit-outline" size="24" class="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 class="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Plantillas de correo
          </h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            Administra de forma visual la estructura, el contenido y el versionado de los correos del sistema.
          </p>
        </div>
      </div>
      <Button variant="ghost" @click="$router.back()">
        <v-icon icon="mdi-arrow-left" size="18" class="mr-1" /> Volver
      </Button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900! p-4">
        <div class="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{{ notificationGroups.length }}</div>
        <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Tipos de notificación</div>
      </div>
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900! p-4">
        <div class="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{{ stats.published }}</div>
        <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Con versión publicada</div>
      </div>
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900! p-4">
        <div class="text-2xl font-semibold text-amber-600 dark:text-amber-400">{{ stats.drafts }}</div>
        <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Solo borrador</div>
      </div>
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900! p-4">
        <div class="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{{ moduleGroups.length }}</div>
        <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Módulos</div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap items-center gap-2 mb-5">
      <div class="relative flex-1 min-w-[220px]">
        <v-icon icon="mdi-magnify" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre, clave o tipo de notificación…"
          class="w-full h-10 pl-9 pr-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900! text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="h-20 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 animate-pulse"></div>
    </div>

    <!-- Vacío -->
    <div v-else-if="!moduleGroups.length" class="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
      <v-icon icon="mdi-email-off-outline" size="40" class="text-zinc-300 dark:text-zinc-600" />
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No hay plantillas que coincidan con la búsqueda.</p>
    </div>

    <!-- Grupos por módulo → cards por tipo de notificación -->
    <div v-else class="space-y-8">
      <section v-for="group in moduleGroups" :key="group.module">
        <!-- Cabecera de módulo -->
        <div class="flex items-center gap-2 mb-3">
          <v-icon :icon="moduleIcon(group.module)" size="16" class="text-zinc-400 dark:text-zinc-500" />
          <h2 class="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{{ group.label }}</h2>
          <span class="text-xs text-zinc-400 dark:text-zinc-500">({{ group.notifGroups.length }})</span>
          <div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
        </div>

        <!-- Grid de cards por tipo de notificación -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <button
            v-for="ng in group.notifGroups"
            :key="ng.notifKey"
            class="group text-left rounded-xl border bg-white dark:bg-zinc-900! p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
            :class="ng.allPublished
              ? 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600'
              : ng.somePublished
                ? 'border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600'"
            @click="openDrawer(ng)"
          >
            <!-- Icono + nombre -->
            <div class="flex items-start gap-3">
              <div
                class="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                :class="ng.allPublished ? 'bg-emerald-50 dark:bg-emerald-950/30' : ng.somePublished ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-zinc-100 dark:bg-zinc-800'"
              >
                <v-icon
                  :icon="moduleIcon(group.module)"
                  size="18"
                  :class="ng.allPublished ? 'text-emerald-600 dark:text-emerald-400' : ng.somePublished ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'"
                />
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-sm text-zinc-900 dark:text-zinc-100 leading-snug">{{ ng.label }}</div>
                <div class="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{{ ng.notifKey }}</div>
              </div>
              <v-icon icon="mdi-chevron-right" size="16" class="text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 shrink-0 mt-0.5" />
            </div>

            <!-- Badges -->
            <div class="flex flex-wrap gap-1 mt-3">
              <!-- Plantillas disponibles (body/pdf) -->
              <span
                v-for="t in ng.templates"
                :key="t.id"
                class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium"
                :class="t.type === 'pdf' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'"
              >
                <v-icon :icon="t.type === 'pdf' ? 'mdi-file-pdf-box' : 'mdi-email-outline'" size="11" />
                {{ t.type === 'pdf' ? 'PDF' : 'Body' }}
              </span>
              <!-- Estado publicación -->
              <span
                v-if="ng.allPublished"
                class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Publicada
              </span>
              <span
                v-else-if="ng.somePublished"
                class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Parcial
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-zinc-400"></span> Borrador
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>
  </div>

  <!-- ── Drawer de variantes ──────────────────────────────────────── -->
  <v-navigation-drawer
    v-model="drawer"
    location="right"
    width="420"
    temporary
    class="dark:bg-zinc-900!"
  >
    <div v-if="activeGroup" class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <div class="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
          <v-icon :icon="moduleIcon(activeGroup.module)" size="18" class="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{{ activeGroup.label }}</div>
          <div class="text-xs text-zinc-400 dark:text-zinc-500 truncate">{{ activeGroup.notifKey }}</div>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="drawer = false" />
      </div>

      <!-- Plantillas base (body / pdf) -->
      <div class="px-4 pt-4">
        <div class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">Plantillas base</div>
        <div class="space-y-2">
          <button
            v-for="t in activeGroup.templates"
            :key="t.id"
            class="w-full group text-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900! px-4 py-3 transition-all hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm"
            @click="editTemplate(t); drawer = false"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <v-icon
                  :icon="t.type === 'pdf' ? 'mdi-file-pdf-box' : 'mdi-email-outline'"
                  size="18"
                  :class="t.type === 'pdf' ? 'text-rose-500 dark:text-rose-400' : 'text-indigo-500 dark:text-indigo-400'"
                />
                <div class="min-w-0">
                  <div class="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{{ t.name }}</div>
                  <div class="text-xs text-zinc-400 dark:text-zinc-500 truncate">{{ t.key }}</div>
                </div>
              </div>
              <v-icon icon="mdi-pencil" size="16" class="text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 shrink-0" />
            </div>
            <div class="flex flex-wrap items-center gap-1.5 mt-2">
              <span class="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {{ t.type === 'pdf' ? 'PDF adjunto' : 'Cuerpo' }}
              </span>
              <span
                v-if="t.published_versions_count > 0"
                class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                {{ t.published_versions_count }} publicada{{ t.published_versions_count === 1 ? '' : 's' }}
              </span>
              <span v-else class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Borrador
              </span>
              <span class="text-[11px] text-zinc-400 dark:text-zinc-500">
                {{ t.versions_count }} versión{{ t.versions_count === 1 ? '' : 'es' }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- Versiones por naviera (line_id) de cada plantilla base -->
      <template v-for="t in activeGroup.templates" :key="`lv-${t.id}`">
        <div v-if="t.line_versions?.length" class="px-4 pt-5">
          <div class="flex items-center gap-1.5 mb-2">
            <div class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Versiones por naviera
              <span class="text-zinc-400 dark:text-zinc-500 font-normal">· {{ t.type === 'pdf' ? 'PDF' : 'Cuerpo' }}</span>
            </div>
            <span class="text-xs text-zinc-400 dark:text-zinc-500">({{ t.line_versions.length }})</span>
          </div>
          <div class="space-y-2">
            <button
              v-for="lv in t.line_versions"
              :key="lv.id"
              class="w-full group text-left rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 px-4 py-3 transition-all hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm"
              @click="editTemplate(t, lv.id); drawer = false"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <v-icon icon="mdi-ferry" size="16" class="text-indigo-400 shrink-0" />
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{{ lv.line_name || 'Naviera #' + lv.line_id }}</div>
                    <div class="text-xs text-zinc-400 dark:text-zinc-500 truncate">v{{ lv.version_number }} · {{ t.key }}</div>
                  </div>
                </div>
                <v-icon icon="mdi-pencil" size="16" class="text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 shrink-0" />
              </div>
              <div class="flex flex-wrap items-center gap-1.5 mt-2">
                <span
                  v-if="lv.status === 'published'"
                  class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Publicada
                </span>
                <span
                  v-else-if="lv.status === 'archived'"
                  class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-zinc-400"></span> Archivada
                </span>
                <span v-else class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                  <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Borrador
                </span>
                <span class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <v-icon icon="mdi-calendar-range" size="11" />
                  {{ formatVigencia(lv.effective_from, lv.effective_to) }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </template>

      <div class="flex-1" />
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
definePageMeta({
  title: `Plantillas de correo`,
  layout: 'default',
})

const { $api } = useNuxtApp()
const router = useRouter()

const templates = ref<any[]>([])
const loading = ref(true)
const search = ref('')

const drawer = ref(false)
const activeGroup = ref<any>(null)

const moduleLabels: Record<string, string> = {
  'sea-import': 'Marítimo · Importación',
  'sea-export': 'Marítimo · Exportación',
  air: 'Aéreo',
  demurrages: 'Demoras',
  detentions: 'Detenciones',
}

const moduleIconMap: Record<string, string> = {
  'sea-import': 'mdi-ferry',
  'sea-export': 'mdi-ferry',
  air: 'mdi-airplane',
  demurrages: 'mdi-timer-sand',
  detentions: 'mdi-lock-clock',
}

const moduleIcon = (mod: string) => moduleIconMap[mod] || 'mdi-email-outline'

const stats = computed(() => ({
  published: templates.value.filter((t) => t.published_versions_count > 0).length,
  drafts: templates.value.filter((t) => t.published_versions_count === 0).length,
}))

/**
 * Derive a "notification type" key from the template key.
 * e.g. "sea-import.notify-arrival" and "sea-import.notify-arrival-pdf"
 * both map to the same type "sea-import.notify-arrival".
 * Strategy: strip a trailing "-pdf" suffix from the key.
 */
const notifKeyOf = (t: any): string => {
  const k: string = t.key ?? ''
  return k.replace(/-pdf$/, '')
}

/** Human-readable label from the template name, stripping " (PDF)" or " PDF" suffixes */
const notifLabelOf = (t: any): string => {
  return (t.name ?? '').replace(/\s*\(?PDF\)?\s*$/i, '').trim()
}

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return templates.value
  return templates.value.filter(
    (t) =>
      (t.name ?? '').toLowerCase().includes(term) ||
      (t.key ?? '').toLowerCase().includes(term) ||
      notifKeyOf(t).toLowerCase().includes(term),
  )
})

/**
 * Groups: module → notification type → templates
 * "base" templates are those without a line_id suffix; others are "variants".
 * For simplicity we treat all as base here since line overrides are version-level
 * (not separate template records at this stage).
 */
const notificationGroups = computed(() => {
  const byNotif: Record<string, any[]> = {}
  for (const t of filtered.value) {
    const nk = notifKeyOf(t)
    ;(byNotif[nk] ??= []).push(t)
  }
  return Object.entries(byNotif).map(([notifKey, items]) => {
    const base = items.find((t) => t.type === 'body') || items[0]
    const allPublished = items.every((t) => t.published_versions_count > 0)
    const somePublished = items.some((t) => t.published_versions_count > 0)
    return {
      notifKey,
      label: notifLabelOf(base),
      module: base.module || 'otros',
      templates: items,
      allPublished,
      somePublished,
    }
  })
})

const moduleGroups = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const ng of notificationGroups.value) {
    ;(groups[ng.module] ??= []).push(ng)
  }
  return Object.entries(groups)
    .map(([module, notifGroups]) => ({
      module,
      label: moduleLabels[module] || module,
      notifGroups: notifGroups.sort((a: any, b: any) => a.label.localeCompare(b.label)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const openDrawer = (ng: any) => {
  activeGroup.value = ng
  drawer.value = true
}

const formatDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })

const formatVigencia = (from?: string | null, to?: string | null) => {
  if (!from && !to) return 'Sin restricción de fecha'
  if (from && !to) return `Desde ${formatDate(from)}`
  if (!from && to) return `Hasta ${formatDate(to)}`
  return `${formatDate(from!)} – ${formatDate(to!)}`
}

const editTemplate = (t: any, versionId?: number) =>
  router.push(
    versionId
      ? `/system/email-templates/edit/${t.id}?versionId=${versionId}`
      : `/system/email-templates/edit/${t.id}`,
  )

const getTemplates = async () => {
  try {
    loading.value = true
    const response = await $api.emailTemplates.list()
    templates.value = (response as any) ?? []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(getTemplates)
</script>
