<template>
  <div class="p-6 max-w-6xl mx-auto space-y-6">
    <!-- Header Standard Component Simulation / Navigation -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-4">
      <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <v-icon color="orange-darken-2">mdi-email-cog</v-icon>
          Configuración de Reportes Tracking Automatico
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Administra el envío automático de reportes de sincronización diaria y consulta la bitácora de ejecuciones.
        </p>
      </div>
      <v-btn to="/maritime/import" color="slate-700" variant="outlined" size="small" prepend-icon="mdi-arrow-left">
        Regresar a Importaciones
      </v-btn>
    </div>

    <!-- main content grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- FORM CONFIGURATION CARD -->
      <v-card class="col-span-1 border border-slate-100 shadow-md rounded-xl" :loading="saving || loading">
        <v-card-title class="border-b border-slate-50 py-4 px-5">
          <div class="font-bold text-slate-800 text-base flex items-center gap-2">
            <v-icon color="primary" size="small">mdi-tune-variant</v-icon>
            Ajustes del Programador
          </div>
        </v-card-title>

        <v-card-text class="p-5 space-y-6">
          <!-- Active switch -->
          <div class="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div class="flex flex-col">
              <span class="font-semibold text-slate-800 text-sm">Reportes Activos</span>
              <span class="text-xs text-slate-500">Habilitar programador diario</span>
            </div>
            <v-switch
              v-model="config.is_active"
              color="orange-darken-2"
              hide-details
              inset
              density="compact"
            />
          </div>

          <!-- RECIPIENTS CHIP LIST -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-600 uppercase tracking-wider">Destinatarios del Reporte</label>
            <div class="flex gap-2">
              <v-text-field
                v-model="newEmail"
                density="compact"
                placeholder="ejemplo@naviomar.com"
                hide-details
                variant="outlined"
                @keyup.enter="addEmail"
              >
                <template #append-inner>
                  <v-btn
                    icon="mdi-plus"
                    size="x-small"
                    variant="flat"
                    color="orange-darken-2"
                    @click="addEmail"
                  />
                </template>
              </v-text-field>
            </div>
            <div class="mt-2 flex flex-wrap gap-1.5 min-h-[48px] bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              <v-chip
                v-for="(email, idx) in config.emails"
                :key="email"
                size="small"
                color="orange-darken-2"
                variant="elevated"
                closable
                @click:close="removeEmail(idx)"
              >
                {{ email }}
              </v-chip>
              <div v-if="config.emails.length === 0" class="text-slate-400 text-xs italic p-1">
                No hay correos agregados
              </div>
            </div>
          </div>

          <!-- SEND TIMES SELECTORS (3 TIMES) -->
          <div class="space-y-4">
            <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block">Horarios de Envío (3 Envíos diarios)</label>
            
            <div class="grid grid-cols-1 gap-3">
              <v-select
                v-model="config.send_hour_1"
                :items="amPmTimeItems"
                item-title="label"
                item-value="value"
                label="Primer Envío"
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-clock-outline"
                hide-details
              />
              <v-select
                v-model="config.send_hour_2"
                :items="amPmTimeItems"
                item-title="label"
                item-value="value"
                label="Segundo Envío"
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-clock-outline"
                hide-details
              />
              <v-select
                v-model="config.send_hour_3"
                :items="amPmTimeItems"
                item-title="label"
                item-value="value"
                label="Tercer Envío"
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-clock-outline"
                hide-details
              />
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <!-- ACTIONS BUTTONS -->
        <v-card-actions class="p-5 flex flex-col gap-2">
          <v-btn
            block
            color="orange-darken-2"
            variant="flat"
            class="font-bold shadow-sm"
            :loading="saving"
            @click="saveConfig"
          >
            Guardar Configuración
          </v-btn>
          <v-btn
            block
            color="slate-800"
            variant="tonal"
            class="font-bold"
            prepend-icon="mdi-send-clock"
            :loading="testing"
            @click="sendTestReport"
          >
            Enviar Reporte de Prueba
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- DISPATCH LOGS BITACORA CARD -->
      <v-card class="col-span-1 md:col-span-2 border border-slate-100 shadow-md rounded-xl">
        <v-card-title class="border-b border-slate-50 py-4 px-5">
          <div class="font-bold text-slate-800 text-base flex items-center gap-2">
            <v-icon color="orange-darken-2" size="small">mdi-history</v-icon>
            Bitácora de Envíos Automáticos
          </div>
        </v-card-title>

        <v-card-text class="p-0">
          <div class="overflow-x-auto">
            <v-table density="comfortable" class="w-full">
              <thead class="bg-slate-50 text-slate-600 text-xs font-bold uppercase">
                <tr>
                  <th class="py-3 px-4 text-left">Fecha y Hora</th>
                  <th class="py-3 px-4 text-left">Destinatarios</th>
                  <th class="py-3 px-4 text-center">Embarques</th>
                  <th class="py-3 px-4 class-center text-center">Sincronizados</th>
                  <th class="py-3 px-4 text-center">Barcos Creados</th>
                  <th class="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody class="text-sm divide-y divide-slate-100">
                <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50/50 transition-colors">
                  <td class="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                    {{ formatDate(log.created_at) }}
                  </td>
                  <td class="py-3.5 px-4 text-slate-500 max-w-[200px] truncate" :title="log.sent_to">
                    {{ log.sent_to }}
                  </td>
                  <td class="py-3.5 px-4 text-center font-semibold text-slate-800">
                    {{ log.total_references }}
                  </td>
                  <td class="py-3.5 px-4 text-center font-semibold text-orange-600">
                    {{ log.tracked_references }}
                  </td>
                  <td class="py-3.5 px-4 text-center">
                    <span v-if="log.vessels_created > 0" class="bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded text-xs">
                      +{{ log.vessels_created }}
                    </span>
                    <span v-else class="text-slate-400 font-mono">-</span>
                  </td>
                  <td class="py-3.5 px-4 text-center whitespace-nowrap">
                    <v-chip
                      size="x-small"
                      :color="log.status === 'success' ? 'success' : 'error'"
                      variant="flat"
                      class="font-black"
                    >
                      {{ log.status === 'success' ? 'EXITOSO' : 'FALLIDO' }}
                    </v-chip>
                  </td>
                </tr>
                <tr v-if="logs.length === 0">
                  <td colspan="6" class="py-8 px-4 text-center text-slate-400 italic">
                    No se han registrado ejecuciones de reportes automáticos en la bitácora todavía.
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
      </v-card>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const newEmail = ref('')

