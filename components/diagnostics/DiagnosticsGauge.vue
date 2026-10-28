<template>
  <div class="dg tm-panel">
    <div class="dg-head">
      <v-icon size="18" :color="color">{{ icon }}</v-icon>
      <span class="dg-label">{{ label }}</span>
    </div>
    <client-only>
      <apexchart type="radialBar" height="150" :options="options" :series="[clamped]" />
      <template #fallback><v-skeleton-loader type="avatar" height="150" /></template>
    </client-only>
    <div class="dg-foot">{{ caption }}</div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
const props = withDefaults(defineProps<{
  label: string
  icon: string
  /** 0-100 */
  value: number | null
  caption?: string
  warnAt?: number
  failAt?: number
}>(), { caption: '', warnAt: 70, failAt: 90 })

const theme = useTheme()
const clamped = computed(() => Math.max(0, Math.min(100, props.value ?? 0)))
const color = computed(() => {
  const c = theme.current.value.colors
  if (props.value === null) return c.secondary
  if (props.value >= props.failAt) return c.error
  if (props.value >= props.warnAt) return c.warning
  return c.success
})

const options = computed(() => ({
  chart: { sparkline: { enabled: true }, animations: { enabled: true, speed: 500 } },
  colors: [color.value],
  plotOptions: {
    radialBar: {
      hollow: { size: '58%' },
      track: { background: theme.current.value.dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)' },
      dataLabels: {
        name: { show: false },
        value: {
          offsetY: 6,
          fontSize: '20px',
          fontWeight: 700,
          color: theme.current.value.colors['on-surface'],
          formatter: () => (props.value === null ? '—' : `${Math.round(props.value)}%`),
        },
      },
    },
  },
  stroke: { lineCap: 'round' },
}))
</script>

<style scoped>
.dg { border-radius: 12px; padding: 12px 14px 10px; text-align: center; height: 100%; }
.dg-head { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 0.85rem; }
.dg-foot { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.6); min-height: 18px; }
</style>
