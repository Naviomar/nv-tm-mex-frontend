<template>
  <!-- Full-width editor shell: sticky topbar + GrapesJS + collapsible settings drawer -->
  <div class="tm-edit-page d-flex flex-column" style="height: 100%; overflow: hidden;">

    <!-- ── Topbar ──────────────────────────────────────────────────── -->
    <div class="d-flex align-center gap-2 px-3 py-2 border-b bg-white dark:bg-zinc-900! flex-wrap border-zinc-200 dark:border-zinc-800" style="min-height:52px;">
      <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left" @click="$router.back()">Volver</v-btn>

      <div class="d-flex align-center gap-2 mr-2">
        <div class="h-7 w-7 rounded-lg d-flex align-center justify-center" :class="template?.type === 'pdf' ? 'bg-rose-50 dark:bg-rose-950/40' : 'bg-indigo-50 dark:bg-indigo-950/40'">
          <v-icon
            :icon="template?.type === 'pdf' ? 'mdi-file-pdf-box' : 'mdi-email-edit-outline'"
            size="16"
            :class="template?.type === 'pdf' ? 'text-rose-500 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'"
          />
        </div>
        <div>
          <div class="text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
            {{ template?.name || 'Plantilla de correo' }}
          </div>
          <div class="text-xs text-zinc-400 dark:text-zinc-500">{{ template?.key }} · {{ template?.type === 'pdf' ? 'PDF adjunto' : 'Cuerpo' }}</div>
        </div>
        <v-chip v-if="working?.status" size="x-small" :color="statusColor(working.status)" label>
          {{ working.status }}
        </v-chip>
      </div>

      <div class="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

      <!-- Device toggle -->
      <v-btn-toggle v-model="device" density="compact" variant="outlined" divided mandatory>
        <v-tooltip text="Vista escritorio">
          <template #activator="{ props: tip }">
            <v-btn v-bind="tip" value="Desktop" size="small" @click="setDevice('Desktop')">
              <v-icon icon="mdi-monitor" size="16" />
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Vista móvil">
          <template #activator="{ props: tip }">
            <v-btn v-bind="tip" value="Mobile" size="small" @click="setDevice('Mobile')">
              <v-icon icon="mdi-cellphone" size="16" />
            </v-btn>
          </template>
        </v-tooltip>
      </v-btn-toggle>

      <div class="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

      <span class="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">{{ autosaveLabel }}</span>

      <v-spacer />

      <!-- Actions -->
      <v-btn size="small" variant="text" prepend-icon="mdi-eye-outline" :loading="previewing" @click="doPreview">
        Preview
      </v-btn>
      <v-btn size="small" variant="text" prepend-icon="mdi-content-save-outline" :loading="saving" @click="save">
        Guardar
      </v-btn>
      <v-btn size="small" variant="tonal" color="amber-darken-2" prepend-icon="mdi-check-decagram-outline" @click="validate">
        Validar
      </v-btn>
      <v-btn
        size="small"
        variant="flat"
        color="primary"
        prepend-icon="mdi-publish"
        :loading="publishing"
        :disabled="working?.status === 'published'"
        @click="publish"
      >
        Publicar
      </v-btn>

      <div class="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

      <v-tooltip text="Configuración de versión">
        <template #activator="{ props: tip }">
          <v-btn v-bind="tip" :icon="settingsDrawer ? 'mdi-chevron-right' : 'mdi-tune'" size="small" variant="text" @click="settingsDrawer = !settingsDrawer" />
        </template>
      </v-tooltip>
    </div>

    <!-- ── Editor + Settings drawer ─────────────────────────────── -->
    <div class="tm-outer-row d-flex" style="flex:1; min-height:0; position:relative; height: calc(100vh - 52px - var(--v-layout-top, 64px) - var(--v-layout-bottom, 36px));">

      <!-- GrapesJS -->
      <div class="tm-outer-flex1 flex-1" style="min-width:0; overflow:hidden; height: calc(100vh - 52px - var(--v-layout-top, 64px) - var(--v-layout-bottom, 36px)) !important;">
        <ClientOnly>
          <EmailTemplateEditor
            v-if="ready"
            :key="editorKey"
            ref="editorRef"
            :initial-html="working.body_html"
            :initial-css="working.body_css"
            :components="draggableComponents"
            :variables="variables"
            @dirty="onEditorDirty"
          />
          <template #fallback>
            <div class="d-flex align-center justify-center text-zinc-500 dark:text-zinc-400 gap-2" style="height:calc(100vh - 128px);">
              <v-progress-circular indeterminate size="24" color="indigo" />
              <span class="text-sm">Cargando editor…</span>
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Settings drawer (right side, inline) -->
      <transition name="slide-right">
        <div
          v-if="settingsDrawer"
          class="tm-settings-panel border-l bg-white dark:bg-zinc-900! overflow-y-auto dark:border-zinc-800"
          style="width:300px; flex-shrink:0;"
        >
          <div class="p-4 space-y-4">

            <!-- Versiones -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <v-icon icon="mdi-history" size="15" class="text-indigo-500 dark:text-indigo-400" />
                <span class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Versiones</span>
              </div>
              <v-select
                v-model="selectedVersionId"
                :items="versionItems"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                @update:model-value="onSelectVersion"
              />
              <div class="flex items-center justify-between mt-2">
                <span
                  class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
                  :class="statusBadgeClass(working?.status)"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClass(working?.status)"></span>
                  {{ statusLabel(working?.status) }}
                </span>
                <div class="flex gap-0.5">
                  <v-tooltip text="Nuevo borrador">
                    <template #activator="{ props: tip }">
                      <v-btn v-bind="tip" icon="mdi-content-duplicate" size="x-small" variant="text" @click="newDraftFromSelected" />
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Duplicar (servidor)" v-if="working?.id">
                    <template #activator="{ props: tip }">
                      <v-btn v-bind="tip" icon="mdi-content-copy" size="x-small" variant="text" :loading="duplicating" @click="doDuplicate" />
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Comparar vs. publicada" v-if="working?.id">
                    <template #activator="{ props: tip }">
                      <v-btn v-bind="tip" icon="mdi-vector-difference" size="x-small" variant="text" @click="doDiff" />
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Archivar" v-if="working?.id && working?.status !== 'archived'">
                    <template #activator="{ props: tip }">
                      <v-btn v-bind="tip" icon="mdi-archive-outline" size="x-small" variant="text" color="rose" @click="doArchive" />
                    </template>
                  </v-tooltip>
                </div>
              </div>
            </div>

            <div class="border-t border-zinc-200 dark:border-zinc-800 my-4"></div>

            <!-- Aplicación -->
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <v-icon icon="mdi-filter-variant" size="15" class="text-indigo-500 dark:text-indigo-400" />
                <span class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Aplicación</span>
              </div>
              <v-select
                v-model="working.line_id"
                :items="lineItems"
                item-title="name"
                item-value="id"
                label="Naviera (vacío = base)"
                density="compact"
                variant="outlined"
                clearable
                hide-details
                prepend-inner-icon="mdi-ferry"
              />
              <div class="grid grid-cols-2 gap-2">
                <v-text-field
                  v-model="working.effective_from"
                  label="Desde"
                  type="date"
                  density="compact"
                  variant="outlined"
                  hide-details
                />
                <v-text-field
                  v-model="working.effective_to"
                  label="Hasta"
                  type="date"
                  density="compact"
                  variant="outlined"
                  hide-details
                />
              </div>
              <p class="text-xs text-zinc-400 dark:text-zinc-500 leading-snug">
                Prioridad de envío: naviera + fecha vigente → base + fecha vigente → plantilla original en archivo.
              </p>
            </div>

            <!-- Asunto / Preheader -->
            <template v-if="template?.type === 'body'">
              <div class="border-t border-zinc-200 dark:border-zinc-800 my-4"></div>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <v-icon icon="mdi-email-outline" size="15" class="text-indigo-500 dark:text-indigo-400" />
                  <span class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Asunto / Preheader</span>
                </div>
                <v-text-field
                  v-model="working.subject"
                  label="Asunto"
                  density="compact"
                  variant="outlined"
                  :hint="subjectTokensHint"
                  persistent-hint
                />
                <div v-if="subjectPreview" class="rounded-md bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  <span class="font-semibold text-zinc-400 dark:text-zinc-500">Vista previa: </span>{{ subjectPreview }}
                </div>
                <v-text-field v-model="working.preheader" label="Preheader" density="compact" variant="outlined" hide-details />
              </div>

              <div class="border-t border-zinc-200 dark:border-zinc-800 my-4"></div>
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <v-icon icon="mdi-format-header-1" size="15" class="text-indigo-500 dark:text-indigo-400" />
                  <span class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Encabezado visual</span>
                </div>
                <p class="text-xs text-zinc-400 dark:text-zinc-500 leading-snug">
                  Título y subtítulo mostrados dentro del cuerpo del correo (no son el asunto del inbox).
                </p>
                <v-text-field v-model="working.header_title" label="Título del encabezado" density="compact" variant="outlined" hide-details />
                <v-text-field v-model="working.header_subtitle" label="Subtítulo del encabezado" density="compact" variant="outlined" hide-details />
              </div>
            </template>

            <div class="border-t border-zinc-200 dark:border-zinc-800 my-4"></div>

            <!-- Vista previa -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <v-icon icon="mdi-eye-outline" size="15" class="text-indigo-500 dark:text-indigo-400" />
                <span class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Vista previa</span>
              </div>
              <v-text-field
                v-model="sampleReferenceQuery"
                label="Referencia (ej. MXIM26-0677)"
                density="compact"
                variant="outlined"
                :hint="sampleReferenceLabel || resolveRefError || ' '"
                persistent-hint
                :error="!!resolveRefError"
                prepend-inner-icon="mdi-pound"
                :loading="resolvingRef"
                @change="resolveRef"
                @keydown.enter.prevent="resolveRef"
              />
              <v-btn block size="small" color="primary" variant="tonal" prepend-icon="mdi-eye-outline" :loading="previewing" @click="doPreview">
                Generar vista previa
              </v-btn>
              <v-btn block size="small" variant="text" prepend-icon="mdi-send-outline" @click="testDialog = true">
                Enviar correo de prueba
              </v-btn>
              <v-btn block size="small" variant="text" prepend-icon="mdi-code-tags" @click="codeDialog = true">
                Ver código HTML
              </v-btn>
            </div>

          </div>
        </div>
      </transition>
    </div>

    <!-- Validación -->
    <v-dialog v-model="validationDialog" max-width="560">
      <v-card class="rounded-xl dark:bg-zinc-900!">
        <div class="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div class="flex items-center gap-2">
            <v-icon icon="mdi-check-decagram-outline" size="20" class="text-amber-500 dark:text-amber-400" />
            <span class="text-base font-semibold dark:text-zinc-100">Resultado de validación</span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="validationDialog = false" />
        </div>
        <div class="p-4" v-if="validation">
          <div v-if="validation.errors?.length" class="mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 p-3">
            <div class="flex items-center gap-1.5 text-sm font-semibold text-rose-700 dark:text-rose-300 mb-1.5">
              <v-icon icon="mdi-alert-circle-outline" size="16" /> Errores ({{ validation.errors.length }})
            </div>
            <ul class="list-disc ml-5 text-sm text-rose-700 dark:text-rose-300 space-y-0.5">
              <li v-for="(e, i) in validation.errors" :key="`err-${i}`">{{ e }}</li>
            </ul>
          </div>
          <div v-if="validation.warnings?.length" class="mb-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
            <div class="flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1.5">
              <v-icon icon="mdi-alert-outline" size="16" /> Advertencias ({{ validation.warnings.length }})
            </div>
            <ul class="list-disc ml-5 text-sm text-amber-700 dark:text-amber-300 space-y-0.5">
              <li v-for="(w, i) in validation.warnings" :key="`warn-${i}`">{{ w }}</li>
            </ul>
          </div>
          <div v-if="!validation.errors?.length && !validation.warnings?.length" class="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3">
            <v-icon icon="mdi-check-circle-outline" size="16" />
            Sin problemas detectados. Lista para publicar.
          </div>
        </div>
        <div class="flex justify-end gap-2 p-3 border-t border-zinc-100 dark:border-zinc-800">
          <v-btn variant="text" @click="validationDialog = false">Cerrar</v-btn>
          <v-btn
            v-if="validation && !validation.errors?.length"
            color="primary"
            variant="flat"
            prepend-icon="mdi-publish"
            :loading="publishing"
            @click="validationDialog = false; publish()"
          >
            Publicar ahora
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Preview -->
    <v-dialog v-model="previewDialog" max-width="900">
      <v-card class="rounded-xl overflow-hidden dark:bg-zinc-900!">
        <div class="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800">
          <div class="flex items-center gap-2">
            <v-icon icon="mdi-eye-outline" size="20" class="text-indigo-500 dark:text-indigo-400" />
            <span class="text-base font-semibold dark:text-zinc-100">Vista previa con datos reales</span>
          </div>
          <div class="flex items-center gap-1">
            <v-btn-toggle v-model="previewDevice" density="compact" variant="outlined" divided mandatory>
              <v-btn value="desktop" size="x-small"><v-icon icon="mdi-monitor" size="16" /></v-btn>
              <v-btn value="mobile" size="x-small"><v-icon icon="mdi-cellphone" size="16" /></v-btn>
            </v-btn-toggle>
            <v-btn icon="mdi-close" variant="text" size="small" @click="previewDialog = false" />
          </div>
        </div>
        <div class="bg-zinc-100 dark:bg-zinc-950 flex justify-center py-4" style="height: 74vh; overflow: auto;">
          <iframe
            v-if="previewHtml"
            :srcdoc="previewHtml"
            class="bg-white shadow-sm transition-all"
            :style="previewDevice === 'mobile' ? 'width:390px;height:100%;border:0;' : 'width:100%;max-width:760px;height:100%;border:0;'"
          ></iframe>
        </div>
      </v-card>
    </v-dialog>

    <!-- Código HTML -->
    <v-dialog v-model="codeDialog" max-width="800">
      <v-card class="rounded-xl dark:bg-zinc-900!">
        <div class="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800">
          <div class="flex items-center gap-2">
            <v-icon icon="mdi-code-tags" size="20" class="text-indigo-500 dark:text-indigo-400" />
            <span class="text-base font-semibold dark:text-zinc-100">Código HTML del cuerpo</span>
          </div>
          <div class="flex items-center gap-2">
            <v-btn size="small" variant="tonal" prepend-icon="mdi-content-copy" @click="copyCode">Copiar</v-btn>
            <v-btn icon="mdi-close" variant="text" size="small" @click="codeDialog = false" />
          </div>
        </div>
        <pre class="p-4 text-xs overflow-auto bg-zinc-900 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-200" style="max-height: 65vh;"><code>{{ working.body_html || '(vacío)' }}</code></pre>
      </v-card>
    </v-dialog>

    <!-- Diff vs publicada -->
    <v-dialog v-model="diffDialog" max-width="1000">
      <v-card class="rounded-xl dark:bg-zinc-900!">
        <div class="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800">
          <div class="flex items-center gap-2">
            <v-icon icon="mdi-vector-difference" size="20" class="text-indigo-500 dark:text-indigo-400" />
            <span class="text-base font-semibold dark:text-zinc-100">Comparar contra versión base publicada</span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="diffDialog = false" />
        </div>
        <div class="grid grid-cols-2 gap-0" v-if="diffResult">
          <div class="p-3 border-r border-zinc-100 dark:border-zinc-800">
            <div class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
              Actual (v{{ diffResult.current?.version_number }})
            </div>
            <iframe :srcdoc="diffResult.current?.body_html || ''" class="w-full bg-white dark:border-zinc-700" style="height: 60vh; border: 1px solid #e4e4e7; border-radius: 8px;"></iframe>
          </div>
          <div class="p-3">
            <div class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
              <template v-if="diffResult.published">Publicada (v{{ diffResult.published.version_number }})</template>
              <template v-else>No hay versión base publicada</template>
            </div>
            <iframe
              v-if="diffResult.published"
              :srcdoc="diffResult.published.body_html || ''"
              class="w-full bg-white dark:border-zinc-700"
              style="height: 60vh; border: 1px solid #e4e4e7; border-radius: 8px;"
            ></iframe>
            <div v-else class="h-[60vh] flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
              Sin referencia para comparar
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- Test send -->
    <v-dialog v-model="testDialog" max-width="480">
      <v-card class="rounded-xl p-4 space-y-3 dark:bg-zinc-900!">
        <div class="flex items-center gap-2">
          <v-icon icon="mdi-send-outline" size="20" class="text-indigo-500 dark:text-indigo-400" />
          <span class="text-base font-semibold dark:text-zinc-100">Enviar correo de prueba</span>
        </div>
        <v-text-field
          v-model="testEmail"
          label="Correo destino"
          type="email"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-email-outline"
        />
        <div class="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5">
          <v-icon icon="mdi-information-outline" size="14" class="mt-0.5 shrink-0" />
          Se usará el contenido actual del editor y la referencia de muestra configurada.
        </div>
        <div class="flex justify-end gap-2">
          <v-btn variant="text" @click="testDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-send-outline" :loading="testing" @click="doTestSend">Enviar</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: `Editar plantilla de correo`,
  layout: 'default',
})

