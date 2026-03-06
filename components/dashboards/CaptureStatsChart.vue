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

        <div v-else-if="chartData" class="chart-container">
          <Line :data="chartData" :options="chartOptions" />
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

const period = ref('monthly')
const loading = ref(false)
const stats = ref<any[]>([])
const chartData = ref<any>(null)
const totalCaptures = ref(0)

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2.5,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold' as const
      },
      bodyFont: {
        size: 13
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
        precision: 0
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
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

  const data = stats.value.map(s => s.total)
  totalCaptures.value = data.reduce((sum, val) => sum + val, 0)

  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Captures',
        data,
        borderColor: getChartColor(),
        backgroundColor: getChartBackgroundColor(),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
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
