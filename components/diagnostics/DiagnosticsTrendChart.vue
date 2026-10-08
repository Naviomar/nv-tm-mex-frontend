<template>
  <v-card elevation="0" class="tm-panel" rounded="lg">
    <v-card-title class="d-flex align-center text-subtitle-1 font-weight-bold">
      <v-icon start>mdi-chart-timeline-variant</v-icon>{{ title }}
      <v-spacer />
      <span class="text-caption text-medium-emphasis">{{ subtitle }}</span>
    </v-card-title>
    <v-card-text class="pt-0">
      <div v-if="!hasData" class="text-center text-medium-emphasis py-10">
        <v-icon size="40" class="mb-2">mdi-chart-line-variant</v-icon>
        <div class="text-body-2">{{ empty }}</div>
      </div>
      <client-only v-else>
        <apexchart :type="type" :height="height" :options="options" :series="series" />
      </client-only>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
export interface TrendSeries { name: string; data: number[]; color?: string }

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  empty?: string
  categories: string[]
  series: TrendSeries[]
  type?: 'area' | 'bar' | 'line'
  stacked?: boolean
  horizontal?: boolean
  height?: number
  yTitle?: string
}>(), { subtitle: '', empty: 'Not enough history yet', type: 'area', stacked: false, height: 260, yTitle: '' })

const theme = useTheme()
const hasData = computed(() => props.categories.length > 1 || (props.type === 'bar' && props.categories.length > 0))
const text = computed(() => theme.current.value.colors['on-surface'])

const options = computed(() => ({
  chart: { toolbar: { show: false }, stacked: props.stacked, zoom: { enabled: false }, background: 'transparent', foreColor: text.value },
  colors: props.series.map((s) => s.color ?? theme.current.value.colors.primary),
  stroke: { curve: 'smooth', width: props.type === 'bar' ? 0 : 2 },
  fill: props.type === 'area' ? { type: 'gradient', gradient: { opacityFrom: 0.45, opacityTo: 0.05 } } : { opacity: 1 },
  dataLabels: { enabled: false },
  legend: { show: props.series.length > 1, position: 'top', horizontalAlign: 'right', markers: { size: 6 } },
  grid: { borderColor: theme.current.value.dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)', strokeDashArray: 3 },
  xaxis: { categories: props.categories, labels: { rotate: -45, rotateAlways: false, trim: false, hideOverlappingLabels: true, maxHeight: 70, style: { fontSize: '11px' } }, axisBorder: { show: false } },
  yaxis: props.horizontal ? { labels: { maxWidth: 170, style: { fontSize: '11px' } } } : { title: { text: props.yTitle }, labels: { formatter: (v: number) => String(Math.round(v)) } },
  plotOptions: { bar: { borderRadius: 3, columnWidth: '70%', horizontal: props.horizontal, barHeight: '60%' } },
  tooltip: { theme: theme.current.value.dark ? 'dark' : 'light' },
}))
</script>
