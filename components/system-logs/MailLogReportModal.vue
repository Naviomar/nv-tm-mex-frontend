<template>
  <v-dialog v-model="dialogVisible" max-width="640" persistent>
    <v-card rounded="xl">
      <v-card-title class="pa-4 bg-grey-lighten-5 d-flex align-center">
        <v-icon color="green-darken-2" class="mr-2">mdi-file-chart-outline</v-icon>
        <span class="text-h6 font-weight-bold">Generar reporte</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" density="comfortable" @click="dialogVisible = false" />
      </v-card-title>

      <v-card-text class="pa-4">
        <p class="text-body-2 text-grey-darken-1 mb-4">
          Reporte de Facturas / Notificaciones de Arribo / Revalidación para el rango de fechas
          seleccionado. Cada día del rango se genera en una hoja distinta del Excel.
        </p>

        <v-row>
          <v-col cols="12" md="6">
            <v-date-picker
              v-model="fromDate"
              label="From Date"
              density="compact"
              hide-details
              :max="toDate"
              :first-day-of-week="1"
              locale="es"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-date-picker
              v-model="toDate"
              label="To Date"
              density="compact"
              hide-details
              :min="fromDate"
              :first-day-of-week="1"
              locale="es"
              variant="outlined"
            />
          </v-col>

          <v-col cols="12">
            <v-select
              v-model="category"
              :items="categoryOptions"
              label="Reporte"
              density="comfortable"
              variant="outlined"
              prepend-inner-icon="mdi-shape-outline"
              clearable
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="outlined" color="grey-darken-1" @click="dialogVisible = false">Cancelar</v-btn>
        <v-btn
          prepend-icon="mdi-file-chart-outline"
          variant="flat"
          color="green-darken-2"
          :disabled="!fromDate || !toDate"
          @click="generate"
        >
          Generar reporte
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const dialogVisible = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'generate', filters: Record<string, string>): void
}>()

const categoryOptions = [
  { title: 'Facturas', value: 'invoices' },
  { title: 'Notificaciones de arribo', value: 'arrival' },
  { title: 'Revalidación', value: 'revalidation' },
]

// "Today" per the business timezone (Mexico City), not the browser's local
// zone — matches the convention used across System/Mail Logs.
const todayInMexico = () => new Date(new Date().toLocaleDateString('en-US', { timeZone: 'America/Mexico_City' }))

const fromDate = ref<Date>(todayInMexico())
const toDate = ref<Date>(todayInMexico())
const category = ref<string | null>(null)

// Reports module convention: format a picked Date as a plain YYYY-MM-DD,
// which the backend then interprets as a Mexico City calendar day.
const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Reset to "today" every time the modal opens, so a stale range from a
// previous open doesn't carry over.
watch(dialogVisible, (open) => {
  if (open) {
    fromDate.value = todayInMexico()
    toDate.value = todayInMexico()
    category.value = null
  }
})

const generate = () => {
  const filters: Record<string, string> = {
    date_from: formatDate(fromDate.value),
    date_to: formatDate(toDate.value),
  }
  if (category.value) filters.category = category.value

  emit('generate', filters)
  dialogVisible.value = false
}
</script>
