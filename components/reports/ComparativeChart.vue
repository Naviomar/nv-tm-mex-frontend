<template>
  <div class="comparative-chart-container">
    <v-card class="elevation-4">
      <div class="header-professional">
        <div class="header-content">
          <div class="header-left">
            <div class="icon-wrapper">
              <v-icon color="white" size="32">mdi-chart-box-outline</v-icon>
            </div>
            <div class="header-text">
              <h1 class="header-title">Comparative Analytics Dashboard</h1>
              <p class="header-subtitle">Maritime Import TEUs & Profit Analysis</p>
            </div>
          </div>
          <div class="header-actions">
            <v-btn
              variant="outlined"
              color="white"
              size="small"
              class="mr-2"
              @click="refreshData"
              :loading="refreshing"
            >
              <v-icon start size="18">mdi-refresh</v-icon>
              Refresh
            </v-btn>
            <v-chip
              v-if="cachedYears > 0"
              color="success"
              variant="elevated"
              size="small"
            >
              <v-icon start size="16">mdi-database-check</v-icon>
              {{ cachedYears }} year{{ cachedYears > 1 ? 's' : '' }} cached
            </v-chip>
          </div>
        </div>
      </div>

      <v-card-text class="pa-6">
        <v-row class="mb-6">
          <v-col cols="12" md="8">
            <div class="d-flex align-center gap-4">
              <v-select
                v-model="selectedYears"
                :items="availableYears"
                label="Select Years to Compare"
                multiple
                chips
                closable-chips
                variant="outlined"
                color="primary"
                density="comfortable"
                hide-details
                :disabled="loading"
              >
                <template #prepend-inner>
                  <v-icon color="primary">mdi-calendar-range</v-icon>
                </template>
              </v-select>
              <v-btn
                color="primary"
                variant="elevated"
                size="large"
                :loading="loading"
                :disabled="selectedYears.length === 0"
                @click="loadChartData()"
              >
                <v-icon start>mdi-chart-line</v-icon>
                Generate Chart
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <v-card variant="tonal" color="info" class="h-100">
              <v-card-text class="d-flex align-center justify-center h-100">
                <div class="text-center">
                  <v-icon size="24" color="info">mdi-information</v-icon>
                  <div class="text-caption mt-1">Select up to 5 years</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="mb-6"></v-divider>

        <v-row v-if="chartData && !loading">
          <v-col cols="12">
            <div class="chart-wrapper" style="position: relative; height: 500px;">
              <Bar v-if="chartConfig" :data="chartConfig.data" :options="chartConfig.options" />
            </div>
          </v-col>
        </v-row>

        <v-row v-if="chartData && !loading" class="mt-8">
          <v-col v-for="yearData in chartData" :key="yearData.year" cols="12" md="6" lg="4">
            <v-card class="year-card-professional" elevation="0">
              <div class="card-header-pro">
                <div class="year-badge">
                  <span class="year-number">{{ yearData.year }}</span>
                  <v-chip
                    v-if="yearData.is_locked"
                    color="success"
                    size="x-small"
                    variant="flat"
                    class="ml-2"
                  >
                    <v-icon size="12" start>mdi-lock</v-icon>
                    Locked
                  </v-chip>
                </div>
              </div>
              
              <v-card-text class="pa-0">
                <div class="stats-grid-pro">
                  <div class="stat-item-pro stat-teus">
                    <div class="stat-icon-pro">
                      <v-icon color="#3b82f6">mdi-package-variant</v-icon>
                    </div>
                    <div class="stat-details">
                      <div class="stat-label-pro">Total TEUs</div>
                      <div class="stat-value-pro">{{ formatNumber(yearData.total_teus) }}</div>
                      <div class="stat-meta">with ETA</div>
                    </div>
                  </div>
                  
                  <div class="stat-item-pro stat-profit">
                    <div class="stat-icon-pro">
                      <v-icon color="#10b981">mdi-cash-multiple</v-icon>
                    </div>
                    <div class="stat-details">
                      <div class="stat-label-pro">Total Profit</div>
                      <div class="stat-value-pro">{{ formatCurrency(yearData.total_profit || 0) }}</div>
                      <div class="stat-meta">{{ yearData.total_references }} references</div>
                    </div>
                  </div>
                  
                  <div v-if="yearData.without_eta && yearData.without_eta.teus > 0" class="stat-item-pro stat-warning">
                    <div class="stat-icon-pro">
                      <v-icon color="#f59e0b">mdi-alert-outline</v-icon>
                    </div>
                    <div class="stat-details">
                      <div class="stat-label-pro">Without ETA</div>
                      <div class="stat-value-pro">{{ formatNumber(yearData.without_eta.teus) }}</div>
                      <div class="stat-meta">{{ formatNumber(yearData.without_eta.references) }} refs</div>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="loading" class="my-12">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
            <div class="text-h6 mt-4 text-grey-darken-1">Generating Comparative Charts...</div>
            <div class="text-body-2 text-grey">Analyzing historical data from legacy system</div>
          </v-col>
        </v-row>

        <v-row v-if="!chartData && !loading">
          <v-col cols="12" class="text-center py-12">
            <v-icon size="64" color="grey-lighten-1">mdi-chart-bar-stacked</v-icon>
            <div class="text-h6 mt-4 text-grey-darken-1">No Data Available</div>
            <div class="text-body-2 text-grey">Select years and click Generate to view the comparative analysis</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, LineController } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, LineController)

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const selectedYears = ref<number[]>([])
const chartData = ref<any>(null)
const loading = ref(false)
const refreshing = ref(false)