const { $api } = useNuxtApp()
const route = useRoute()
const loadingStore = useLoadingStore()

const templateId = Number(route.params.id)

const template = ref<any>(null)
const versions = ref<any[]>([])
const components = ref<any[]>([])

// El panel de bloques arrastrables solo debe ofrecer componentes genéricos
// (scope "global"): texto, alertas, espaciadores, bancos, etc. Los de scope
// "sea-import" (reference-details, containers-table, charges-table, y los
// "*-content" extraídos de cada vista) dependen de una Referencia real con
// sus relaciones cargadas; ya vienen insertados en el body_html base de cada
// plantilla y el editor los resuelve ahí — arrastrarlos sueltos sin esos
// datos los rompe.
const draggableComponents = computed(() => components.value.filter((c) => c.scope === 'global'))
const variables = ref<any[]>([])
const lines = ref<any[]>([])

const ready = ref(false)
const editorKey = ref(0)
const editorRef = ref<any>(null)

const selectedVersionId = ref<number | 'new' | null>(null)
const working = ref<any>(emptyWorking())

const device = ref('Desktop')
const sampleReferenceId = ref<number | null>(null)
const sampleReferenceQuery = ref('')
const sampleReferenceLabel = ref('')
const resolvingRef = ref(false)
const resolveRefError = ref('')

