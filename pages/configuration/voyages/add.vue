<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="goBack">
      <v-icon start>mdi-arrow-left</v-icon>
      Back to voyages
    </v-btn>

    <div class="flex items-center gap-4 mb-4">
      <h1 class="text-xl font-bold">New voyage</h1>
      <div class="flex items-center gap-2 flex-1 max-w-xl">
        <v-btn
          color="indigo"
          variant="tonal"
          prepend-icon="mdi-radar"
          size="default"
          class="font-bold text-xs"
          @click="openTrackingDialog"
        >
          Ver tracking automático
        </v-btn>
      </div>
    </div>

    <v-expand-transition>
      <v-alert
        v-if="trackingApplied"
        type="info"
        density="compact"
        closable
        class="mb-4"
        @click:close="trackingApplied = false"
      >
        <span class="font-bold">Tracking data applied:</span> {{ trackingApplied }}
      </v-alert>
    </v-expand-transition>

    <v-card>
      <v-card-title>
        <h2 class="text-xl font-bold">Add voyage for import or export and add at least one origin/destination.</h2>
      </v-card-title>
      <v-card-text>
        <VoyageForm ref="voyageFormRef" />
      </v-card-text>
    </v-card>

    <!-- Tracking Dialog -->
    <v-dialog v-model="trackingDialog" max-width="1000px" scrollable>
      <v-card class="bg-white dark:bg-[#09090b] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col tracking-dialog">
        
        <!-- HEADER -->
        <div class="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/30 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/60 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <v-icon size="small" class="animate-pulse">mdi-radar</v-icon>
            </div>
            <div>
              <div class="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-0.5">
                Pre-registro de viajes
              </div>
              <h3 class="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                Viajes de Tracking Automático
                <span class="inline-flex items-center h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
              </h3>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" class="text-zinc-400 dark:text-zinc-500" @click="trackingDialog = false" />
        </div>

        <!-- BODY -->
        <v-card-text class="p-6 bg-white dark:bg-[#09090b] overflow-y-auto max-h-[65vh]">
          
          <div v-if="loadingTracking" class="flex flex-col items-center justify-center py-16">
            <v-progress-circular indeterminate color="indigo" size="32" width="3" />
            <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-4 font-bold uppercase tracking-widest">Consultando pre-registros...</p>
          </div>

          <div v-else-if="trackingVoyages.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center mb-4 text-zinc-400 dark:text-zinc-500">
              <v-icon size="24">mdi-package-variant</v-icon>
            </div>
            <p class="font-bold text-zinc-800 dark:text-zinc-300 text-sm">Sin viajes pendientes</p>
            <p class="text-xs text-zinc-500 mt-1 max-w-sm leading-relaxed">
              Todos los viajes detectados por el tracking ya fueron confirmados o no se han sincronizado nuevos datos.
            </p>
          </div>

          <div v-else class="border border-zinc-200 dark:border-zinc-800/85 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950/20">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <th class="py-3.5 px-4 font-bold uppercase tracking-wider">Barco / Vessel</th>
                  <th class="py-3.5 px-4 font-bold uppercase tracking-wider">Viaje / Voyage</th>
                  <th class="py-3.5 px-4 font-bold uppercase tracking-wider">Puerto / Port</th>
                  <th class="py-3.5 px-4 font-bold uppercase tracking-wider">ETA</th>
                  <th class="py-3.5 px-4 font-bold uppercase tracking-wider">Tipo / Type</th>
                  <th class="py-3.5 px-4 font-bold uppercase tracking-wider">Línea / Line</th>
                  <th class="py-3.5 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200/60 dark:divide-zinc-800/50">
                <tr
                  v-for="(item, idx) in trackingVoyages"
                  :key="`tracking-dlg-${idx}`"
                  class="transition-colors duration-200"
                  :class="!item.already_registered ? 'hover:bg-zinc-50/80 dark:hover:bg-zinc-900/35 cursor-pointer' : 'opacity-80 bg-zinc-50/50 dark:bg-zinc-900/20'"
                  @click="!item.already_registered ? selectTrackingVoyage(item) : null"
                >
                  <!-- Barco -->
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <v-icon size="14" class="text-zinc-400 dark:text-zinc-500">mdi-sail-boat</v-icon>
                      <span class="font-bold text-zinc-800 dark:text-zinc-200">{{ item.barco }}</span>
                    </div>
                  </td>
                  
                  <!-- Viaje -->
                  <td class="py-3 px-4 font-mono font-semibold text-zinc-600 dark:text-zinc-400">{{ item.viaje }}</td>
                  
                  <!-- Puerto -->
                  <td class="py-3 px-4 text-zinc-500 dark:text-zinc-400">{{ item.puerto || '—' }}</td>
                  
                  <!-- ETA -->
                  <td class="py-3 px-4 font-mono">
                    <span v-if="item.eta" class="text-zinc-700 dark:text-zinc-300 font-semibold">{{ item.eta }}</span>
                    <span v-else-if="item.already_registered" class="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded border border-blue-200/30 font-bold">
                      <v-icon size="10">mdi-account-check</v-icon> Creado por {{ item.creator_name || 'Usuario' }}
                    </span>
                    <span v-else class="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-200/30 font-bold">
                      <v-icon size="10">mdi-clock-alert-outline</v-icon> Requerido
                    </span>
                  </td>
                  
                  <!-- Tipo -->
                  <td class="py-3 px-4">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border"
                      :class="item.id_srv === 'IM' 
                        ? 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/30' 
                        : 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/30'"
                    >
                      {{ item.id_srv === 'IM' ? 'Importación' : 'Exportación' }}
                    </span>
                  </td>
                  
                  <!-- Línea -->
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: item.id_linea === 1 ? '#ea580c' : '#0d9488' }"></span>
                      <span class="text-zinc-600 dark:text-zinc-400">{{ item.linea }}</span>
                    </div>
                  </td>
                  
                  <!-- Acciones -->
                  <td class="py-3 px-4 text-right">
                    <button
                      v-if="!item.already_registered"
                      type="button"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-lg shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900/50 dark:focus:ring-white/50"
                      @click.stop="selectTrackingVoyage(item)"
                    >
                      <v-icon size="14">mdi-download</v-icon> Cargar
                    </button>
                    <span v-else class="text-[10px] font-bold text-zinc-400">Ya Registrado</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const voyageFormRef = ref<any>(null)
