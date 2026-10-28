<template>
  <v-dialog :model-value="modelValue" persistent max-width="1400px" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>Ref#{{ referencia.reference_number }} Send demurrages cut</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="5">
            <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-2">
              <div class="text-subtitle-2">Containers to include</div>
              <div class="d-flex ga-2">
                <v-btn size="x-small" variant="outlined" :disabled="!actionableIds.length" @click="selectActionable">
                  Select pending ({{ actionableIds.length }})
                </v-btn>
                <v-btn size="x-small" variant="outlined" @click="selected = containers.map((c) => c.id)">All</v-btn>
                <v-btn size="x-small" variant="outlined" @click="selected = []">None</v-btn>
              </div>
            </div>

            <v-table density="compact">
              <thead>
                <tr>
                  <th class="w-8"></th>
                  <th>Container</th>
                  <th>Cálculo</th>
                  <th class="text-right">Total USD</th>
                  <th>Cut</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in containers" :key="c.id">
                  <td><v-checkbox v-model="selected" :value="c.id" color="primary" hide-details density="compact" /></td>
                  <td>{{ c.container_number }}</td>
                  <td>{{ c.demurrage.is_parcial ? 'Parcial' : 'Total' }}</td>
                  <td class="text-right">{{ formatToCurrency(Number(c.demurrage.amount) + Number(c.demurrage.amount_iva)) }}</td>
                  <td><DemurrageCutStatusChip :status="c.demurrage.cut_status" :last-cut="c.demurrage.latest_cut" /></td>
                </tr>
              </tbody>
            </v-table>

            <v-textarea v-model="emails" label="Email(s)" rows="4" class="mt-4" />
          </v-col>

          <v-col cols="12" md="7">
            <v-tabs v-model="previewTab" density="compact" color="primary">
              <v-tab value="email"><v-icon start>mdi-email-outline</v-icon> Email</v-tab>
              <v-tab value="pdf"><v-icon start>mdi-file-pdf-box</v-icon> PDF</v-tab>
            </v-tabs>
            <v-divider />

            <div v-if="!selected.length" class="preview-empty text-medium-emphasis">
              Select at least one container to see the preview
            </div>

            <v-window v-else v-model="previewTab" :touch="false" class="mt-3">
              <v-window-item value="email">
                <v-alert v-if="emailError" type="error" density="compact" variant="tonal" class="mb-2">
                  {{ emailError }}
                </v-alert>
                <template v-if="emailPreview">
                  <div class="preview-meta rounded mb-2">
                    <div class="preview-subject px-4 py-3">
                      <div class="text-subtitle-1 font-weight-medium">{{ emailPreview.subject }}</div>
                      <div class="text-caption text-medium-emphasis mt-1">
                        {{ emailPreview.from.name }} &lt;{{ emailPreview.from.email }}&gt;
                      </div>
                    </div>
                    <v-divider />
                    <div class="px-4 py-2">
                      <div class="preview-row">
                        <span class="preview-label">To</span>
                        <div class="preview-chips">
                          <v-chip v-for="e in visibleList(recipientsTo, 'to')" :key="e" size="small" label>{{ e }}</v-chip>
                          <v-chip
                            v-if="recipientsTo.length > RECIPIENTS_COLLAPSED"
                            size="small"
                            color="primary"
                            variant="tonal"
                            @click="expanded.to = !expanded.to"
                          >
                            {{ expanded.to ? 'Show less' : `+${recipientsTo.length - RECIPIENTS_COLLAPSED} more` }}
                          </v-chip>
                        </div>
                      </div>
                      <div v-if="emailPreview.cc.length" class="preview-row">
                        <span class="preview-label">CC</span>
                        <div class="preview-chips">
                          <v-chip v-for="e in visibleList(emailPreview.cc, 'cc')" :key="e" size="small" label>{{ e }}</v-chip>
                          <v-chip
                            v-if="emailPreview.cc.length > RECIPIENTS_COLLAPSED"
                            size="small"
                            color="primary"
                            variant="tonal"
                            @click="expanded.cc = !expanded.cc"
                          >
                            {{ expanded.cc ? 'Show less' : `+${emailPreview.cc.length - RECIPIENTS_COLLAPSED} more` }}
                          </v-chip>
                        </div>
                      </div>
                      <div class="preview-row">
                        <span class="preview-label">Attached</span>
                        <div class="preview-chips">
                          <v-chip size="small" label prepend-icon="mdi-file-pdf-box" color="error" variant="tonal">
                            {{ emailPreview.attachment_name }}
                          </v-chip>
                        </div>
                      </div>
                    </div>
                  </div>
                  <iframe :srcdoc="emailPreview.html" class="preview-frame" :class="{ 'preview-stale': emailLoading }" />
                </template>
                <v-skeleton-loader v-else-if="emailLoading" type="paragraph, table" />
              </v-window-item>

              <v-window-item value="pdf">
                <v-alert v-if="pdfError" type="error" density="compact" variant="tonal" class="mb-2">
                  {{ pdfError }}
                </v-alert>
                <div v-if="pdfLoading" class="preview-empty text-medium-emphasis">
                  <v-progress-circular indeterminate size="28" class="mr-3" /> Generating PDF…
                </div>
                <object v-else-if="pdfUrl" :data="pdfUrl" type="application/pdf" class="preview-frame" />
              </v-window-item>
            </v-window>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="emit('update:modelValue', false)">Close</v-btn>
        <v-spacer />
        <v-btn color="primary" :disabled="!selected.length" :loading="loadingStore.loading" @click="send">
          Send ({{ selected.length }})
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { hasAtLeastOneValidEmail } = useEmailListValidation()

const props = defineProps<{
  modelValue: boolean
  referencia: any
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'sent'): void
}>()