const saving = ref(false)
const publishing = ref(false)
const previewing = ref(false)
const testing = ref(false)
const duplicating = ref(false)

const validationDialog = ref(false)
const validation = ref<any>(null)
const previewDialog = ref(false)
const previewHtml = ref<string>('')
const previewDevice = ref<'desktop' | 'mobile'>('desktop')
const testDialog = ref(false)
const testEmail = ref('')
const codeDialog = ref(false)
const diffDialog = ref(false)
const diffResult = ref<any>(null)
const lastSavedAt = ref<Date | null>(null)
const dirty = ref(false)
const settingsDrawer = ref(true)

function emptyWorking() {
  return {
    id: undefined as number | undefined,
    status: 'draft',
    line_id: null,
    effective_from: null,
    effective_to: null,
    subject: '',
    header_title: '',
    header_subtitle: '',
    preheader: '',
    body_html: '',
    body_css: '',
  }
}

const lineItems = computed(() => [{ id: null, name: 'Base (todas las navieras)' }, ...lines.value])

const versionItems = computed(() => {
  const items = versions.value.map((v) => ({
    value: v.id,
    label: `v${v.version_number} · ${v.status}${v.line ? ' · ' + v.line.name : ' · base'}`,
  }))
  return items
})

const statusColor = (status: string) => {
  if (status === 'published') return 'green'
  if (status === 'archived') return 'grey'
  return 'amber'
}