const cachedYears = computed(() => {
  if (!chartData.value) return 0
  return chartData.value.filter((y: any) => y.is_locked).length
})

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = 2010; year <= currentYear; year++) {
    years.push(year)
  }
  return years.reverse()
})

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const yearColors = [
  { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' }, // Blue
  { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgb(168, 85, 247)' }, // Purple
  { bg: 'rgba(34, 197, 94, 0.8)', border: 'rgb(34, 197, 94)' }, // Green
  { bg: 'rgba(249, 115, 22, 0.8)', border: 'rgb(249, 115, 22)' }, // Orange
  { bg: 'rgba(236, 72, 153, 0.8)', border: 'rgb(236, 72, 153)' }, // Pink
]

const profitLineColors = [
  'rgba(220, 38, 38, 1)', // Red
  'rgba(124, 58, 237, 1)', // Violet
  'rgba(5, 150, 105, 1)', // Emerald
  'rgba(202, 138, 4, 1)', // Yellow
  'rgba(190, 24, 93, 1)', // Rose
]

const getYearColor = (year: number): string => {
  const colors = ['blue', 'green', 'orange', 'purple', 'teal', 'pink', 'indigo', 'cyan']
  return colors[year % colors.length] || 'blue'
}

const getYearGradient = (year: number): string => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  ]
  return gradients[year % gradients.length] || gradients[0]
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value)
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

