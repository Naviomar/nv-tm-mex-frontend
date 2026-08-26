<template>
  <div class="mt-1">
    <v-tooltip v-if="hasHistory" location="top" :text="`Sent ${formatDate(lastLog?.occurred_at)} · click for full history`">
      <template #activator="{ props: tooltipProps }">
        <v-chip
          v-bind="tooltipProps"
          size="small"
          variant="flat"
          color="indigo-darken-2"
          class="cursor-pointer font-weight-medium"
          @click="showDialog"
        >
          <v-icon start size="15">mdi-history</v-icon>
          {{ lastLog?.triggered_by?.name ?? 'System' }}
        </v-chip>
      </template>
    </v-tooltip>

    <v-chip v-else-if="polling" size="small" variant="flat" color="grey-darken-1" class="mt-1">
      <v-progress-circular indeterminate size="12" width="2" color="white" class="mr-2" />
      Confirming send…
    </v-chip>

    <!-- Distinguible de "sin historial" (que no renderiza nada, por diseño: solo
    debe aparecer si ya se envió) — un error de red/auth se ve igual a "nunca se
    envió" si no se marca aparte, lo que hace el bug indebuggeable sin abrir devtools. -->
    <v-tooltip v-else-if="fetchFailed" :text="`No se pudo consultar el histórico: ${fetchFailed}`">
      <template #activator="{ props: tooltipProps }">
        <v-chip v-bind="tooltipProps" size="small" color="error" variant="flat">ERROR</v-chip>
      </template>
    </v-tooltip>

    <v-dialog v-model="dialog" max-width="650" scrollable>
      <v-card rounded="lg">
        <v-card-title class="bg-indigo-darken-2 text-white d-flex align-center ga-2 pa-4">
          <v-icon>mdi-history</v-icon>
          <span class="text-h6">Notify Port History</span>
        </v-card-title>
        <v-card-text class="pa-4">
          <div v-if="loading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate color="indigo-darken-2" />
          </div>

          <div v-else-if="!logs.length" class="text-center text-grey-darken-1 py-8">
            No sends recorded for this voyage destination.
          </div>

          <v-timeline v-else density="compact" side="end" truncate-line="both">
            <v-timeline-item v-for="log in logs" :key="log.id" size="small" dot-color="indigo-darken-2">
              <v-card variant="tonal" color="indigo-darken-2" rounded="lg" density="compact" class="pa-3">
                <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-1">
                  <span class="text-caption font-weight-bold">{{ formatDate(log.occurred_at) }}</span>
                  <v-chip v-if="log.status === 'no_recipient'" size="x-small" color="error" variant="flat">
                    No recipient
                  </v-chip>
                </div>
                <div class="text-body-2 d-flex align-center ga-1">
                  <v-icon size="15">mdi-account</v-icon>
                  Sent by <strong>{{ log.triggered_by?.name ?? 'System' }}</strong>
                </div>
                <div v-if="log.to?.length" class="text-caption text-grey-darken-2 d-flex align-center ga-1 mt-1">
                  <v-icon size="15">mdi-email-outline</v-icon>
                  {{ log.to.map((a) => a.address).join(', ') }}
                </div>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import type { IMailLog } from '~/repository/modules/mailLogs'

const { $api } = useNuxtApp()

const props = defineProps<{
  voyageDestId: number | string
  // true cuando esta fila viene de un redirect justo después de enviar un
  // Notify Port — el envío real es async (Mail::queue()), así que el
  // mail_log con related_id puede tardar unos segundos en existir. Dispara
  // un polling corto en vez de mostrar "sin historial" de entrada.
  justSent?: boolean
}>()

const logs = ref<IMailLog[]>([])
// null mientras se resuelve el chequeo inicial — evita mostrar nada hasta
// saber si hay historial o no.
const hasHistory = ref<boolean | null>(null)
const fetchFailed = ref<string | null>(null)
const loading = ref(false)
const dialog = ref(false)
const polling = ref(false)

// voyageDestinationHistory() devuelve de más antiguo a más reciente, así que
// el último elemento es el envío más reciente.
const lastLog = computed(() => logs.value[logs.value.length - 1] ?? null)

const fetchHistory = async (options: { resetState?: boolean } = {}) => {
  if (options.resetState !== false) {
    fetchFailed.value = null
    hasHistory.value = null
    logs.value = []
  }
  try {
    const res = await $api.mailLogs.voyageDestinationHistory(props.voyageDestId)
    logs.value = (res as any)?.data ?? []
    hasHistory.value = logs.value.length > 0
  } catch (e: any) {
    console.error('[VoyageNotifyPortHistory] Failed to fetch history for voyage destination', props.voyageDestId, e)
    logs.value = []
    hasHistory.value = null
    fetchFailed.value = e?.response?.status ? `HTTP ${e.response.status}` : (e?.message ?? 'error desconocido')
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// El envío de Notify Port se procesa en cola (MailLogServiceProvider escribe
// related_id cuando el worker realmente manda el correo, no al encolarlo),
// así que justo después del redirect el historial puede no existir todavía.
// Reintenta unas cuantas veces con espera creciente antes de rendirse.
const pollUntilVisible = async () => {
  polling.value = true
  const delaysMs = [1500, 2000, 3000, 4000]
  for (const delay of delaysMs) {
    await sleep(delay)
    await fetchHistory({ resetState: false })
    if (hasHistory.value) break
  }
  polling.value = false
}

const showDialog = async () => {
  dialog.value = true
  loading.value = true
  await fetchHistory()
  loading.value = false
}

const formatDate = (date?: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(async () => {
  await fetchHistory()
  if (props.justSent && !hasHistory.value) {
    pollUntilVisible()
  }
})

// Red de seguridad: si el padre alguna vez reutiliza esta instancia para otra
// fila (p.ej. un :key inestable), no dejar el historial de la fila anterior
// pegado — refetch en cuanto cambia a qué voyage destination pertenece.
watch(
  () => props.voyageDestId,
  () => fetchHistory()
)
</script>