const statusLabel = (status?: string) => {
  if (status === 'published') return 'Publicada'
  if (status === 'archived') return 'Archivada'
  return 'Borrador'
}

const statusBadgeClass = (status?: string) => {
  if (status === 'published') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
  if (status === 'archived') return 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
  return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
}

const statusDotClass = (status?: string) => {
  if (status === 'published') return 'bg-emerald-500'
  if (status === 'archived') return 'bg-zinc-400'
  return 'bg-amber-500'
}

const autosaveLabel = computed(() => {
  if (saving.value) return 'Guardando…'
  if (dirty.value) return 'Cambios sin guardar'
  if (lastSavedAt.value) return `Guardado ${lastSavedAt.value.toLocaleTimeString()}`
  return ''
})

const subjectTokensHint = computed(() => {
  const tokens = (variables.value || [])
    .filter((v: any) => v.group === 'Referencia' || v.token?.startsWith('ref.'))
    .slice(0, 6)
    .map((v: any) => `{{ ${v.token} }}`)
  if (!tokens.length) return 'Admite variables {{ variable }}'
  return `Variables: ${tokens.join(', ')}`
})

const subjectPreview = computed(() => {
  let subject = working.value.subject || ''
  if (!subject) return ''

  // Replace common tokens with dummy values for preview
  const dummyMap: Record<string, string> = {
    'ref.reference_number': 'MXIM26-0677',
    'ref.consignee.name': 'Cliente Demo SA',
    'ref.voyage_discharge.print_bl_name': 'MSC GULSUN',
    'user.name': 'Usuario Demo',
  }
  for (const [token, value] of Object.entries(dummyMap)) {
    subject = subject.replace(new RegExp(`\\{\\{\\s*${token.replace(/\./g, '\\.')}\\s*\\}\\}`, 'g'), value)
  }
  // Replace any remaining {{ ... }} with placeholder
  subject = subject.replace(/\{\{\s*[^}]+\s*\}\}/g, '…')

  return subject
})