const loadChartData = async (forceRefresh = false) => {
  if (selectedYears.value.length === 0) return
  
  if (forceRefresh) {
    refreshing.value = true
  } else {
    loading.value = true
  }
  
  try {
    const params: any = {
      years: selectedYears.value
    }
    
    if (forceRefresh) {
      params.refresh = true
    }
    
    const { data } = await $api.reports.getYearlyComparative(params)
    chartData.value = data
    
    if (forceRefresh) {
      snackbar.add({
        type: 'success',
        text: 'Data refreshed successfully'
      })
    }
  } catch (error) {
    console.error('Error loading chart data:', error)
    snackbar.add({
      type: 'error',
      text: 'Failed to load chart data'
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const refreshData = () => {
  loadChartData(true)
}

const chartConfig = computed(() => {
  if (!chartData.value || !Array.isArray(chartData.value)) return null

  const datasets: any[] = []

  chartData.value.forEach((yearData: any, index: number) => {
    const teusData = yearData?.months?.map((m: any) => m.teus) || []
    const profitData = yearData?.months?.map((m: any) => m.profit) || []
    const colorIndex = index % yearColors.length
    const color = yearColors[colorIndex] || yearColors[0]
    const profitColor = profitLineColors[colorIndex] || profitLineColors[0]
    
    // TEUs Bar Chart
    datasets.push({
      type: 'bar',
      label: `${yearData.year} - TEUs`,
      data: teusData,
      backgroundColor: color.bg,
      borderColor: color.border,
      borderWidth: 2,
      yAxisID: 'y',
      order: 2
    })
    
    // Profit Line Chart
    datasets.push({
      type: 'line',
      label: `${yearData.year} - Profit`,
      data: profitData,
      borderColor: profitColor,
      backgroundColor: 'transparent',
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: profitColor,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      yAxisID: 'y1',
      order: 1,
      tension: 0.4
    })
  })

  return {
    data: {
      labels: monthLabels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: 'TEUs per Month - IMPO MARITIME (With ETA)',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        legend: {
          display: true,
          position: 'top' as const,
          align: 'end' as const,
          labels: {
            usePointStyle: false,
            padding: 10,
            font: {
              size: 11,
              weight: 'bold' as const
            },
            boxWidth: 15,
            boxHeight: 15,
            generateLabels: (chart: any) => {
              const datasets = chart.data.datasets
              return datasets.map((dataset: any, i: number) => {
                const yearLabel = dataset.label?.split(' - ')[0] ?? dataset.label ?? ''
                const yearData = chartData.value?.find((y: any) => y.year.toString() === yearLabel)
                const totalTeus = yearData?.total_teus ?? 0
                const withoutEta = yearData?.without_eta?.teus ?? 0
                
                let label = `${yearLabel}: ${formatNumber(totalTeus)}`
                if (withoutEta > 0 && i === datasets.length - 1) {
                  label += ` | sin ETA ${yearLabel}: ${formatNumber(withoutEta)}`
                }
                
                return {
                  text: label,
                  fillStyle: dataset.backgroundColor,
                  strokeStyle: dataset.borderColor,
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                  datasetIndex: i
                }
              })
            }
          }
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
            label: (context: any) => {
              const label = context.dataset.label || ''
              const value = context.parsed.y
              if (label.includes('Profit')) {
                return label + ': ' + formatCurrency(value)
              }
              return label + ': ' + formatNumber(value) + ' TEUs'
            },
            footer: (tooltipItems: any) => {
              let totalTeus = 0
              let totalProfit = 0
              tooltipItems.forEach((item: any) => {
                if (item.dataset.label.includes('TEUs')) {
                  totalTeus += item.parsed.y
                } else if (item.dataset.label.includes('Profit')) {
                  totalProfit += item.parsed.y
                }
              })
              return `\nTotal TEUs: ${formatNumber(totalTeus)}\nTotal Profit: ${formatCurrency(totalProfit)}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'TEUs',
            font: {
              size: 14,
              weight: 'bold' as const
            },
            color: '#1976d2'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: (value: any) => formatNumber(Number(value)),
            color: '#1976d2'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Profit (USD)',
            font: {
              size: 14,
              weight: 'bold' as const
            },
            color: '#dc2626'
          },
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            callback: (value: any) => formatCurrency(Number(value)),
            color: '#dc2626'
          }
        },
      }
    }
  }
})
</script>

<style scoped>
.comparative-chart-container {
  width: 100%;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  min-height: 500px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.text-green {
  color: #16a34a;
}

.text-red {
  color: #dc2626;
  font-weight: 600;
}

/* Header Professional Styles */
.header-professional {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.header-professional::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 40%;
  height: 200%;
  background: rgba(255, 255, 255, 0.05);
  transform: rotate(-15deg);
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-wrapper {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text {
  color: white;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.header-subtitle {
  font-size: 0.875rem;
  margin: 4px 0 0 0;
  opacity: 0.9;
  font-weight: 400;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Professional Cards */
.year-card-professional {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
}

.year-card-professional:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.card-header-pro {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.year-badge {
  display: flex;
  align-items: center;
}

.year-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.5px;
}

.stats-grid-pro {
  display: flex;
  flex-direction: column;
}

.stat-item-pro {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.stat-item-pro:last-child {
  border-bottom: none;
}

.stat-item-pro:hover {
  background-color: #f9fafb;
}

.stat-icon-pro {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-teus .stat-icon-pro {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.stat-profit .stat-icon-pro {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.stat-warning .stat-icon-pro {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.stat-details {
  flex: 1;
}

.stat-label-pro {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-value-pro {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-meta {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}
</style>
