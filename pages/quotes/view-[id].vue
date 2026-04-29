<template>
  <div class="pa-4 pa-md-10 min-vh-100 bg-main">
    <v-container fluid class="max-w-7xl mx-auto" v-if="quote">
      <v-row class="mb-8">
        <v-col cols="12" class="d-flex justify-space-between align-end flex-wrap gap-4">
          <div class="d-flex align-center">
            <v-btn icon="mdi-arrow-left" variant="tonal" to="/quotes" class="mr-6 rounded-xl shadow-sm border"></v-btn>
            <div>
              <div class="text-caption text-uppercase text-primary font-weight-black letter-spacing-1 mb-1">Comercial / Vista de Cotización</div>
              <h1 class="text-h3 font-weight-black text-main-header mb-0 d-flex align-center">
                {{ quote.quote_number }}
                <v-chip 
                  :color="getStatusColor(quote.status)" 
                  size="small" 
                  class="ml-4 font-weight-bold px-3"
                  variant="flat"
                >
                  {{ formatStatus(quote.status) }}
                </v-chip>
              </h1>
            </div>
          </div>
          <div class="d-flex align-center gap-3">
            <v-btn
              color="secondary"
              variant="flat"
              class="rounded-xl px-6 font-weight-bold h-12 shadow-md"
              prepend-icon="mdi-email-send-outline"
              :loading="sendingEmail"
              @click="sendEmail"
            >
              Enviar por Correo
            </v-btn>
            <v-btn
              color="primary"
              variant="tonal"
              class="rounded-xl px-6 font-weight-bold h-12 shadow-sm border"
              prepend-icon="mdi-pencil-outline"
              :to="`/quotes/${quoteId}`"
            >
              Editar
            </v-btn>
            <v-btn
              variant="tonal"
              class="rounded-xl px-6 font-weight-bold h-12 shadow-sm border"
              prepend-icon="mdi-printer-outline"
            >
              PDF
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <!-- Sidebar Summary -->
        <v-col cols="12" lg="4">
          <v-card class="rounded-xl elevation-0 border overflow-hidden mb-6 sticky-card shadow-xl theme-card">
            <div class="bg-gradient-primary pa-6 text-white">
              <div class="text-overline mb-1 opacity-80">Valor del Embarque</div>
              <div class="text-h4 font-weight-black">
                {{ quote.total_cost ? `$${parseFloat(quote.total_cost).toLocaleString('en-US', {minimumFractionDigits: 2})}` : '—' }}
                <span class="text-subtitle-1 font-weight-medium opacity-80">USD</span>
              </div>
            </div>
            
            <v-card-text class="pa-6">
              <div class="text-subtitle-2 font-weight-bold text-main-header mb-6 uppercase letter-spacing-1">Información General</div>
              
              <v-list density="comfortable" class="bg-transparent pa-0">
                <v-list-item class="px-0 mb-4">
                  <template v-slot:prepend>
                    <v-avatar color="blue-lighten-5" size="44" class="mr-4 rounded-xl border border-blue-lighten-4">
                      <v-icon :icon="quote.impoExpo === 'I' ? 'mdi-tray-arrow-down' : 'mdi-tray-arrow-up'" color="blue-darken-2"></v-icon>
                    </v-avatar>
                  </template>
                  <div class="text-caption text-main-header font-weight-bold">Tipo de Tráfico</div>
                  <div class="text-body-1 font-weight-black">{{ quote.impoExpo === 'I' ? 'Importación' : 'Exportación' }}</div>
                </v-list-item>
                
                <v-list-item class="px-0 mb-4">
                  <template v-slot:prepend>
                    <v-avatar color="teal-lighten-5" size="44" class="mr-4 rounded-xl border border-teal-lighten-4">
                      <v-icon :icon="quote.modality === 'M' ? 'mdi-ferry' : 'mdi-airplane'" color="teal-darken-2"></v-icon>
                    </v-avatar>
                  </template>
                  <div class="text-caption text-main-header font-weight-bold">Modalidad de Transporte</div>
                  <div class="text-body-1 font-weight-black">{{ quote.modality === 'M' ? 'Marítimo' : 'Aéreo' }}</div>
                </v-list-item>

                <v-list-item class="px-0 mb-4">
                  <template v-slot:prepend>
                    <v-avatar color="purple-lighten-5" size="44" class="mr-4 rounded-xl border border-purple-lighten-4">
                      <v-icon icon="mdi-bookmark-check" color="purple-darken-2"></v-icon>
                    </v-avatar>
                  </template>
                  <div class="text-caption text-main-header font-weight-bold">Reserva / Referencia</div>
                  <div class="text-body-1 font-weight-black text-truncate">{{ quote.booking_number || 'PENDIENTE' }}</div>
                </v-list-item>
              </v-list>

              <v-divider class="my-6"></v-divider>

              <div class="text-subtitle-2 font-weight-bold text-main-header mb-4 uppercase letter-spacing-1">Contenedores / Unidades</div>
              <div v-if="quote.containers && quote.containers.length > 0">
                <div v-for="c in quote.containers" :key="c.id" class="d-flex align-center mb-3 bg-main pa-3 rounded-lg border">
                  <v-icon icon="mdi-container" color="primary" class="mr-3"></v-icon>
                  <div>
                    <div class="text-body-2 font-weight-black text-main-header">{{ c.type?.name || 'Estándar' }}</div>
                    <div class="text-caption text-grey">Cant: {{ c.quantity }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-caption text-grey italic">No hay contenedores registrados.</div>

              <v-divider class="my-6"></v-divider>
              
              <div class="text-subtitle-2 font-weight-bold text-main-header mb-4 uppercase letter-spacing-1">Auditoría</div>
              <div class="d-flex align-center mb-3">
                <v-avatar color="grey-lighten-4" size="32" class="mr-3">
                  <v-icon icon="mdi-account-plus-outline" size="small" color="primary"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-caption text-grey">Creado por</div>
                  <div class="text-body-2 font-weight-bold text-main-header">{{ quote.creator?.name || 'Sistema' }}</div>
                  <div class="text-tiny text-grey">{{ formatDateString(quote.created_at) }}</div>
                </div>
              </div>
              <div class="d-flex align-center" v-if="quote.updater">
                <v-avatar color="grey-lighten-4" size="32" class="mr-3">
                  <v-icon icon="mdi-account-edit-outline" size="small" color="primary"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-caption text-grey">Última actualización por</div>
                  <div class="text-body-2 font-weight-bold text-main-header">{{ quote.updater?.name }}</div>
                  <div class="text-tiny text-grey">{{ formatDateString(quote.updated_at) }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="8">
          <!-- Logistics Timeline / Route -->
          <v-card class="rounded-xl elevation-0 border mb-6 theme-card overflow-hidden shadow-sm">
            <v-card-title class="font-weight-black text-h6 pa-6 pb-2 d-flex align-center text-main-header">
              <v-icon icon="mdi-map-marker-path" class="mr-3 text-primary"></v-icon>
              Logística y Ruta
            </v-card-title>
            <v-card-text class="pa-6">
              <div class="route-display d-flex align-center justify-space-between mb-0 pa-6 bg-main rounded-xl border-dashed">
                <div class="text-center flex-1">
                  <div class="text-h5 font-weight-black text-primary">{{ quote.pol?.code || 'POL' }}</div>
                  <div class="text-caption text-grey font-weight-bold">{{ quote.pol?.name || 'Puerto de Carga' }}</div>
                </div>
                <div class="flex-grow-1 mx-6 d-flex align-center justify-center">
                  <div class="h-px bg-primary flex-grow-1 opacity-20"></div>
                  <v-icon :icon="quote.modality === 'M' ? 'mdi-ferry' : 'mdi-airplane'" class="mx-4 text-primary" size="large"></v-icon>
                  <div class="h-px bg-primary flex-grow-1 opacity-20"></div>
                </div>
                <div class="text-center flex-1">
                  <div class="text-h5 font-weight-black text-primary">{{ quote.pod?.code || 'POD' }}</div>
                  <div class="text-caption text-grey font-weight-bold">{{ quote.pod?.name || 'Puerto de Descarga' }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Customer Information -->
          <v-card class="rounded-xl elevation-0 border mb-6 theme-card shadow-sm">
            <v-card-title class="font-weight-black text-h6 pa-6 pb-2 d-flex align-center text-main-header">
              <v-icon icon="mdi-account-box-outline" class="mr-3 text-primary"></v-icon>
              Detalles del Cliente
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row align="center">
                <v-col cols="12" md="auto">
                  <v-avatar color="primary" size="80" class="rounded-xl shadow-lg">
                    <span class="text-h4 font-weight-black text-white">
                      {{ quote.customer?.name ? quote.customer.name.substring(0,2).toUpperCase() : 'NC' }}
                    </span>
                  </v-avatar>
                </v-col>
                <v-col cols="12" md="true">
                  <div class="text-h5 font-weight-black text-main-header">{{ quote.customer?.name || 'Nuevo Cliente Potencial' }}</div>
                  <div class="text-body-1 text-grey d-flex align-center mt-1">
                    <v-icon icon="mdi-email-outline" size="small" class="mr-2"></v-icon>
                    {{ quote.new_customer_email || quote.customer?.email || 'Sin correo registrado' }}
                  </div>
                  <div v-if="quote.manual_notification_email" class="text-caption text-primary font-weight-bold mt-1 d-flex align-center">
                    <v-icon icon="mdi-email-send-outline" size="x-small" class="mr-1"></v-icon>
                    Correo de notificación manual: {{ quote.manual_notification_email }}
                  </div>
                  <v-chip v-if="quote.is_new_customer" color="orange-darken-2" size="small" variant="flat" class="mt-3 font-weight-bold px-4">PROSPECTO / LEAD</v-chip>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Detalles de la Cotización / Cargos -->
          <v-card class="rounded-xl elevation-0 border mb-6 theme-card shadow-sm" v-if="quote.route?.costs?.length > 0">
            <v-card-title class="font-weight-black text-h6 pa-6 pb-2 d-flex align-center text-main-header">
              <v-icon icon="mdi-format-list-bulleted" class="mr-3 text-primary"></v-icon>
              Detalles de la Cotización (Cargos)
            </v-card-title>
            <v-card-text class="pa-0">
              <v-table hover class="bg-transparent">
                <thead>
                  <tr class="table-header-bg">
                    <th class="text-left font-weight-bold py-4">Concepto</th>
                    <th class="text-center font-weight-bold">Monto</th>
                    <th class="text-center font-weight-bold">Tipo</th>
                    <th class="text-right font-weight-bold">Total (Est.)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cost in quote.route.costs" :key="cost.id" class="hover-row">
                    <td class="py-4">
                      <div class="font-weight-bold text-body-1 text-main-header">{{ cost.charge?.name || 'Cargo' }}</div>
                      <div class="text-caption text-grey">{{ cost.charge?.code }}</div>
                    </td>
                    <td class="text-center font-weight-bold text-body-1 text-main-header">
                      ${{ parseFloat(cost.amount).toLocaleString() }}
                    </td>
                    <td class="text-center">
                      <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-bold">
                        {{ cost.type === 'per_bl' ? 'POR BL' : 'POR UNIDAD' }}
                      </v-chip>
                    </td>
                    <td class="text-right font-weight-black text-primary">
                      ${{ parseFloat(cost.amount).toLocaleString() }}
                    </td>
                  </tr>
                  <tr class="table-header-bg">
                    <td colspan="3" class="text-right font-weight-bold py-4 text-main-header">Subtotal Estimado</td>
                    <td class="text-right font-weight-black text-h6 text-primary">
                      ${{ parseFloat(quote.total_cost || 0).toLocaleString() }} <span class="text-caption">USD</span>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <v-container v-else-if="loading" class="fill-height justify-center">
      <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
    </v-container>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatDateString } from '~/utils/formatters'

const route = useRoute()
const quoteId = route.params.id as string
const quote = ref<any>(null)
const loading = ref(true)
const snackbar = useSnackbar()
const { $api } = useNuxtApp()
const sendingEmail = ref(false)

async function sendEmail() {
  sendingEmail.value = true
  try {
    await $api.quotes.sendEmail(quoteId)
    snackbar.add({ type: 'success', text: 'Correo enviado exitosamente' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error al enviar el correo' })
  } finally {
    sendingEmail.value = false
  }
}

async function fetchQuote() {
  loading.value = true
  try {
    const data: any = await $api.quotes.getQuoteById(quoteId)
    quote.value = data
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error al cargar la cotización' })
  } finally {
    loading.value = false
  }
}

function getStatusColor(status: string) {
  switch(status) {
    case 'pending': return 'warning'
    case 'auth_requested': return 'info'
    case 'approved': return 'success'
    case 'completed': return 'teal'
    case 'rejected': return 'error'
    case 'converted': return 'primary'
    default: return 'grey'
  }
}

function formatStatus(status: string) {
  if (!status) return 'DESCONOCIDO'
  const labels: any = {
    'pending': 'PENDIENTE',
    'auth_requested': 'AUTORIZACIÓN SOLICITADA',
    'approved': 'APROBADO',
    'completed': 'COMPLETADO',
    'rejected': 'RECHAZADO',
    'converted': 'CONVERTIDO'
  }
  return labels[status] || status.replace('_', ' ').toUpperCase()
}

onMounted(() => {
  fetchQuote()
})
</script>

