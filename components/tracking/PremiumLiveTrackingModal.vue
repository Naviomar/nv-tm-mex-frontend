<template>
  <v-dialog v-model="isOpen" max-width="840px" scrollable>
    <v-card class="bg-white dark:bg-[#09090b] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden tracking-dialog">
      
      <!-- HEADER -->
      <div class="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#09090b] flex items-center justify-between backdrop-blur-sm sticky top-0 z-10">
        <div class="flex items-center gap-4">
          <div class="h-10 w-10 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" :style="{ color: carrierHexColor }">
            <v-icon size="small">mdi-radar</v-icon>
          </div>
          <div>
            <div class="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-0.5">
              Live Tracking
            </div>
            <div class="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              {{ reference?.reference_number }}
              <div
                v-if="isAutomated"
                class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                :style="{ color: carrierHexColor, backgroundColor: carrierHexColor + '15', border: `1px solid ${carrierHexColor}30` }"
              >
                LIVE {{ carrierName }}
              </div>
            </div>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" class="text-zinc-400 dark:text-zinc-500" @click="isOpen = false" />
      </div>

      <!-- BODY -->
      <v-card-text class="p-6 bg-white dark:bg-[#09090b]">

        <!-- MISMATCH WARNING -->
        <div v-if="isMismatched" class="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <v-icon color="amber-500" size="small" class="mt-0.5">mdi-alert</v-icon>
          <div>
            <span class="text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider block mb-1">Posible inconsistencia</span>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              El número de <strong>Master BL</strong> podría no corresponder con la naviera registrada. Por favor verifica los datos.
            </p>
          </div>
        </div>

        <!-- TRACKER SYNC ALERTS -->
        <div v-if="props.referencia?.tracker_sync_alerts?.length" class="mb-6 bg-zinc-50 dark:bg-zinc-900/50 border border-red-500/20 rounded-xl overflow-hidden">
          <div class="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-red-500/5">
            <v-icon color="red-500" size="small">mdi-alert-circle-outline</v-icon>
            <span class="text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wider">Alertas de Sincronización</span>
          </div>
          <div class="p-4 space-y-3">
            <div v-for="(alert, idx) in props.referencia.tracker_sync_alerts" :key="idx" class="flex gap-3 text-xs">
              <span class="font-bold uppercase tracking-wider mt-0.5" :class="alert.type === 'error' ? 'text-red-500' : 'text-amber-500'">{{ alert.type }}</span>
              <span class="text-zinc-600 dark:text-zinc-400">{{ alert.message }}</span>
            </div>
          </div>
        </div>

        <!-- LOADING -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-16">
          <v-progress-circular indeterminate :color="carrierHexColor" size="32" width="3" />
          <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-4 font-bold uppercase tracking-widest">Consultando Naviera...</p>
        </div>

        <!-- MAIN LAYOUT WHEN NOT LOADING -->
        <div v-else>
          <!-- SUMMARY CARD -->
          <div class="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Último Evento Registrado</div>
              <div v-if="milestones.length" class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <v-icon size="small" :color="carrierHexColor">mdi-map-marker-outline</v-icon>
                <span>{{ parseDescription(milestones[milestones.length - 1]?.event_description).location }}</span>
                <span class="text-zinc-300 dark:text-zinc-700 font-normal mx-1">•</span>
                <span class="text-zinc-500 dark:text-zinc-400">{{ formatDateOnly(milestones[milestones.length - 1]?.event_date) }}</span>
              </div>
              <div v-else class="text-sm text-zinc-400 dark:text-zinc-600 font-medium">Sin eventos registrados</div>
            </div>
            
            <v-btn
              :loading="syncing"
              variant="flat"
              size="small"
              class="font-bold rounded-lg px-5 text-white"
              :style="{ backgroundColor: carrierHexColor }"
              prepend-icon="mdi-refresh"
              @click="triggerLiveSync"
            >
              Sync
            </v-btn>
          </div>

          <!-- INTERACTIVE CONTAINER SELECTOR -->
          <div v-if="uniqueContainers.length > 1" class="flex flex-wrap gap-2 mb-8 items-center">
            <span class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mr-2 flex items-center gap-1">
              <v-icon size="small">mdi-filter-variant</v-icon> Filtro:
            </span>
            
            <button
              class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all uppercase tracking-wider border"
              :class="!selectedContainer ? 'text-zinc-800 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700' : 'text-zinc-500 border-transparent hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'"
              @click="selectedContainer = null"
            >
              Todos
            </button>
            
            <button
              v-for="c in uniqueContainers"
              :key="c"
              class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all font-mono uppercase tracking-wider border"
              :class="selectedContainer === c ? 'text-white border-transparent shadow-sm' : 'text-zinc-500 border-transparent hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'"
              :style="selectedContainer === c ? { backgroundColor: carrierHexColor } : {}"
              @click="selectedContainer = c"
            >
              {{ c }}
            </button>
          </div>

          <!-- MINIMALIST TIMELINE -->
          <div v-if="filteredMilestones.length" class="relative pl-6 py-2">
            <!-- Timeline vertical line -->
            <div class="absolute top-2 bottom-2 left-[11px] w-[2px] bg-zinc-100 dark:bg-zinc-800/80 rounded-full"></div>
            
            <div
              v-for="(m, i) in filteredMilestones"
              :key="i"
              class="relative mb-6 last:mb-0 group py-1"
            >
              <!-- Timeline Dot -->
              <div
                class="absolute -left-6 top-3 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-[#09090b] transition-transform duration-300 group-hover:scale-125 z-10"
                :class="i === highlightedIndex ? 'animate-pulse' : ''"
                :style="{ backgroundColor: i === highlightedIndex ? carrierHexColor : '#a1a1aa' }"
              ></div>
              
              <!-- Timeline Content -->
              <div
                class="pl-4 p-3 rounded-xl border transition-all duration-300"
                :class="[
                  i === highlightedIndex 
                    ? 'shadow-sm bg-zinc-50/65 dark:bg-zinc-900/40'
                    : 'bg-transparent border-transparent hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 hover:border-zinc-200/50 dark:hover:border-zinc-800/40'
                ]"
                :style="i === highlightedIndex ? { borderColor: `${carrierHexColor}35` } : {}"
              >
                <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-1 mb-2">
                  <h3 
                    class="text-[13px] font-bold tracking-wide uppercase"
                    :class="i === highlightedIndex ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors'"
                  >
                    {{ parseDescription(m.event_description).status || m.event?.name }}
                  </h3>
                  
                  <div class="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <span class="text-xs font-semibold">{{ formatDateOnly(m.event_date) }}</span>
                    <span class="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">{{ parseDescription(m.event_description).time }}</span>
                  </div>
                </div>

                <!-- Containers tags associated with this event -->
                <div v-if="m.containers && m.containers.length" class="flex flex-wrap gap-1.5 my-2">
                  <span
                    v-for="c in m.containers"
                    :key="c.id"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                  >
                    <v-icon size="10" class="text-zinc-400 dark:text-zinc-600">mdi-package-variant-closed</v-icon>
                    {{ c.reference_container?.container_number }}
                  </span>
                </div>
                
                <!-- Location & Transport Metadata -->
                <div class="flex flex-wrap gap-x-6 gap-y-2 mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/40">
                  <div class="flex items-center gap-1.5 text-xs">
                    <v-icon size="14" class="text-zinc-400 dark:text-zinc-500">mdi-map-marker-outline</v-icon>
                    <span class="text-zinc-700 dark:text-zinc-300 font-medium">{{ parseDescription(m.event_description).location }}</span>
                  </div>
                  
                  <div class="flex items-center gap-1.5 text-xs">
                    <v-icon size="14" class="text-zinc-400 dark:text-zinc-500">
                      {{ parseDescription(m.event_description).transport === 'TRUCK' ? 'mdi-truck-outline' : 'mdi-ferry' }}
                    </v-icon>
                    <span class="text-zinc-500 dark:text-zinc-400">{{ parseDescription(m.event_description).transport }}</span>
                  </div>
                  
                  <div v-if="parseDescription(m.event_description).voyage && parseDescription(m.event_description).voyage !== '-'" class="flex items-center gap-1.5 text-xs">
                    <v-icon size="14" class="text-zinc-400 dark:text-zinc-500">mdi-compass-outline</v-icon>
                    <span class="text-zinc-500 dark:text-zinc-400">Viaje: <span class="font-mono text-zinc-700 dark:text-zinc-300">{{ parseDescription(m.event_description).voyage }}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- EMPTY STATE -->
          <div v-else class="flex flex-col items-center justify-center py-16 text-center">
            <template v-if="syncing">
              <v-progress-circular indeterminate :color="carrierHexColor" size="32" width="3" />
              <p class="mt-4 font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-widest">Sincronizando automáticamente...</p>
            </template>
            <template v-else>
              <div class="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-5 text-zinc-400 dark:text-zinc-700">
                <v-icon size="28">mdi-package-variant-closed</v-icon>
              </div>
              <p class="font-bold text-zinc-800 dark:text-zinc-300 text-sm">Sin eventos registrados</p>
              <p class="text-xs text-zinc-500 mt-2 max-w-sm leading-relaxed">
                Verifica que el número de BL o Contenedor corresponda a la naviera seleccionada. Haz clic en <strong>Sync</strong> para reintentar.
              </p>
            </template>
          </div>
        </div>

      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const props = defineProps({
  modelValue: Boolean,
  referenciaId: Number,
  referencia: Object,
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const reference = ref<any>({})
const milestones = ref<any[]>([])
const loading = ref(false)
const syncing = ref(false)
const selectedContainer = ref<string | null>(null)

const isAutomated = computed(() => {
  const refObj = reference.value?.line ? reference.value : props.referencia
  const n = (refObj?.line?.name || '').toLowerCase()
  const c = (refObj?.line?.code || '').toUpperCase()
  // While COSCO live sync is suspended, only Hapag-Lloyd is automated
  return n.includes('hapag') || c === 'HLCU'
})

const isMismatched = computed(() => {
  const refObj = reference.value?.line ? reference.value : props.referencia
  if (!refObj) return false
  
  const lineName = (refObj.line?.name || '').toLowerCase()
  const lineCode = (refObj.line?.code || '').toUpperCase()
  
  const bls: string[] = []
  if (refObj.master_bls && Array.isArray(refObj.master_bls)) {
    refObj.master_bls.forEach((b: any) => {
      if (b.name) bls.push(b.name.toUpperCase().trim())
    })
  }
  
  // If line is Hapag, but BL starts with COSU/COS
  const isHapagLine = lineName.includes('hapag') || lineName.includes('lloyd') || lineCode === 'HLCU' || lineCode === 'HLAG'
  const hasCoscoBl = bls.some((bl: string) => bl.startsWith('COSU') || bl.startsWith('COSN') || bl.startsWith('COS'))
  
  // If line is COSCO, but BL starts with HLCU/HLA
  const isCoscoLine = lineName.includes('cosco') || lineCode === 'COSU' || lineCode === 'COSN'
  const hasHapagBl = bls.some((bl: string) => bl.startsWith('HLCU') || bl.startsWith('HLAG') || bl.startsWith('HLA'))
  
  return (isHapagLine && hasCoscoBl) || (isCoscoLine && hasHapagBl)
})

const carrierName = computed(() => {
  const refObj = reference.value?.line ? reference.value : props.referencia
  const n = (refObj?.line?.name || '').toLowerCase()
  return n.includes('cosco') ? 'COSCO' : 'Hapag'
})

const carrierColor = computed(() => {
  const refObj = reference.value?.line ? reference.value : props.referencia
  const n = (refObj?.line?.name || '').toLowerCase()
  return n.includes('cosco') ? 'teal' : 'deep-orange'
})

const carrierHexColor = computed(() => {
  const refObj = reference.value?.line ? reference.value : props.referencia
  const n = (refObj?.line?.name || '').toLowerCase()
  return n.includes('cosco') ? '#0d9488' : '#ea580c'
})

const carrierBrandClass = computed(() => {
  const refObj = reference.value?.line ? reference.value : props.referencia
  const n = (refObj?.line?.name || '').toLowerCase()
  if (n.includes('cosco')) return 'cosco-brand'
  if (n.includes('hapag')) return 'hapag-brand'
  return ''
})

const parseDescription = (desc: string) => {
  if (!desc) return { status: '', location: '-', time: '-', transport: '-', voyage: '-' }
  try {
    return JSON.parse(desc)
  } catch {
    return { status: '', location: desc, time: '-', transport: '-', voyage: '-' }
  }
}

const uniqueContainers = computed(() => {
  const cntrs = new Set<string>()
  milestones.value.forEach(m => {
    if (m.containers) {
      m.containers.forEach((c: any) => {
        if (c.reference_container?.container_number) {
          cntrs.add(c.reference_container.container_number)
        }
      })
    }
  })
  return Array.from(cntrs)
})

const filteredMilestones = computed(() => {
  if (!selectedContainer.value) return milestones.value
  return milestones.value.filter(m => {
    return m.containers && m.containers.some((c: any) => c.reference_container?.container_number === selectedContainer.value)
  })
})

const highlightedIndex = computed(() => {
  if (!filteredMilestones.value.length) return -1
  
  const today = new Date()
  let minDiff = Infinity
  let closestIdx = -1

  filteredMilestones.value.forEach((m, idx) => {
    if (!m.event_date) return
    const eventDate = new Date(m.event_date)
    const diff = Math.abs(eventDate.getTime() - today.getTime())
    if (diff < minDiff) {
      minDiff = diff
      closestIdx = idx
    }
  })

  return closestIdx !== -1 ? closestIdx : filteredMilestones.value.length - 1
})

const getEventIcon = (eventName: string, transport: string) => {
  const name = (eventName || '').toLowerCase()
  if (name.includes('returned') || name.includes('empty')) {
    return 'mdi-package-variant'
  }
  if (name.includes('gate in') || name.includes('gate-in')) {
    return 'mdi-login-variant'
  }
  if (name.includes('gate out') || name.includes('gate-out')) {
    return 'mdi-logout-variant'
  }
  if (name.includes('loaded') || name.includes('load')) {
    return 'mdi-arrow-up-bold-box-outline'
  }
  if (name.includes('discharged') || name.includes('discharge')) {
    return 'mdi-arrow-down-bold-box-outline'
  }
  if (name.includes('departed')) {
    return 'mdi-sail-boat'
  }
  if (name.includes('arrived') || name.includes('arrival')) {
    return 'mdi-anchor'
  }
  
  if ((transport || '').toUpperCase() === 'TRUCK') {
    return 'mdi-truck-outline'
  }
  if ((transport || '').toUpperCase() === 'RAIL') {
    return 'mdi-train'
  }
  return 'mdi-ferry'
}

const fetchData = async () => {
  const refId = props.referenciaId
  if (!refId) return

  try {
    loading.value = true
    selectedContainer.value = null // Reset filter

    // 1. Fetch current local milestones first to display them immediately (fast load)
    const response = await $api.seaTrackings.getLiveTimeline(refId)

    reference.value = response?.referencia || {}
    milestones.value = response?.milestones || []

    // 2. If it is an automated shipping line (COSCO or Hapag), automatically trigger a live sync in the background
    // to get the absolute latest tracking milestones without forcing the user to click the sync button!
    if (isAutomated.value) {
      syncing.value = true
      try {
        const syncResponse = await $api.seaTrackings.syncLive(refId)
        if (syncResponse?.success) {
          // Re-fetch milestones with the newly synced tracking data
          const updatedResponse = await $api.seaTrackings.getLiveTimeline(refId)
          milestones.value = updatedResponse?.milestones || []
        } else {
          snackbar.add({ type: 'warning', text: 'No se encontraron eventos. Por favor, verifica que el BL/Booking y la naviera seleccionada correspondan entre sí.' })
        }
      } catch (syncErr) {
        console.error('Auto-sync failed:', syncErr)
        snackbar.add({ type: 'warning', text: 'No se pudo realizar la sincronización automática. Por favor, revisa que los datos de tu registro sean correctos.' })
      } finally {
        syncing.value = false
      }
    }

  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const triggerLiveSync = async () => {
  const refId = props.referenciaId
  if (!refId) return

  try {
    syncing.value = true

    const response = await $api.seaTrackings.syncLive(refId)

    if (response?.success) {
      snackbar.add({ type: 'success', text: 'Datos actualizados desde la naviera.' })
      await fetchData()
    } else {
      snackbar.add({ 
        type: 'error', 
        text: 'No se pudo sincronizar con la naviera. Por favor, verifica que el número de BL/Booking sea el correcto y corresponda a la naviera seleccionada. ¡Gracias por revisar!' 
      })
    }

  } finally {
    syncing.value = false
  }
}

const formatDateOnly = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

watch(
  () => props.modelValue,
  async (val) => {
    if (val) await fetchData()
  }
)
</script>

<style>
/* Global CSS rules to override Vuetify modal colors in both themes */
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

/* Minimalist scrollbar */
.tracking-dialog .v-card-text::-webkit-scrollbar {
  width: 6px;
}
.tracking-dialog .v-card-text::-webkit-scrollbar-track {
  background: transparent;
}
.tracking-dialog .v-card-text::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}
.dark .tracking-dialog .v-card-text::-webkit-scrollbar-thumb,
.dark-mode .tracking-dialog .v-card-text::-webkit-scrollbar-thumb {
  background-color: #27272a;
}
.tracking-dialog .v-card-text::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.25);
}
.dark .tracking-dialog .v-card-text::-webkit-scrollbar-thumb:hover,
.dark-mode .tracking-dialog .v-card-text::-webkit-scrollbar-thumb:hover {
  background-color: #3f3f46;
}
</style>