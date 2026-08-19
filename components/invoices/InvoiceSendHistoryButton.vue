<template>
  <div>
    <v-tooltip v-if="hasHistory" text="Envío histórico">
      <template v-slot:activator="{ props: tooltipProps }">
        <v-btn
          color="indigo-darken-2"
          size="x-small"
          variant="elevated"
          v-bind="tooltipProps"
          icon="mdi-history"
          @click="open"
        ></v-btn>
      </template>
    </v-tooltip>
    <v-tooltip v-else-if="fetchFailed" :text="`No se pudo consultar el histórico: ${fetchFailed}`">
      <template v-slot:activator="{ props: tooltipProps }">
        <v-chip v-bind="tooltipProps" size="x-small" color="error" variant="tonal">
          ERROR
        </v-chip>
      </template>
    </v-tooltip>
    <v-chip v-else-if="hasHistory === false" size="x-small" color="grey" variant="tonal">
      NOT SENT
    </v-chip>

    <v-dialog v-model="dialogVisible" max-width="650" scrollable>
      <v-card rounded="xl">
        <v-card-title class="bg-indigo-darken-2 text-white d-flex align-center ga-2 pa-4">
          <v-icon>mdi-history</v-icon>
          Envío histórico #{{ invoiceNumber }}
        </v-card-title>

        <v-card-text class="pa-4">
          <div v-if="loading" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <div v-else-if="!logs.length" class="text-center text-grey-darken-1 pa-8">
            Sin envíos registrados para esta factura.
          </div>

          <v-timeline v-else density="compact" side="end" truncate-line="both">
            <v-timeline-item
              v-for="log in logs"
              :key="log.id"
              :dot-color="docTypeColor(log)"
              size="small"
            >
              <div class="d-flex align-center ga-2 flex-wrap">
                <v-chip size="small" :color="docTypeColor(log)" variant="flat">
                  {{ docTypeLabel(log) }}
                </v-chip>
                <v-chip v-if="sourceLabel(log)" size="small" variant="outlined">
                  {{ sourceLabel(log) }}
                </v-chip>
                <v-chip v-if="log.status === 'no_recipient'" size="small" color="error" variant="tonal">
                  Sin destinatario
                </v-chip>
                <span class="text-caption text-grey-darken-1">{{ formatDate(log.occurred_at) }}</span>
              </div>
              <div class="text-caption text-grey-darken-1 mt-1">
                Enviado por {{ log.triggered_by?.name ?? 'Sistema' }}
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>

        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn variant="text" @click="dialogVisible = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { IMailLog } from '~/repository/modules/mailLogs'

const { $api } = useNuxtApp()

const props = defineProps<{
  invoiceId: number
  invoiceNumber?: string | number | null
}>()

const dialogVisible = ref(false)
const loading = ref(false)
const logs = ref<IMailLog[]>([])
// null mientras se resuelve el chequeo inicial (no se sabe todavía si hay
// historial o no) — evita parpadear entre ícono/"NOT SENT" en el primer render.
const hasHistory = ref<boolean | null>(null)
// Distingue "sí se consultó y no hay envíos" (NOT SENT) de "la consulta
// falló" (ERROR) — antes ambos casos se veían idénticos como NOT SENT, lo
// que hacía imposible notar en la UI que una fila estaba fallando en vez de
// genuinamente no tener historial.
const fetchFailed = ref<string | null>(null)

const fetchHistory = async () => {
  fetchFailed.value = null
  try {
    const res = await $api.mailLogs.invoiceHistory(props.invoiceId)
    logs.value = res.data ?? []
    hasHistory.value = logs.value.length > 0
  } catch (e: any) {
    console.error('[InvoiceSendHistory] Failed to fetch history for invoice', props.invoiceId, e)
    logs.value = []
    hasHistory.value = null
    fetchFailed.value = e?.response?.status ? `HTTP ${e.response.status}` : (e?.message ?? 'error desconocido')
  }
}

// Se resuelve una sola vez al montar la fila (decide ícono vs. "NOT SENT");
// abrir el modal reutiliza el mismo resultado en vez de volver a pedirlo.
onMounted(fetchHistory)

const open = async () => {
  dialogVisible.value = true
  if (hasHistory.value === null) {
    loading.value = true
    await fetchHistory()
    loading.value = false
  }
}

const docType = (log: IMailLog): 'proforma' | 'invoice' | 'cfdi' | null => {
  return (log.payload?.doc_type as any) ?? null
}

// Envíos previos a este feature no tienen payload.doc_type (related_id
// tampoco estaba poblado) — se infieren del subject ("Proforma ..." /
// "Invoice ..." / "Invoice CFDI ...") como fallback, mismo texto que ya
// arma cada mailable en su envelope().
const inferredDocType = (log: IMailLog): 'proforma' | 'invoice' | 'cfdi' | null => {
  if (log.mailable_class?.includes('Cfdi')) return 'cfdi'
  if (/^proforma\b/i.test(log.subject ?? '')) return 'proforma'
  if (/^invoice\b/i.test(log.subject ?? '')) return 'invoice'
  return null
}

const docTypeLabel = (log: IMailLog) => {
  const type = docType(log) ?? inferredDocType(log)
  if (type === 'proforma') return 'Proforma enviada'
  if (type === 'cfdi') return 'CFDI enviado'
  if (type === 'invoice') return 'Factura enviada'
  return 'Envío'
}

const docTypeColor = (log: IMailLog) => {
  const type = docType(log) ?? inferredDocType(log)
  if (type === 'proforma') return 'grey-darken-1'
  if (type === 'cfdi') return 'green'
  if (type === 'invoice') return 'primary'
  return 'grey'
}

// El aviso de arribo (Sea/Air) puede llevar adjunta la proforma recién
// generada — se distingue del reenvío manual de la proforma/factura desde
// el catálogo, aunque ambos cuentan como "Proforma enviada".
const sourceLabel = (log: IMailLog) => {
  if (log.mailable_class?.includes('SeaImportNotifyArrival')) return 'Notificación de Arribo'
  if (log.mailable_class?.includes('AirImportNotify')) return 'Notificación de Arribo (Aéreo)'
  return null
}

const formatDate = (date?: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}
</script>
