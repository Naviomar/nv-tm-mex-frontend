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

      <div v-else-if="chartData" class="chart-container">
        <Line :data="chartData" :options="chartOptions" />
      </div>

      <div v-else class="text-center py-8 text-grey-600 text-sm">
        No data available
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

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
const period = ref('daily') // Default to daily view
const loading = ref(false)
const stats = ref<any[]>([])
const chartData = ref<any>(null)
const totalCaptures = ref(0)

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2.2,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 10,
      titleFont: {
        size: 13,
        weight: 'bold' as const
      },
      bodyFont: {
        size: 12
      },
      callbacks: {
        label: function(context: any) {
          return `Captures: ${context.parsed.y}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
        font: {
          size: 11
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      ticks: {
        font: {
          size: 10
        }
      },
      grid: {
        display: false
      }
    }
  }
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
    updateChartData()
  } catch (error) {
    console.error('Error fetching stats:', error)
    stats.value = []
  } finally {
    loading.value = false
  }
}

const updateChartData = () => {
  if (!stats.value.length) {
    chartData.value = null
    totalCaptures.value = 0
    return
  }

  const labels = stats.value.map(s => {
    if (period.value === 'monthly') {
      const [year, month] = s.period.split('-')
      return new Date(year, month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    }
    return new Date(s.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const data = stats.value.map(s => parseInt(s.total) || 0)
  totalCaptures.value = data.reduce((sum, val) => sum + val, 0)

  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Captures',
        data,
        borderColor: getChartColor(),
        backgroundColor: getChartBackgroundColor(),
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }
}

const getChartColor = () => {
  if (props.chipColor === 'blue') return 'rgb(59, 130, 246)'
  if (props.chipColor === 'teal') return 'rgb(20, 184, 166)'
  if (props.chipColor === 'indigo') return 'rgb(99, 102, 241)'
  if (props.chipColor === 'cyan') return 'rgb(6, 182, 212)'
  return 'rgb(59, 130, 246)'
}

const getChartBackgroundColor = () => {
  if (props.chipColor === 'blue') return 'rgba(59, 130, 246, 0.1)'
  if (props.chipColor === 'teal') return 'rgba(20, 184, 166, 0.1)'
  if (props.chipColor === 'indigo') return 'rgba(99, 102, 241, 0.1)'
  if (props.chipColor === 'cyan') return 'rgba(6, 182, 212, 0.1)'
  return 'rgba(59, 130, 246, 0.1)'
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