const onEditorDirty = () => { dirty.value = true }

const remountEditor = () => {
  ready.value = false
  editorKey.value++
  nextTick(() => { ready.value = true })
}

const setVersionToWorking = (v: any) => {
  working.value = {
    id: v.id,
    status: v.status,
    line_id: v.line_id ?? null,
    effective_from: v.effective_from ? String(v.effective_from).slice(0, 10) : null,
    effective_to: v.effective_to ? String(v.effective_to).slice(0, 10) : null,
    subject: v.subject ?? '',
    header_title: v.header_title ?? '',
    header_subtitle: v.header_subtitle ?? '',
    preheader: v.preheader ?? '',
    body_html: v.body_html ?? '',
    body_css: v.body_css ?? '',
  }
  remountEditor()
}

const onSelectVersion = (id: any) => {
  const v = versions.value.find((x) => x.id === id)
  if (v) setVersionToWorking(v)
}

const newDraftFromSelected = () => {
  const base = versions.value.find((x) => x.id === selectedVersionId.value) || versions.value[0]
  working.value = {
    ...emptyWorking(),
    line_id: base?.line_id ?? null,
    subject: base?.subject ?? '',
    header_title: base?.header_title ?? '',
    header_subtitle: base?.header_subtitle ?? '',
    preheader: base?.preheader ?? '',
    body_html: base?.body_html ?? '',
    body_css: base?.body_css ?? '',
  }
  selectedVersionId.value = 'new'
  remountEditor()
}

