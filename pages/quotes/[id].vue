<template>
  <div class="pa-4 pa-md-10 min-vh-100 bg-main">
    <v-container fluid class="max-w-7xl mx-auto" v-if="quote">
      <v-row class="mb-8">
        <v-col cols="12" class="d-flex justify-space-between align-end flex-wrap gap-4">
          <div class="d-flex align-center">
            <v-btn icon="mdi-arrow-left" variant="tonal" to="/quotes" class="mr-6 rounded-xl shadow-sm border"></v-btn>
            <div>
              <div class="text-caption text-uppercase text-primary font-weight-black letter-spacing-1 mb-1">Comercial / Cotización</div>
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
              v-if="quote.status === 'approved' || quote.status === 'pending'"
              color="primary"
              variant="flat"
              class="rounded-xl px-8 font-weight-bold h-12 shadow-md"
              prepend-icon="mdi-check-all"
              :loading="completing"
              @click="completeQuote"
            >
              Finalizar Cotización
            </v-btn>
            <v-btn
              variant="tonal"
              class="rounded-xl px-6 font-weight-bold h-12 shadow-sm border"
              prepend-icon="mdi-printer-outline"
            >
              Imprimir PDF
            </v-btn>
            <v-btn
              color="secondary"
              variant="flat"
              class="rounded-xl px-6 font-weight-bold h-12 shadow-md"
              :prepend-icon="quote.modality === 'M' ? 'mdi-ferry' : 'mdi-airplane'"
              :loading="sendingEmail"
              @click="sendEmail"
            >
              Enviar por Correo
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <!-- Sidebar Summary -->
        <v-col cols="12" lg="4">
          <v-card class="rounded-xl elevation-0 border overflow-hidden mb-6 sticky-card shadow-xl theme-card">
            <div class="bg-gradient-primary pa-6 text-white">
              <div class="text-overline mb-1 opacity-80">Valor de la Cotización</div>
              <div class="text-h4 font-weight-black">
                {{ quote.total_cost ? `$${parseFloat(quote.total_cost).toLocaleString('en-US', {minimumFractionDigits: 2})}` : '$0.00' }}
                <span class="text-subtitle-1 font-weight-medium opacity-80">USD</span>
              </div>
            </div>
            
            <v-card-text class="pa-6">
              <div class="d-flex justify-space-between align-center mb-6">
                <div class="text-subtitle-2 font-weight-bold text-main-header uppercase letter-spacing-1">Información General</div>
                <v-btn
                  v-if="!editGeneralMode"
                  icon="mdi-pencil-outline"
                  variant="text"
                  size="small"
                  color="primary"
                  @click="editGeneralMode = true"
                ></v-btn>
                <div v-else class="d-flex gap-2">
                  <v-btn icon="mdi-close" variant="text" size="small" color="error" @click="editGeneralMode = false"></v-btn>
                  <v-btn icon="mdi-check" variant="flat" size="small" color="success" :loading="savingGeneral" @click="saveGeneralInfo"></v-btn>
                </div>
              </div>
              
              <v-list density="comfortable" class="bg-transparent pa-0" v-if="!editGeneralMode">
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
                  <div class="text-caption text-main-header font-weight-bold">Referencia / Reserva</div>
                  <div class="text-body-1 font-weight-black text-truncate">{{ quote.booking_number || 'PENDIENTE' }}</div>
                </v-list-item>

                <v-list-item class="px-0 mb-4" v-if="quote.new_customer_email">
                  <template v-slot:prepend>
                    <v-avatar color="orange-lighten-5" size="44" class="mr-4 rounded-xl border border-orange-lighten-4">
                      <v-icon icon="mdi-email-outline" color="orange-darken-2"></v-icon>
                    </v-avatar>
                  </template>
                  <div class="text-caption text-main-header font-weight-bold">Email de Notificación</div>
                  <div class="text-body-1 font-weight-black text-truncate">{{ quote.new_customer_email }}</div>
                </v-list-item>
              </v-list>

              <div v-else class="pa-0">
                <v-select
                  v-model="editForm.impoExpo"
                  :items="[{title:'Importación', value:'I'}, {title:'Exportación', value:'E'}]"
                  label="Tipo de Tráfico"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4 rounded-xl"
                  hide-details
                ></v-select>
                <v-select
                  v-model="editForm.modality"
                  :items="[{title:'Marítimo', value:'M'}, {title:'Aéreo', value:'A'}]"
                  label="Modalidad"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4 rounded-xl"
                  hide-details
                ></v-select>
                <v-text-field
                  v-model="editForm.booking_number"
                  label="Número de Reserva (Booking)"
                  variant="outlined"
                  density="comfortable"
                  class="rounded-xl mb-4"
                  hide-details
                ></v-text-field>

                <div class="text-subtitle-2 font-weight-bold text-main-header mb-2 uppercase">Selección de Cliente</div>
                <v-btn-toggle v-model="editForm.is_new_customer" mandatory color="primary" density="compact" class="mb-4">
                  <v-btn :value="false" size="small">Existente</v-btn>
                  <v-btn :value="true" size="small">Nuevo</v-btn>
                </v-btn-toggle>

                <ACustomerSearch v-if="!editForm.is_new_customer" v-model="editForm.customer_id" label="Buscar Cliente" class="mb-4" />
                
                <v-text-field
                  v-model="editForm.manual_notification_email"
                  label="Email de Notificación (Prueba)"
                  variant="outlined"
                  density="comfortable"
                  class="rounded-xl mb-4"
                  prepend-inner-icon="mdi-email-send-outline"
                  hide-details
                  placeholder="ejemplo@correo.com"
                  hint="Este correo se usará para enviar la cotización"
                  persistent-hint
                ></v-text-field>
                
                <v-btn color="primary" block class="rounded-xl mt-4 font-weight-bold" :loading="savingGeneral" @click="saveGeneralInfo">
                  Guardar Información
                </v-btn>
              </div>

              <v-divider class="my-6"></v-divider>

              <div class="d-flex justify-space-between align-center mb-4">
                <div class="text-subtitle-2 font-weight-bold text-main-header uppercase letter-spacing-1">Contenedores / Unidades</div>
                <v-btn v-if="quote.status === 'pending'" icon="mdi-pencil" size="x-small" variant="tonal" color="primary" @click="openContainerDialog"></v-btn>
              </div>
              <div v-if="quote.containers && quote.containers.length > 0">
                <div v-for="c in quote.containers" :key="c.id" class="d-flex align-center mb-3 bg-surface border pa-4 rounded-xl shadow-sm">
                  <v-avatar color="primary" size="32" class="mr-4">
                    <v-icon icon="mdi-container" color="white" size="small"></v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-body-1 font-weight-black text-main-header">{{ c.type?.name || 'Estándar' }}</div>
                    <div class="text-caption text-primary font-weight-bold">Cantidad: {{ c.quantity }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-caption text-grey italic font-weight-bold">No hay contenedores registrados.</div>

              <v-divider class="my-6"></v-divider>
              
              <div class="text-subtitle-2 font-weight-bold text-primary mb-4 uppercase letter-spacing-1">Información de Auditoría</div>
              <div class="d-flex align-center mb-3">
                <v-avatar color="primary-lighten-5" size="32" class="mr-3">
                  <v-icon icon="mdi-account-plus-outline" size="small" color="primary"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-caption text-main-header font-weight-bold">Creado por</div>
                  <div class="text-body-2 font-weight-bold">{{ quote.creator?.name || 'Sistema' }}</div>
                  <div class="text-caption text-grey">{{ formatDateString(quote.created_at) }}</div>
                </div>
              </div>
              <div class="d-flex align-center" v-if="quote.updater">
                <v-avatar color="primary-lighten-5" size="32" class="mr-3">
                  <v-icon icon="mdi-account-edit-outline" size="small" color="primary"></v-icon>
                </v-avatar>
                <div>
                  <div class="text-caption text-main-header font-weight-bold">Última actualización por</div>
                  <div class="text-body-2 font-weight-bold">{{ quote.updater?.name }}</div>
                  <div class="text-caption text-grey">{{ formatDateString(quote.updated_at) }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="8">
          <!-- Logistics Timeline / Route -->
          <v-card class="rounded-xl elevation-0 border mb-6  overflow-hidden shadow-sm">
            <v-card-title class="font-weight-black text-h6 pa-6 pb-2 d-flex align-center">
              <v-icon icon="mdi-map-marker-path" class="mr-3 text-primary"></v-icon>
              Logística y Ruta
            </v-card-title>
            <v-card-text class="pa-6">
              <div class="route-display d-flex align-center justify-space-between mb-8 pa-6 bg-surface border rounded-xl shadow-sm">
                <div class="text-center flex-1">
                  <div class="text-h4 font-weight-black text-primary mb-1">{{ quote.pol?.code || 'POL' }}</div>
                  <div class="text-caption text-main-header font-weight-bold uppercase">{{ quote.pol?.name || 'Puerto de Carga' }}</div>
                </div>
                <div class="flex-grow-1 mx-4 d-flex align-center justify-center relative">
                  <div class="h-px bg-primary flex-grow-1 opacity-20"></div>
                  <v-avatar color="primary" size="48" class="mx-4 shadow-md">
                    <v-icon :icon="quote.modality === 'M' ? 'mdi-ferry' : 'mdi-airplane'" color="white" size="small"></v-icon>
                  </v-avatar>
                  <div class="h-px bg-primary flex-grow-1 opacity-20"></div>
                </div>
                <div class="text-center flex-1">
                  <div class="text-h4 font-weight-black text-primary mb-1">{{ quote.pod?.code || 'POD' }}</div>
                  <div class="text-caption text-main-header font-weight-bold uppercase">{{ quote.pod?.name || 'Puerto de Destino' }}</div>
                </div>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <APortSearch v-model="form.pol_id" label="Puerto de Carga (POL)" />
                </v-col>
                <v-col cols="12" md="6">
                  <APortSearch v-model="form.pod_id" label="Puerto de Descarga (POD)" />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="form.executive_id"
                    :items="executives"
                    item-title="name"
                    item-value="id"
                    label="Ejecutivo Responsable"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-tie-outline"
                    class="rounded-xl"
                  ></v-select>
                </v-col>
              </v-row>
              <div class="d-flex justify-end mt-4">
                <v-btn color="primary" variant="tonal" class="px-8 rounded-xl font-weight-bold" :loading="saving" @click="saveLogistics">
                  Actualizar Logística
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Información del Cliente -->
          <v-card class="rounded-xl elevation-0 border mb-6 shadow-sm">
            <v-card-title class="font-weight-black text-h6 pa-6 pb-2 d-flex align-center">
              <v-icon icon="mdi-account-box-outline" class="mr-3 text-primary"></v-icon>
              Detalles del Cliente
            </v-card-title>
            <v-card-text class="pa-6">
              <v-row align="center">
                <v-col cols="12" md="auto">
                  <v-avatar color="primary-lighten-5" size="80" class="rounded-xl border-2 border-primary">
                    <span class="text-h4 font-weight-black text-primary">
                      {{ quote.customer?.name ? quote.customer.name.substring(0,2).toUpperCase() : 'NC' }}
                    </span>
                  </v-avatar>
                </v-col>
                <v-col cols="12" md="true">
                  <div class="text-h5 font-weight-black text-main-header">{{ quote.customer?.name || 'Nuevo Cliente Potencial' }}</div>
                  <div class="text-body-1 text-grey d-flex align-center">
                    <v-icon :icon="quote.modality === 'M' ? 'mdi-ferry' : 'mdi-airplane'" size="small" class="mr-2"></v-icon>
                    {{ quote.customer?.email || quote.new_customer_email || 'Sin correo proporcionado' }}
                  </div>
                  <v-chip v-if="quote.is_new_customer" color="orange-darken-2" size="small" variant="flat" class="mt-3 font-weight-bold px-4">PROSPECTO (LEAD)</v-chip>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Gestión de Costos (Moderno) -->
          <v-card class="rounded-xl elevation-0 border mb-6 shadow-xl theme-card overflow-hidden">
            <div class="bg-gradient-primary pa-6 text-white d-flex justify-space-between align-center">
              <div>
                <div class="text-overline mb-1 opacity-80">Gestión de Costos</div>
                <div class="text-h5 font-weight-black d-flex align-center">
                  <v-icon :icon="quote.modality === 'M' ? 'mdi-ferry' : 'mdi-airplane'" class="mr-2"></v-icon>
                  Cargos de la Cotización
                </div>
              </div>
              <v-btn color="white" variant="flat" prepend-icon="mdi-plus" class="rounded-xl font-weight-black text-primary" @click="openAddChargeDialog">
                Añadir Cargo
              </v-btn>
            </div>
            
            <v-card-text class="pa-0">
              <v-table hover v-if="quote.route?.costs?.length > 0" class="bg-transparent">
                <thead>
                  <tr class="bg-surface-variant" style="--v-bg-opacity: 0.05">
                    <th class="text-left font-weight-bold py-4 pl-6">Concepto</th>
                    <th class="text-center font-weight-bold">Monto</th>
                    <th class="text-center font-weight-bold">Tipo</th>
                    <th class="text-right font-weight-bold pr-6">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cost in quote.route.costs" :key="cost.id">
                    <td class="py-4 pl-6">
                      <div class="font-weight-bold text-body-1 text-main-header">{{ cost.charge?.name || 'Cargo' }}</div>
                      <div class="text-caption text-grey">{{ cost.charge?.code }}</div>
                    </td>
                    <td class="text-center font-weight-bold text-body-1">
                      ${{ parseFloat(cost.amount).toLocaleString() }}
                    </td>
                    <td class="text-center">
                      <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-bold">
                        {{ cost.type === 'per_bl' ? 'POR BL' : 'POR UNIDAD' }}
                      </v-chip>
                    </td>
                    <td class="text-right font-weight-black text-primary pr-6">
                      ${{ parseFloat(cost.amount).toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <div v-else class="pa-12 text-center">
                <v-avatar color="primary-lighten-5" size="80" class="mb-4">
                  <v-icon icon="mdi-cash-plus" size="40" color="primary"></v-icon>
                </v-avatar>
                <h3 class="text-h6 font-weight-bold mb-2">Sin Cargos Registrados</h3>
                <p class="text-body-2 text-grey mb-6">Comienza a construir tu cotización añadiendo los conceptos necesarios.</p>
                <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" class="rounded-xl px-8" @click="openAddChargeDialog">
                  Añadir Primer Cargo
                </v-btn>
              </div>
              
              <v-divider></v-divider>
              <div class="pa-6 d-flex justify-end bg-surface-variant" style="--v-bg-opacity: 0.02">
                <div class="text-right">
                  <div class="text-caption text-grey font-weight-bold uppercase mb-1">Subtotal Estimado</div>
                  <div class="text-h4 font-weight-black text-primary">
                    ${{ parseFloat(quote.total_cost || 0).toLocaleString() }} 
                    <span class="text-subtitle-2 font-weight-medium">USD</span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Operations: Convert to Reference -->
          <v-card class="rounded-xl elevation-0 border mb-6 bg-blue-grey-lighten-5 border-blue-grey-lighten-3 shadow-sm">
            <v-card-title class="font-weight-black text-h6 pa-6 pb-2 text-blue-grey-darken-4 d-flex align-center">
              <v-icon icon="mdi-rocket-launch-outline" class="mr-3"></v-icon>
              Traspaso Operativo (Referencia)
            </v-card-title>
            <v-card-text class="pa-6">
              <div v-if="quote.status !== 'completed' && quote.status !== 'approved'" class="text-center py-4">
                <v-icon icon="mdi-lock-outline" color="blue-grey-lighten-1" size="large" class="mb-2"></v-icon>
                <div class="text-body-2 text-blue-grey-darken-1 font-weight-bold">
                  Este módulo se habilitará una vez que la cotización sea completada o aprobada.
                </div>
              </div>
              <v-row align="center" v-else>
                <v-col cols="12" sm="8">
                  <v-text-field
                    v-model="mblNumber"
                    label="Número de MBL / AWB"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-barcode-scan"
                    placeholder="Ej. MAEU123456789"
                    hide-details
                    class="rounded-xl shadow-sm bg-white"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn 
                    color="blue-grey-darken-4" 
                    @click="registerMbl" 
                    :loading="converting" 
                    :disabled="!mblNumber"
                    size="x-large"
                    block
                    class="rounded-xl font-weight-black elevation-2"
                  >
                    Convertir a Ref.
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Container Edit Dialog -->
      <v-dialog v-model="showContainerDialog" max-width="600px">
        <v-card class="rounded-xl overflow-hidden">
          <v-card-title class="bg-primary text-white pa-6 d-flex justify-space-between align-center">
            <span class="text-h5 font-weight-bold">Editar Contenedores / Unidades</span>
            <v-btn icon="mdi-close" variant="text" @click="showContainerDialog = false"></v-btn>
          </v-card-title>
          
          <v-card-text class="pa-6 bg-surface">
            <div v-for="(cont, index) in editedContainers" :key="index" class="d-flex align-center gap-3 mb-4 pa-4 rounded-xl border bg-main">
              <div class="flex-grow-1">
                <AContainerTypeSearch v-model="cont.container_type_id" label="Tipo" />
              </div>
              <div style="width: 100px;">
                <v-text-field v-model="cont.quantity" type="number" label="Cant." variant="outlined" density="comfortable" hide-details></v-text-field>
              </div>
              <v-btn icon="mdi-trash-can-outline" variant="text" color="error" @click="removeContainer(index)"></v-btn>
            </div>
            
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" block class="rounded-xl mt-2 font-weight-bold" @click="addContainer">Añadir Contenedor</v-btn>
          </v-card-text>

          <v-card-actions class="pa-6 border-top">
            <v-spacer></v-spacer>
            <v-btn variant="text" color="grey" @click="showContainerDialog = false">Cancelar</v-btn>
            <v-btn color="primary" variant="flat" class="px-8 rounded-xl font-weight-bold" :loading="saving" @click="saveContainers">Guardar Cambios</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Manual Charge Dialog -->
      <v-dialog v-model="showAddChargeDialog" max-width="500px">
        <v-card class="rounded-xl overflow-hidden shadow-xl border">
          <v-card-title class="bg-primary text-white pa-6 d-flex justify-space-between align-center">
            <span class="text-h5 font-weight-bold">Añadir Cargo Manual</span>
            <v-btn icon="mdi-close" variant="text" @click="showAddChargeDialog = false"></v-btn>
          </v-card-title>
          
          <v-card-text class="pa-6 bg-surface">
            <AChargeSearch v-model="addChargeForm.charge_id" label="Seleccionar Concepto" class="mb-4" />
            
            <v-text-field
              v-model="addChargeForm.amount"
              label="Monto (USD)"
              type="number"
              variant="outlined"
              density="comfortable"
              class="mb-4 rounded-xl"
              prepend-inner-icon="mdi-currency-usd"
              hide-details
            ></v-text-field>
            
            <v-select
              v-model="addChargeForm.type"
              :items="[{title:'Por BL', value:'per_bl'}, {title:'Por Unidad / Contenedor', value:'per_unit'}]"
              label="Tipo de Aplicación"
              variant="outlined"
              density="comfortable"
              class="rounded-xl"
              hide-details
            ></v-select>
          </v-card-text>

          <v-card-actions class="pa-6 border-top">
            <v-spacer></v-spacer>
            <v-btn variant="text" color="grey" @click="showAddChargeDialog = false">Cancelar</v-btn>
            <v-btn color="primary" variant="flat" class="px-8 rounded-xl font-weight-bold shadow-md" :loading="addingCharge" @click="saveManualCharge">Guardar Cargo</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>

    <v-container v-else-if="loading" class="fill-height justify-center">
      <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const { $api } = useNuxtApp()
const route = useRoute()
const quoteId = route.params.id as string
const quote = ref<any>(null)
const loading = ref(true)
const snackbar = useSnackbar()

// Register in system tabs
watch(quote, (newQuote) => {
  if (newQuote) {
    useSystemTab({
      page: `${newQuote.quote_number}`,
      pageIcon: 'mdi-file-document-outline'
    })
  }
}, { immediate: true })

const pdfFile = ref(null)
const uploading = ref(false)

const requestedCost = ref('')
const requesting = ref(false)

const mblNumber = ref('')
const converting = ref(false)
const completing = ref(false)
const sendingEmail = ref(false)

const showAddChargeDialog = ref(false)
const addChargeForm = ref({
  charge_id: null as number | null,
  amount: '',
  type: 'per_unit'
})
const addingCharge = ref(false)

const form = ref({
  pol_id: null,
  pod_id: null,
  executive_id: null as number | null
})
const saving = ref(false)
const executives = ref([])

async function fetchExecutives() {
  try {
    const data: any = await $api.users.getUsers()
    executives.value = data || []
    
    // Auto-select if current user is an executive and no executive is assigned
    const { user: authUser } = useCheckUser()
    if (!form.value.executive_id && authUser.value) {
      // Check if user has executive role or just use ID if they are logged in
      form.value.executive_id = authUser.value.id
    }
  } catch (e) {
    console.error(e)
  }
}

// General Info Editing
const editGeneralMode = ref(false)
const savingGeneral = ref(false)
const editForm = ref({
  impoExpo: '',
  modality: '',
  booking_number: '',
  customer_id: null as number | null,
  is_new_customer: false,
  manual_notification_email: ''
})

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

function openAddChargeDialog() {
  addChargeForm.value = {
    charge_id: null,
    amount: '',
    type: 'per_unit'
  }
  showAddChargeDialog.value = true
}

async function saveManualCharge() {
  if (!addChargeForm.value.charge_id || !addChargeForm.value.amount) {
    snackbar.add({ type: 'warning', text: 'Por favor complete todos los campos' })
    return
  }
  
  addingCharge.value = true
  try {
    const newCosts = [...(quote.value.route.costs || [])].map(c => ({
      charge_id: c.charge_id,
      amount: c.amount,
      type: c.type
    }))
    
    newCosts.push({
      charge_id: addChargeForm.value.charge_id,
      amount: addChargeForm.value.amount,
      type: addChargeForm.value.type
    })
    
    await $api.quoteRoutes.updateRoute(quote.value.quote_route_id, {
      costs: newCosts
    })
    
    snackbar.add({ type: 'success', text: 'Cargo añadido correctamente' })
    showAddChargeDialog.value = false
    await fetchQuote()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error al añadir el cargo' })
  } finally {
    addingCharge.value = false
  }
}

async function fetchQuote() {
  loading.value = true
  try {
    const data: any = await $api.quotes.getQuoteById(quoteId)
    quote.value = data
    form.value.pol_id = data.pol_id || null
    form.value.pod_id = data.pod_id || null
    form.value.executive_id = data.executive_id || null
    
    // Initialize edit form
    editForm.value.impoExpo = data.impoExpo
    editForm.value.modality = data.modality
    editForm.value.booking_number = data.booking_number || ''
    editForm.value.customer_id = data.customer_id || null
    editForm.value.is_new_customer = data.is_new_customer || false
    editForm.value.manual_notification_email = data.manual_notification_email || ''
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error al cargar la cotización' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchQuote()
  fetchExecutives()
})

async function saveGeneralInfo() {
  savingGeneral.value = true
  try {
    await $api.quotes.updateQuote(quoteId, editForm.value)
    snackbar.add({ type: 'success', text: 'Información general actualizada con éxito' })
    editGeneralMode.value = false
    await fetchQuote()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error al actualizar la información general' })
  } finally {
    savingGeneral.value = false
  }
}

async function saveLogistics() {
  saving.value = true
  try {
    await $api.quotes.updateQuote(quoteId, form.value)
    snackbar.add({ type: 'success', text: 'Logistics details saved successfully' })
    await fetchQuote()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Failed to save logistics details' })
  } finally {
    saving.value = false
  }
}

async function uploadPdf() {
  if (!pdfFile.value) return
  uploading.value = true
  
  const formData = new FormData()
  // Vuetify v-file-input uses array in some versions, or direct File
  const file = Array.isArray(pdfFile.value) ? pdfFile.value[0] : pdfFile.value
  formData.append('pdf', file)
  
  try {
    const data: any = await $api.quotes.uploadCostsPdf(quoteId, formData)
    snackbar.add({ type: 'success', text: `Extracted cost: $${data?.extracted_cost}` })
    await fetchQuote()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Failed to upload PDF' })
  } finally {
    uploading.value = false
    pdfFile.value = null
  }
}

async function requestAuth() {
  if (!requestedCost.value) return
  requesting.value = true
  try {
    await $api.quotes.requestAuthorization(quoteId, { requested_cost: requestedCost.value })
    snackbar.add({ type: 'success', text: 'Authorization requested' })
    await fetchQuote()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Failed to request authorization' })
  } finally {
    requesting.value = false
  }
}

async function registerMbl() {
  if (!mblNumber.value) return
  converting.value = true
  try {
    await $api.quotes.registerMbl(quoteId, { mbl_number: mblNumber.value })
    snackbar.add({ type: 'success', text: 'MBL registered and Reference created' })
    await fetchQuote()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Failed to register MBL' })
  } finally {
    converting.value = false
  }
}

async function completeQuote() {
  if (!confirm('¿Estás seguro de marcar esta cotización como completada? Se enviará un correo automático al cliente.')) return
  completing.value = true
  try {
    await $api.quotes.complete(quoteId)
    snackbar.add({ type: 'success', text: 'Cotización completada exitosamente' })
    await fetchQuote()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error al completar la cotización' })
  } finally {
    completing.value = false
  }
}

const showContainerDialog = ref(false)
const editedContainers = ref([])

function openContainerDialog() {
  editedContainers.value = JSON.parse(JSON.stringify(quote.value.containers || []))
  showContainerDialog.value = true
}

function addContainer() {
  editedContainers.value.push({
    container_type_id: null,
    quantity: 1
  })
}

function removeContainer(index: number) {
  editedContainers.value.splice(index, 1)
}

async function saveContainers() {
  saving.value = true
  try {
    await $api.quotes.updateQuote(quoteId, {
      ...quote.value,
      containers: editedContainers.value
    })
    snackbar.add({ type: 'success', text: 'Contenedores actualizados' })
    showContainerDialog.value = false
    await fetchQuote()
  } catch (e) {
    snackbar.add({ type: 'error', text: 'Error al actualizar contenedores' })
  } finally {
    saving.value = false
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
  if (!status) return 'Unknown'
  return status.replace('_', ' ').toUpperCase()
}

onMounted(() => {
  fetchQuote()
})
</script>
