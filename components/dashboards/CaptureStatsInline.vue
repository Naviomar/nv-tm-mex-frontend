<template>
  <v-card class="elevation-2 rounded-lg overflow-hidden">
    <div class="bg-gradient-to-r pa-3 text-white" :class="gradientClass">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <v-icon size="28">{{ icon }}</v-icon>
          <div>
            <div class="font-semibold text-lg">{{ title }}</div>
            <div class="text-sm opacity-90">{{ subtitle }}</div>
          </div>
        </div>
        <v-chip :color="chipColor" variant="tonal" size="small" class="font-semibold">
          <v-icon start size="16">mdi-chart-line</v-icon>
          Total: {{ totalCaptures }}
        </v-chip>
      </div>
    </div>

    <v-card-text class="pa-4">
      <div class="mb-3">
        <v-btn-toggle v-model="period" mandatory color="primary" variant="outlined" density="compact" divided size="small">
          <v-btn value="daily">
            <v-icon start size="18">mdi-calendar-today</v-icon>
            Daily
          </v-btn>
          <v-btn value="monthly">
            <v-icon start size="18">mdi-calendar-month</v-icon>
            Monthly
          </v-btn>
        </v-btn-toggle>
      </div>

      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48" />
        <div class="text-grey-600 mt-3 text-sm">Loading...</div>
      </div>

      <div v-else-if="hasData" class="chart-container">
        <client-only>
          <apexchart type="area" height="280" :options="chartOptions" :series="series" />
          <template #fallback><v-skeleton-loader type="image" height="280" /></template>
        </client-only>
      </div>

      <div v-else class="text-center py-8 text-grey-600 text-sm">
        No data available
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { formatCaptureStatDay } from '~/utils/date'

const props = defineProps({
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

const { $api } = useNuxtApp()
const { apexBaseOptions } = useReportFormatters()

const period = ref('daily') // Default to daily view
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
  chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: false } },
  colors: [chartColor.value],
  stroke: { width: 2.5, curve: 'smooth' },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02 } },
  markers: { size: 3, hover: { size: 5 } },
  dataLabels: { enabled: false },
  xaxis: { categories: labels.value, labels: { style: { fontSize: '10px' } } },
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

watch(period, () => {
  fetchStats()
})

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 280px;
  padding: 5px;
}
</style>
