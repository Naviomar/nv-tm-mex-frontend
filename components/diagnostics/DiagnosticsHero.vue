<template>
  <v-card elevation="0" class="dh" :class="`dh-${overall}`">
    <v-row align="center" no-gutters>
      <v-col cols="12" md="auto" class="dh-ring">
        <client-only>
          <apexchart type="radialBar" height="170" width="170" :options="ringOptions" :series="[score]" />
          <template #fallback><v-skeleton-loader type="avatar" height="170" width="170" /></template>
        </client-only>
      </v-col>
      <v-col class="pa-4 pa-md-5">
        <div class="d-flex align-center ga-2 mb-1">
          <v-icon :color="statusColor" size="28">{{ statusIcon }}</v-icon>
          <h2 class="text-h5 font-weight-bold">{{ headline }}</h2>
        </div>
        <p class="text-body-2 text-medium-emphasis mb-3">{{ subline }}</p>
        <div class="d-flex flex-wrap ga-2">
          <div v-for="tile in tiles" :key="tile.key" class="dh-tile" :class="`dh-tile-${tile.key}`">
            <span class="dh-tile-n">{{ tile.n }}</span>
            <span class="dh-tile-l">{{ tile.label }}</span>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="auto" class="pa-4 pa-md-5 d-flex flex-column ga-2">
        <slot name="actions" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
const props = defineProps<{
  counts: { ok: number; warn: number; fail: number; skip: number; total: number }
  lastRun: string | null
}>()

const theme = useTheme()
const overall = computed(() => (props.counts.fail ? 'fail' : props.counts.warn ? 'warn' : props.counts.total ? 'ok' : 'idle'))
const colors = theme.current.value.colors
const statusColor = computed(() => ({ ok: colors.success, warn: colors.warning, fail: colors.error, idle: colors.secondary })[overall.value])
const statusIcon = computed(() => ({ ok: 'mdi-shield-check', warn: 'mdi-alert-circle-outline', fail: 'mdi-alert-octagon-outline', idle: 'mdi-heart-pulse' })[overall.value])
const score = computed(() => {
  const evaluated = props.counts.total - props.counts.skip
  return evaluated > 0 ? Math.round((props.counts.ok / evaluated) * 100) : 0
})
const headline = computed(() => ({
  ok: 'All systems operational',
  warn: `${props.counts.warn} item${props.counts.warn === 1 ? '' : 's'} need attention`,
  fail: `${props.counts.fail} check${props.counts.fail === 1 ? '' : 's'} failing`,
  idle: 'No results yet',
})[overall.value])
const subline = computed(() =>
  props.lastRun ? `Last run ${new Date(props.lastRun).toLocaleString()}` : 'Run the checks to see the state of the system.')
const tiles = computed(() => [
  { key: 'ok', n: props.counts.ok, label: 'Passing' },
  { key: 'warn', n: props.counts.warn, label: 'Warnings' },
  { key: 'fail', n: props.counts.fail, label: 'Failing' },
  { key: 'skip', n: props.counts.skip, label: 'Skipped' },
])

const ringOptions = computed(() => ({
  chart: { sparkline: { enabled: true } },
  colors: [statusColor.value],
  plotOptions: {
    radialBar: {
      startAngle: -120,
      endAngle: 120,
      hollow: { size: '62%' },
      track: { background: theme.current.value.dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)' },
      dataLabels: {
        name: { show: true, offsetY: 18, fontSize: '11px', color: theme.current.value.colors['on-surface'] },
        value: { offsetY: -14, fontSize: '30px', fontWeight: 800, color: theme.current.value.colors['on-surface'], formatter: (v: number) => `${v}%` },
      },
    },
  },
  labels: ['health'],
  stroke: { lineCap: 'round' },
}))
</script>

<style scoped>
.dh { border-radius: 16px; border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); background: rgb(var(--v-theme-surface)); position: relative; overflow: hidden; }
.dh::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 5px; background: rgb(var(--v-theme-secondary)); }
.dh-ok::before { background: rgb(var(--v-theme-success)); }
.dh-warn::before { background: rgb(var(--v-theme-warning)); }
.dh-fail::before { background: rgb(var(--v-theme-error)); }
.dh-ring { display: flex; justify-content: center; padding: 8px 8px 8px 16px; }
.dh-tile { display: flex; flex-direction: column; min-width: 84px; padding: 8px 14px; border-radius: 10px; background: rgba(var(--v-theme-on-surface), 0.05); }
.dh-tile-n { font-size: 1.4rem; font-weight: 800; line-height: 1.1; }
.dh-tile-l { font-size: 0.72rem; opacity: 0.65; text-transform: uppercase; letter-spacing: 0.04em; }
.dh-tile-ok .dh-tile-n { color: rgb(var(--v-theme-success)); }
.dh-tile-warn .dh-tile-n { color: rgb(var(--v-theme-warning)); }
.dh-tile-fail .dh-tile-n { color: rgb(var(--v-theme-error)); }
</style>