const trackingApplied = ref<string | false>(false)

const trackingDialog = ref(false)
const trackingVoyages = ref<any[]>([])
const loadingTracking = ref(false)

const openTrackingDialog = async () => {
  trackingDialog.value = true
  await loadTrackingVoyages()
}

const loadTrackingVoyages = async () => {
  try {
    loadingTracking.value = true
    const results = await $api.legacy.getTrackingVoyages()
    trackingVoyages.value = results as any[]
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading tracking voyages' })
  } finally {
    loadingTracking.value = false
  }
}

const selectTrackingVoyage = async (item: any) => {
  try {
    const formComponent = voyageFormRef.value
    if (!formComponent) return

    // Find matching vessel in new system using vessel name + line code
    const matchingVessel = await $api.legacy.findMatchingVessel(item.barco, item.linea || undefined) as any

    // Ensure vessel is in the form catalogs dropdown and select it
    if (matchingVessel) {
      formComponent.ensureVesselInCatalog(matchingVessel)
      formComponent.setValues({ vessel_id: matchingVessel.id })
    }

    // Set voyage name
    if (item.viaje) {
      formComponent.setValues({ name: item.viaje })
    }

    // Set import/export
    if (item.id_srv) {
      const impoExpo = item.id_srv === 'IM' ? 'I' : 'E'
      formComponent.setValues({ impoExpo })
    }

    // Auto-add destination with port + ETA if valid
    if (item.puerto && item.eta && item.eta !== '0000-00-00') {
      formComponent.addLegacyDestination(item.puerto, item.eta)
    } else {
      snackbar.add({
        type: 'warning',
        text: 'Este viaje no tiene ETA registrado en el tracking. Por favor agrega un puerto y fecha de ETA manualmente en el formulario.'
      })
    }

    trackingApplied.value = `Tracking pre-registro: ${item.barco} / ${item.viaje} — ${item.puerto || ''} ${item.eta ? 'ETA: ' + item.eta : '(Sin ETA)'}`
    trackingDialog.value = false

    snackbar.add({ type: 'success', text: `Datos de tracking aplicados. Completa los campos y haz clic en Guardar.` })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error al aplicar datos de tracking' })
  }
}

const goBack = () => {
  router.back()
}
</script>
<style>
/* Global CSS rules to override Vuetify modal colors for pre-registered voyages modal */
.tracking-dialog {
  background: #ffffff !important;
  background-color: #ffffff !important;
  color: #27272a !important;
  border-color: #e4e4e7 !important;
}

.tracking-dialog .v-card-text {
  background-color: #ffffff !important;
  color: #3f3f46 !important;
}

.tracking-dialog .v-table {
  background: #ffffff !important;
  background-color: #ffffff !important;
  color: #27272a !important;
}

.tracking-dialog .v-table__wrapper {
  background-color: #ffffff !important;
}

.tracking-dialog th {
  color: #71717a !important;
  background-color: #f4f4f5 !important;
}

.tracking-dialog tr:hover {
  background-color: rgba(244, 244, 245, 0.6) !important;
}

.tracking-dialog td {
  border-color: #e4e4e7 !important;
}

/* Dark mode overrides */
.dark .tracking-dialog,
.dark-mode .tracking-dialog {
  background: #09090b !important;
  background-color: #09090b !important;
  color: #fafafa !important;
  border-color: #27272a !important;
}

.dark .tracking-dialog .v-card-text,
.dark-mode .tracking-dialog .v-card-text {
  background-color: #09090b !important;
  color: #d4d4d8 !important;
}

.dark .tracking-dialog .v-table,
.dark-mode .tracking-dialog .v-table {
  background: #09090b !important;
  background-color: #09090b !important;
  color: #d4d4d8 !important;
}

.dark .tracking-dialog .v-table__wrapper,
.dark-mode .tracking-dialog .v-table__wrapper {
  background-color: #09090b !important;
}

.dark .tracking-dialog th,
.dark-mode .tracking-dialog th {
  color: #a1a1aa !important;
  background-color: #18181b !important;
}

.dark .tracking-dialog tr:hover,
.dark-mode .tracking-dialog tr:hover {
  background-color: rgba(39, 39, 42, 0.4) !important;
}

.dark .tracking-dialog td,
.dark-mode .tracking-dialog td {
  border-color: #27272a !important;
}
</style>