const emails = ref('')
const selected = ref<number[]>([])

const containers = computed<any[]>(() => (props.referencia?.containers ?? []).filter((c: any) => c.demurrage))

// pending + outdated: los que todavía requieren (re)enviar corte
const actionableIds = computed<number[]>(() =>
  containers.value.filter((c) => c.demurrage.cut_status !== 'sent').map((c) => c.id)
)

const selectActionable = () => {
  selected.value = [...actionableIds.value]
}

// Cada vez que se abre, preseleccionar lo pendiente (o todo si ya está al día)
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    selected.value = actionableIds.value.length ? [...actionableIds.value] : containers.value.map((c) => c.id)
  }
)

// ---- Vista previa: el servidor renderiza el mismo mailable que se envía ----
const previewTab = ref<'email' | 'pdf'>('email')
const emailPreview = ref<any>(null)
const emailLoading = ref(false)
const emailError = ref('')
const pdfUrl = ref<string | null>(null)
const pdfLoading = ref(false)
const pdfError = ref('')

let emailAbort: AbortController | null = null
let pdfAbort: AbortController | null = null

const RECIPIENTS_COLLAPSED = 3
const expanded = reactive({ to: false, cc: false })
const visibleList = (list: string[], key: 'to' | 'cc') =>
  expanded[key] ? list : list.slice(0, RECIPIENTS_COLLAPSED)

const errorMessage = (e: any) => e?.data?.message ?? 'Could not generate the preview'

const loadEmailPreview = async () => {
  emailAbort?.abort()
  if (!props.modelValue || !selected.value.length) return
  const abort = (emailAbort = new AbortController())
  emailLoading.value = true
  emailError.value = ''
  try {
    emailPreview.value = await $api.demurrages.previewEmailCut(String(props.referencia.id), selected.value, {
      signal: abort.signal,
    })
  } catch (e: any) {
    if (abort.signal.aborted) return
    emailError.value = errorMessage(e)
  } finally {
    if (emailAbort === abort) emailLoading.value = false
  }
}

const revokePdf = () => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
  pdfUrl.value = null
}

const loadPdfPreview = async () => {
  pdfAbort?.abort()
  if (!props.modelValue || !selected.value.length) return
  const abort = (pdfAbort = new AbortController())
  pdfLoading.value = true
  pdfError.value = ''
  try {
    const response = await $api.demurrages.showPdfCut(String(props.referencia.id), selected.value, {
      signal: abort.signal,
    })
    revokePdf()
    pdfUrl.value = URL.createObjectURL(new Blob([response as any], { type: 'application/pdf' }))
  } catch (e: any) {
    if (abort.signal.aborted) return
    pdfError.value = errorMessage(e)
  } finally {
    if (pdfAbort === abort) pdfLoading.value = false
  }
}

const debounce = (fn: () => void, ms: number) => {
  let timer: ReturnType<typeof setTimeout> | undefined
  const run = () => {
    clearTimeout(timer)
    timer = setTimeout(fn, ms)
  }
  run.cancel = () => clearTimeout(timer)
  return run
}
const debouncedEmailPreview = debounce(loadEmailPreview, 400)
const debouncedPdfPreview = debounce(loadPdfPreview, 400)

// Destinatarios: los del catálogo vienen del servidor; los escritos se mezclan al vuelo
const recipientsTo = computed<string[]>(() => {
  const typed = emails.value
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
  return [...new Set([...typed, ...(emailPreview.value?.to ?? [])])]
})

watch(selected, () => {
  // El PDF depende de la selección: se descarta y solo se regenera si su pestaña está activa
  revokePdf()
  pdfAbort?.abort()
  debouncedPdfPreview.cancel()
  pdfLoading.value = false
  if (!selected.value.length) {
    debouncedEmailPreview.cancel()
    emailAbort?.abort()
    emailLoading.value = false
    return
  }
  debouncedEmailPreview()
  if (previewTab.value === 'pdf') debouncedPdfPreview()
})

watch(previewTab, (tab) => {
  if (tab === 'pdf' && !pdfUrl.value && !pdfLoading.value && selected.value.length) loadPdfPreview()
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) return
    debouncedEmailPreview.cancel()
    debouncedPdfPreview.cancel()
    // Vaciar la selección garantiza que al reabrir cambie y dispare la vista previa
    selected.value = []
    emailAbort?.abort()
    pdfAbort?.abort()
    revokePdf()
    emailPreview.value = null
    emailError.value = ''
    pdfError.value = ''
    previewTab.value = 'email'
  }
)

onBeforeUnmount(() => {
  debouncedEmailPreview.cancel()
  debouncedPdfPreview.cancel()
  emailAbort?.abort()
  pdfAbort?.abort()
  revokePdf()
})

const send = async () => {
  if (!selected.value.length) {
    snackbar.add({ type: 'warning', text: 'Select at least one container' })
    return
  }
  if (!hasAtLeastOneValidEmail(emails.value)) {
    snackbar.add({ type: 'warning', text: 'Enter at least one valid email' })
    return
  }
  try {
    loadingStore.loading = true
    const response = (await $api.demurrages.sendEmailDemurrageCut(String(props.referencia.id), {
      emails: emails.value,
      container_ids: selected.value,
    })) as any
    snackbar.add({ type: 'success', text: response.message })
    emails.value = ''
    emit('update:modelValue', false)
    emit('sent')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
<style scoped>
.preview-frame {
  width: 100%;
  height: 62vh;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  background: #fff;
}
.preview-stale {
  opacity: 0.5;
  transition: opacity 0.15s;
}
.preview-meta {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.preview-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 4px 0;
}
.preview-label {
  flex: 0 0 64px;
  padding-top: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.6;
}
.preview-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
}
.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 30vh;
}
</style>
