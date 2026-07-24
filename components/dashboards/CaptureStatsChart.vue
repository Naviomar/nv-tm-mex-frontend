<template>
  <v-dialog v-model="dialog" max-width="900" persistent>
    <v-card class="rounded-xl">
      <v-card-title class="bg-gradient-to-r pa-4" :class="gradientClass">
        <div class="flex items-center justify-between text-white">
          <div class="flex items-center gap-3">
            <v-icon size="32" color="white">{{ icon }}</v-icon>
            <div>
              <div class="text-xl font-bold">{{ title }}</div>
              <div class="text-sm opacity-90">{{ subtitle }}</div>
            </div>
          </div>
          <v-btn icon variant="text" color="white" @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <div class="mb-4 flex justify-between items-center">
          <v-btn-toggle v-model="period" mandatory color="primary" variant="outlined" divided>
            <v-btn value="daily" size="small">
              <v-icon start>mdi-calendar-today</v-icon>
              Daily (30 days)
            </v-btn>
            <v-btn value="monthly" size="small">
              <v-icon start>mdi-calendar-month</v-icon>
              Monthly (6 months)
            </v-btn>
          </v-btn-toggle>

          <v-chip :color="chipColor" variant="tonal" class="font-semibold">
            <v-icon start>mdi-chart-line</v-icon>
            Total: {{ totalCaptures }}
          </v-chip>
        </div>

        <div v-if="loading" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="64" />
          <div class="text-grey-600 mt-4">Loading statistics...</div>
        </div>

        <div v-else-if="hasData" class="chart-container">
          <client-only>
            <apexchart type="area" height="350" :options="chartOptions" :series="series" />
            <template #fallback><v-skeleton-loader type="image" height="350" /></template>
          </client-only>
        </div>

        <div v-else class="text-center py-12 text-grey-600">
          No data available
        </div>
      </v-card-text>

      <v-card-actions class="pa-4 bg-grey-lighten-5 dark:bg-grey-darken-4">
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="close">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { formatCaptureStatDay } from '~/utils/date'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  subtitle: String,
  icon: String,
  statType: String,
  gradientClass: {
    type: String,
    default: 'from-blue-500 to-blue-700'
  },
  chipColor: {
    type: String,
    default: 'blue'
  }
})

const emit = defineEmits(['update:modelValue'])

const { $api } = useNuxtApp()
const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const { apexBaseOptions } = useReportFormatters()

const period = ref('monthly')
const loading = ref(false)
const stats = ref<any[]>([])
const totalCaptures = ref(0)

const hasData = computed(() => stats.value.length > 0)

const chartColor = computed(() => {
  const map: Record<string, string> = {
    blue: '#3b82f6',
    teal: '#14b8a6',
    indigo: '#6366f1',
    cyan: '#06b6d4',
  }
  return map[props.chipColor ?? 'blue'] ?? map.blue
})

const labels = computed(() =>
  stats.value.map(s => {
    if (period.value === 'monthly') {
      const [year, month] = s.period.split('-')
      return new Date(year, month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    }
    return formatCaptureStatDay(s.period)
  })
)

const series = computed(() => [{
  name: 'Captures',
  data: stats.value.map(s => parseInt(s.total) || 0),
}])

const chartOptions = computed(() => apexBaseOptions({
  chart: { type: 'area', toolbar: { show: false } },
  colors: [chartColor.value],
  stroke: { width: 3, curve: 'smooth' },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02 } },
  markers: { size: 4, hover: { size: 6 } },
  dataLabels: { enabled: false },
  xaxis: { categories: labels.value },
  yaxis: { min: 0, labels: { formatter: (v: number) => Math.round(v).toString() } },
  legend: { show: false },
  tooltip: { theme: 'dark', y: { formatter: (v: number) => `Captures: ${v}` } },
}))

const fetchStats = async () => {
  if (!props.statType) return

  loading.value = true
  try {
    const params = {
      type: props.statType,
      period: period.value,
      months: 6,
      days: 30
    }

    const endpoint = props.statType.startsWith('sea-') ? 'getSeaCaptureStats' : 'getAirCaptureStats'
    const response = await $api.dashboard[endpoint](params)

    stats.value = response.stats || []
    totalCaptures.value = stats.value.reduce((sum: number, s: any) => sum + (parseInt(s.total) || 0), 0)
  } catch (error) {
    console.error('Error fetching stats:', error)
    stats.value = []
    totalCaptures.value = 0
  } finally {
    loading.value = false
  }
}

const close = () => {
  dialog.value = false
}

watch(dialog, (val) => {
  if (val) {
    fetchStats()
  }
})

watch(period, () => {
  fetchStats()
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 350px;
  padding: 10px;
}
</style>