const config = ref({
  emails: [] as string[],
  is_active: true,
  send_hour_1: '09:00',
  send_hour_2: '14:00',
  send_hour_3: '18:00',
})

const logs = ref<any[]>([])

// Create user friendly AM/PM select items (mapping to H:i time values)
const amPmTimeItems = [
  { label: '01:00 AM', value: '01:00' },
  { label: '02:00 AM', value: '02:00' },
  { label: '03:00 AM', value: '03:00' },
  { label: '04:00 AM', value: '04:00' },
  { label: '05:00 AM', value: '05:00' },
  { label: '06:00 AM', value: '06:00' },
  { label: '07:00 AM', value: '07:00' },
  { label: '08:00 AM', value: '08:00' },
  { label: '09:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM (Medio día)', value: '12:00' },
  { label: '01:00 PM', value: '13:00' },
  { label: '02:00 PM', value: '14:00' },
  { label: '03:00 PM', value: '15:00' },
  { label: '04:00 PM', value: '16:00' },
  { label: '05:00 PM', value: '17:00' },
  { label: '06:00 PM', value: '18:00' },
  { label: '07:00 PM', value: '19:00' },
  { label: '08:00 PM', value: '20:00' },
  { label: '09:00 PM', value: '21:00' },
  { label: '10:00 PM', value: '22:00' },
  { label: '11:00 PM', value: '23:00' },
  { label: '12:00 AM (Medianoche)', value: '00:00' },
]

// Add email recipient
const addEmail = () => {
  const email = newEmail.value.trim().toLowerCase()
  if (!email) return

  // Validate basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    snackbar.add({ type: 'error', text: 'El formato de correo no es válido.' })
    return
  }

  if (config.value.emails.includes(email)) {
    snackbar.add({ type: 'warning', text: 'Este destinatario ya ha sido agregado.' })
    return
  }

  config.value.emails.push(email)
  newEmail.value = ''
}

// Remove email recipient
const removeEmail = (index: number) => {
  config.value.emails.splice(index, 1)
}

// Fetch configs and logs
const fetchConfigData = async () => {
  try {
    loading.value = true
    const response = await $api.hapagReport.getConfig() as any
    if (response) {
      if (response.config) {
        config.value.is_active = response.config.is_active ?? true
        config.value.emails = response.config.emails ?? []
        
        // Ensure values exist and slice to first 5 chars (H:i)
        config.value.send_hour_1 = (response.config.send_hour_1 || '09:00').substring(0, 5)
        config.value.send_hour_2 = (response.config.send_hour_2 || '14:00').substring(0, 5)
        config.value.send_hour_3 = (response.config.send_hour_3 || '18:00').substring(0, 5)
      }
      logs.value = response.logs ?? []
    }
  } catch (error) {
    console.error(error)
    snackbar.add({ type: 'error', text: 'Error al obtener los datos de configuración.' })
  } finally {
    loading.value = false
  }
}

// Save configuration
const saveConfig = async () => {
  if (config.value.emails.length === 0) {
    snackbar.add({ type: 'error', text: 'Debes configurar al menos un destinatario.' })
    return
  }

  try {
    saving.value = true
    const response = await $api.hapagReport.updateConfig(config.value) as any
    if (response && response.success) {
      snackbar.add({ type: 'success', text: 'Configuración guardada exitosamente.' })
      await fetchConfigData()
    }
  } catch (error: any) {
    console.error(error)
    const errText = error?.response?._data?.message || 'Error al guardar la configuración.'
    snackbar.add({ type: 'error', text: errText })
  } finally {
    saving.value = false
  }
}

// Trigger manual test report email
const sendTestReport = async () => {
  if (config.value.emails.length === 0) {
    snackbar.add({ type: 'error', text: 'Debes tener al menos un correo configurado para enviar la prueba.' })
    return
  }

  try {
    testing.value = true
    snackbar.add({ type: 'info', text: 'Procesando embarques de Hapag y enviando reporte...' })
    const response = await $api.hapagReport.triggerTest() as any
    if (response && response.success) {
      snackbar.add({ type: 'success', text: response.message })
      await fetchConfigData() // reload logs to show the new test run!
    } else {
      snackbar.add({ type: 'error', text: response.message || 'El envío del reporte falló.' })
    }
  } catch (error: any) {
    console.error(error)
    const errText = error?.response?._data?.message || 'Error al disparar el reporte de prueba.'
    snackbar.add({ type: 'error', text: errText })
  } finally {
    testing.value = false
  }
}

// Utility date formatter
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

onMounted(() => {
  fetchConfigData()
})
</script>

<style scoped>
/* Scoped overrides to render a premium dashboard aesthetic */
.v-card {
  transition: all 0.2s ease-in-out;
}
.v-card:hover {
  transform: translateY(-1px);
}
</style>
