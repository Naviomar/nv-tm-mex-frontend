<template>
  <v-dialog v-model="isOpen" max-width="840px" scrollable>

    <v-card class="tracking-card">

      <!-- HEADER -->
      <div :class="['tracking-header', carrierBrandClass]">
        <div class="flex items-center gap-3">
          <v-icon size="large" color="white">mdi-sail-boat</v-icon>

          <div>
            <div class="text-xs opacity-75 uppercase tracking-widest font-semibold text-slate-200">
              Real-Time Tracking
            </div>

            <div class="flex items-center gap-2 font-bold text-lg text-white">
              Ref: {{ reference?.reference_number }}

              <v-chip
                v-if="isAutomated"
                size="x-small"
                variant="flat"
                :color="carrierHexColor"
                class="text-white font-bold"
              >
                LIVE {{ carrierName }}
              </v-chip>
            </div>
          </div>
        </div>

        <v-btn icon="mdi-close" variant="text" color="white" @click="isOpen = false" />
      </div>

      <!-- BODY -->
      <v-card-text class="tracking-body bg-[#090d16] px-6 py-6">

        <!-- MISMATCH WARNING -->
        <div v-if="isMismatched" class="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <v-icon color="amber" class="mt-0.5">mdi-alert</v-icon>
            <div>
              <span class="text-amber-400 font-bold text-sm uppercase tracking-wider block mb-1">¡Atención! Posible inconsistencia detectada</span>
              <p class="text-sm text-slate-300 leading-relaxed">
                Hemos detectado que el número de <strong>Master BL</strong> podría no corresponder con la <strong>naviera registrada</strong> (por ejemplo, un BL de COSCO con la línea Hapag-Lloyd, o viceversa). 
                Por favor, verifica que tu registro esté bien e intenta de nuevo. ¡Gracias por revisar!
              </p>
            </div>
          </div>
        </div>

        <!-- TRACKER SYNC ALERTS -->
        <div v-if="props.referencia?.tracker_sync_alerts?.length" class="mb-6 bg-slate-800/50 border border-red-900/30 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <v-icon color="red" size="small">mdi-alert-circle-outline</v-icon>
            <span class="text-white font-bold text-sm uppercase tracking-wider">Tracker sync alert(s)</span>
          </div>
          <v-table density="compact" class="bg-transparent text-slate-300">
            <thead>
              <tr>
                <th class="text-left w-20 text-slate-400">Type</th>
                <th class="text-left text-slate-400">Message</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(alert, idx) in props.referencia.tracker_sync_alerts" :key="idx" class="border-b border-slate-700/50">
                <td class="text-xs font-semibold" :class="alert.type === 'error' ? 'text-red-400' : 'text-amber-400'">{{ alert.type }}</td>
                <td class="text-sm">{{ alert.message }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <!-- LOADING -->
        <div v-if="loading" class="center my-8">
          <v-progress-circular indeterminate :color="carrierHexColor" size="48" />
          <p class="text-sm text-slate-400 mt-4 font-medium">
            Consultando naviera en tiempo real...
          </p>
        </div>

        <!-- MAIN LAYOUT WHEN NOT LOADING -->
        <div v-else>
          <!-- SUMMARY CARD -->
          <div class="summary-card">
            <div>
              <div class="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Último movimiento
              </div>

              <div v-if="milestones.length" class="text-sm font-bold text-amber-400 mt-1">
                {{ parseDescription(milestones[milestones.length - 1]?.event_description).location }}
                <span class="text-slate-400 font-normal mx-1.5">·</span>
                {{ formatDateOnly(milestones[milestones.length - 1]?.event_date) }}
              </div>

              <div v-else class="text-sm text-slate-500 mt-1 font-medium">
                Sin eventos registrados aún
              </div>
            </div>

            <v-btn
              :loading="syncing"
              :color="carrierHexColor"
              size="small"
              class="text-white font-bold px-4"
              prepend-icon="mdi-refresh"
              @click="triggerLiveSync"
            >
              Sync
            </v-btn>
          </div>

          <!-- INTERACTIVE CONTAINER SELECTOR (FILTER CHIPS) -->
          <div v-if="uniqueContainers.length > 1" class="flex flex-wrap gap-2 mb-6 items-center bg-[#0f172a] p-3 rounded-lg border border-slate-800">
            <span class="text-xs text-slate-400 uppercase tracking-wider font-bold mr-1 flex items-center gap-1">
              <v-icon size="14">mdi-filter-outline</v-icon>
              Filtrar Contenedor:
            </span>
            
            <v-chip
              size="small"
              :color="!selectedContainer ? carrierHexColor : 'grey-darken-3'"
              variant="flat"
              class="cursor-pointer text-white font-medium"
              @click="selectedContainer = null"
            >
              Todos
            </v-chip>
            
            <v-chip
              v-for="c in uniqueContainers"
              :key="c"
              size="small"
              :color="selectedContainer === c ? carrierHexColor : 'grey-darken-3'"
              variant="flat"
              class="cursor-pointer text-white font-medium"
              @click="selectedContainer = c"
            >
              {{ c }}
            </v-chip>
          </div>

          <!-- PREMIUM HIGH-FIDELITY TIMELINE -->
          <div v-if="filteredMilestones.length" class="timeline-container mt-6">
            <div class="timeline-line"></div>
            
            <div
              v-for="(m, i) in filteredMilestones"
              :key="i"
              class="timeline-item"
              :class="{ 'latest-item': i === filteredMilestones.length - 1 }"
              :style="i === filteredMilestones.length - 1 ? { color: carrierHexColor } : {}"
            >
              <!-- Timeline Dot -->
              <div
                class="timeline-dot"
                :style="{ backgroundColor: carrierHexColor, boxShadow: `0 0 10px ${carrierHexColor}80` }"
              >
                <v-icon size="x-small" color="white">
                  {{ getEventIcon(m.event?.name, parseDescription(m.event_description).transport) }}
                </v-icon>
              </div>
              
              <!-- Timeline Content Card -->
              <div class="timeline-content">
                <div class="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 class="timeline-event-name" :style="{ color: carrierHexColor }">
                      {{ m.event?.name }}
                    </h3>
                    
                    <!-- Containers tags associated with this event -->
                    <div v-if="m.containers && m.containers.length" class="flex flex-wrap gap-1.5 mt-1.5">
                      <span
                        v-for="c in m.containers"
                        :key="c.id"
                        class="container-tag"
                      >
                        <v-icon size="10" class="mr-1">mdi-package-variant-closed</v-icon>
                        {{ c.reference_container?.container_number }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Date/Time Tag -->
                  <div class="text-right">
                    <div class="timeline-date font-bold text-xs text-slate-100">
                      {{ formatDateOnly(m.event_date) }}
                    </div>
                    <div class="timeline-time text-slate-400 text-xs mt-0.5 font-mono">
                      {{ parseDescription(m.event_description).time }} hrs
                    </div>
                  </div>
                </div>
                
                <!-- Location and Logistics Metadata Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800">
                  <div class="flex items-center gap-1.5 text-xs text-slate-300">
                    <v-icon size="14" color="slate-400">mdi-map-marker-outline</v-icon>
                    <span class="font-medium text-slate-400">Lugar:</span>
                    <span class="text-slate-200 font-semibold truncate">{{ parseDescription(m.event_description).location }}</span>
                  </div>
                  
                  <div class="flex items-center gap-1.5 text-xs text-slate-300">
                    <v-icon size="14" color="slate-400">
                      {{ parseDescription(m.event_description).transport === 'TRUCK' ? 'mdi-truck-outline' : 'mdi-ferry' }}
                    </v-icon>
                    <span class="font-medium text-slate-400">Transporte:</span>
                    <span class="text-slate-200 font-semibold truncate">{{ parseDescription(m.event_description).transport }}</span>
                  </div>
                  
                  <div v-if="parseDescription(m.event_description).voyage && parseDescription(m.event_description).voyage !== '-'" class="flex items-center gap-1.5 text-xs text-slate-300 md:col-span-2">
                    <v-icon size="14" color="slate-400">mdi-compass-outline</v-icon>
                    <span class="font-medium text-slate-400">Viaje:</span>
                    <span class="bg-[#1e293b] px-2 py-0.5 rounded text-[10px] text-slate-200 font-bold font-mono">
                      {{ parseDescription(m.event_description).voyage }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- EMPTY TIMELINE STATE -->
          <div v-else class="empty py-12 px-6">
            <template v-if="syncing">
              <v-progress-circular indeterminate :color="carrierHexColor" size="48" />
              <p class="mt-4 font-semibold text-slate-300 text-sm">Sincronizando automáticamente...</p>
            </template>
            <template v-else>
              <v-icon size="60" color="slate-600">mdi-package-variant-closed</v-icon>
              <p class="mt-4 font-semibold text-slate-300 text-sm">Sin eventos registrados</p>
              <p class="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                ¿No ves ningún evento? Por favor, verifica que el número de BL, Booking o Contenedor esté bien registrado y corresponda a la naviera seleccionada.
              </p>
              <p class="text-xs text-slate-500 mt-4">
                Si todo es correcto, haz clic en el botón <strong>Sync</strong> superior para reintentar. ¡Muchas gracias!
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
  if (!desc) return { location: '-', time: '-', transport: '-', voyage: '-' }
  try {
    return JSON.parse(desc)
  } catch {
    return { location: desc, time: '-', transport: '-', voyage: '-' }
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

<style scoped>
.tracking-card {
  background: #090d16;
  color: white;
  border-radius: 16px;
  border: 1px solid #1e293b;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.6);
}

.tracking-header {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #1e293b;
  backdrop-filter: blur(10px);
}

.cosco-brand {
  background: linear-gradient(135deg, #0f172a 0%, #0d9488 100%);
}

.hapag-brand {
  background: linear-gradient(135deg, #0f172a 0%, #ea580c 100%);
}

.summary-card {
  background: #0f172a;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #1e293b;
}

.timeline-container {
  position: relative;
  padding-left: 28px;
}

.timeline-line {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 10px;
  width: 2px;
  background: linear-gradient(to bottom, #1e293b, #334155, #1e293b);
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-dot {
  position: absolute;
  left: -28px;
  top: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: transform 0.2s ease-in-out;
}

.timeline-item:hover .timeline-dot {
  transform: scale(1.15);
}

.timeline-content {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item:hover .timeline-content {
  background: #131b2e;
  border-color: #475569;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  transform: translateY(-2px);
}

.timeline-event-name {
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin: 0;
  text-transform: uppercase;
}

.container-tag {
  background: rgba(148, 163, 184, 0.08);
  color: #94a3b8;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: inline-flex;
  align-items: center;
}

.latest-item .timeline-content {
  background: rgba(15, 23, 42, 0.6);
  border-color: currentColor; /* Inherits carrier brand color border */
}

/* Pulsing effect for latest timeline dot */
.latest-item .timeline-dot::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
  opacity: 0.6;
  animation: pulse-ring 1.8s infinite;
  z-index: -1;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.6);
    opacity: 0;
  }
  100% {
    transform: scale(0.95);
    opacity: 0;
  }
}

.empty {
  text-align: center;
  color: #64748b;
}

.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>