const pullEditor = () => {
  const data = editorRef.value?.getData?.()
  if (data) {
    working.value.body_html = data.html
    working.value.body_css = data.css
  }
  return working.value
}

const payloadFromWorking = () => ({
  line_id: working.value.line_id || null,
  effective_from: working.value.effective_from || null,
  effective_to: working.value.effective_to || null,
  subject: working.value.subject || null,
  header_title: working.value.header_title || null,
  header_subtitle: working.value.header_subtitle || null,
  preheader: working.value.preheader || null,
  body_html: working.value.body_html || null,
  body_css: working.value.body_css || null,
})

const save = async () => {
  try {
    saving.value = true
    pullEditor()
    let result: any
    if (working.value.id) {
      result = await $api.emailTemplates.updateVersion(working.value.id, payloadFromWorking())
    } else {
      result = await $api.emailTemplates.createVersion(templateId, payloadFromWorking())
    }
    await reload()
    if (result?.id) {
      selectedVersionId.value = result.id
      const v = versions.value.find((x) => x.id === result.id)
      if (v) setVersionToWorking(v)
    }
    lastSavedAt.value = new Date()
    dirty.value = false
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

const doDuplicate = async () => {
  if (!working.value.id) return
  try {
    duplicating.value = true
    const copy: any = await $api.emailTemplates.duplicateVersion(working.value.id)
    await reload()
    if (copy?.id) {
      selectedVersionId.value = copy.id
      const v = versions.value.find((x) => x.id === copy.id)
      if (v) setVersionToWorking(v)
    }
  } catch (e) {
    console.error(e)
  } finally {
    duplicating.value = false
  }
}

const doArchive = async () => {
  if (!working.value.id) return
  if (!confirm('¿Archivar esta versión? Dejará de poder editarse.')) return
  try {
    await $api.emailTemplates.archiveVersion(working.value.id)
    await reload()
    const v = versions.value.find((x) => x.id === working.value.id)
    if (v) setVersionToWorking(v)
  } catch (e) {
    console.error(e)
  }
}

const doDiff = async () => {
  if (!working.value.id) return
  try {
    diffResult.value = await $api.emailTemplates.diffVersion(working.value.id)
    diffDialog.value = true
  } catch (e) {
    console.error(e)
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(working.value.body_html || '')
  } catch (e) {
    console.error(e)
  }
}

const validate = async () => {
  if (!working.value.id) { await save() }
  if (!working.value.id) return
  try {
    validation.value = await $api.emailTemplates.validateVersion(working.value.id)
    validationDialog.value = true
  } catch (e) {
    console.error(e)
  }
}

const publish = async () => {
  if (!working.value.id) { await save() }
  if (!working.value.id) return
  try {
    publishing.value = true
    await $api.emailTemplates.publishVersion(working.value.id)
    await reload()
  } catch (e: any) {
    console.error(e)
    alert(e?.response?._data?.message || 'No se pudo publicar la versión.')
  } finally {
    publishing.value = false
  }
}

const setDevice = (d: string) => editorRef.value?.setDevice?.(d)

const doPreview = async () => {
  try {
    previewing.value = true
    pullEditor()
    const res: any = await $api.emailTemplates.preview(templateId, {
      reference_id: sampleReferenceId.value || null,
      subject: working.value.subject || null,
      header_title: working.value.header_title || null,
      header_subtitle: working.value.header_subtitle || null,
      body_html: working.value.body_html || null,
      body_css: working.value.body_css || null,
    })
    previewHtml.value = res?.html || ''
    previewDialog.value = true
  } catch (e: any) {
    console.error(e)
    alert(e?.response?._data?.message || 'No se pudo generar la vista previa.')
  } finally {
    previewing.value = false
  }
}

const resolveRef = async () => {
  const q = sampleReferenceQuery.value.trim()
  if (!q) {
    sampleReferenceId.value = null
    sampleReferenceLabel.value = ''
    resolveRefError.value = ''
    return
  }
  try {
    resolvingRef.value = true
    resolveRefError.value = ''
    sampleReferenceLabel.value = ''
    const res: any = await $api.emailTemplates.resolveReference(q)
    sampleReferenceId.value = res.id
    sampleReferenceLabel.value = `Ref. ${res.reference_number} (ID: ${res.id})`
  } catch (e: any) {
    sampleReferenceId.value = null
    resolveRefError.value = e?.response?._data?.message || 'Referencia no encontrada'
  } finally {
    resolvingRef.value = false
  }
}

const doTestSend = async () => {
  try {
    testing.value = true
    pullEditor()
    await $api.emailTemplates.testSend(templateId, {
      email: testEmail.value,
      reference_id: sampleReferenceId.value || null,
      subject: working.value.subject || null,
      header_title: working.value.header_title || null,
      header_subtitle: working.value.header_subtitle || null,
      body_html: working.value.body_html || null,
      body_css: working.value.body_css || null,
    })
    testDialog.value = false
    alert('Correo de prueba enviado.')
  } catch (e: any) {
    console.error(e)
    alert(e?.response?._data?.message || 'No se pudo enviar el correo de prueba.')
  } finally {
    testing.value = false
  }
}

const reload = async () => {
  const tpl: any = await $api.emailTemplates.show(templateId)
  template.value = tpl
  versions.value = tpl.versions ?? []
}

const init = async () => {
  try {
    loadingStore.start()
    const [tpl, vars, comps, lns] = await Promise.all([
      $api.emailTemplates.show(templateId),
      $api.emailTemplates.variables(templateId),
      $api.emailTemplates.components(),
      $api.lines.getLines(),
    ])
    template.value = tpl
    versions.value = (tpl as any).versions ?? []
    variables.value = (vars as any) ?? []
    components.value = (comps as any) ?? []
    lines.value = ((lns as any)?.data ?? lns ?? []) as any[]

    // Selección inicial: si viene un versionId explícito en la URL (ej. desde
    // el drawer de "versiones por naviera"), respetarlo. Si no, borrador más
    // reciente o última versión.
    const requestedVersionId = Number(route.query.versionId)
    const requested = requestedVersionId
      ? versions.value.find((v) => v.id === requestedVersionId)
      : null
    const draft = versions.value.find((v) => v.status === 'draft')
    const initial = requested || draft || versions.value[0]
    if (initial) {
      selectedVersionId.value = initial.id
      setVersionToWorking(initial)
    } else {
      newDraftFromSelected()
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

onMounted(init)
</script>

<style scoped>
/* Slide-right transition for the settings drawer */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-right-enter-from,
.slide-right-leave-to {
  width: 0 !important;
  opacity: 0;
}
.slide-right-enter-to,
.slide-right-leave-from {
  width: 300px;
  opacity: 1;
}
</style>
