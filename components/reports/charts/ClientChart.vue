<template>
  <ReportChartCard
    title="References by Client"
    subtitle="Top 10 clients by TEUs"
    icon="mdi-account-group"
    type="donut"
    :series="series"
    :options="options"
    :table-headers="tableHeaders"
    :table-items="tableItems"
    :table-totals="tableTotals"
    :height="460"
    :loading="loading"
  >
    <!-- Chart slot: donut beside a totals summary panel -->
    <template #chart>
      <v-row align="center">
        <v-col cols="12" md="7">
          <client-only>
            <apexchart type="donut" :height="460" :options="options" :series="series" />
            <template #fallback><v-skeleton-loader type="image" :height="460" /></template>
          </client-only>
        </v-col>
        <v-col cols="12" md="5">
          <div class="client-summary">
            <div class="cs-row">
              <span class="cs-label">Total clients</span>
              <span class="cs-value">{{ formatInt(totalClients) }}</span>
            </div>
            <div class="cs-row">
              <span class="cs-label">Total TEUs</span>
              <span class="cs-value">{{ formatInt(totalTeus) }}</span>
            </div>
            <div class="cs-row">
              <span class="cs-label">Top 10 TEUs</span>
              <span class="cs-value">{{ formatInt(top10Teus) }}</span>
            </div>
            <div class="cs-row">
              <span class="cs-label">Top 10 share</span>
              <span class="cs-value">{{ top10Share }}%</span>
            </div>
            <v-divider class="my-2" />
            <div class="cs-row cs-muted">
              <span class="cs-label">Others ({{ formatInt(othersCount) }})</span>
              <span class="cs-value">{{ formatInt(othersTeus) }}</span>
            </div>
          </div>
        </v-col>
      </v-row>
    </template>
  </ReportChartCard>
</template>

<script setup lang="ts">
interface ClientItem {
  name: string
  teus: number
}

const props = withDefaults(defineProps<{
  items: ClientItem[]
  loading?: boolean
}>(), {
  items: () => [],
  loading: false,
})

const { formatInt, categoryPalette, apexBaseOptions } = useReportFormatters()

// Exclude clients with no TEUs (zero-value entries add noise).
const nonZero = computed(() => props.items.filter(i => (i.teus || 0) > 0))
const sorted = computed(() => [...nonZero.value].sort((a, b) => b.teus - a.teus))
const top10 = computed(() => sorted.value.slice(0, 10))

const totalClients = computed(() => nonZero.value.length)
const totalTeus = computed(() => nonZero.value.reduce((a, b) => a + (b.teus || 0), 0))
const top10Teus = computed(() => top10.value.reduce((a, b) => a + (b.teus || 0), 0))
const top10Share = computed(() => totalTeus.value > 0 ? ((top10Teus.value / totalTeus.value) * 100).toFixed(1) : '0')
const othersCount = computed(() => Math.max(0, totalClients.value - top10.value.length))
const othersTeus = computed(() => totalTeus.value - top10Teus.value)

// Donut = top 10 slices + an aggregated "Otros" slice for the remaining clients.
const hasOthers = computed(() => othersTeus.value > 0.001 && othersCount.value > 0)

const series = computed(() => {
  const data = top10.value.map(i => Number(i.teus.toFixed(2)))
  if (hasOthers.value) data.push(Number(othersTeus.value.toFixed(2)))
  return data
})

const donutLabels = computed(() => {
  const labels = top10.value.map(i => i.name)
  if (hasOthers.value) labels.push('Otros')
  return labels
})

const donutColors = computed(() => {
  const colors = top10.value.map((_, i) => categoryPalette[i % categoryPalette.length])
  if (hasOthers.value) colors.push('#94a3b8') // neutral grey for "Otros"
  return colors
})

const options = computed(() => apexBaseOptions({
  chart: { type: 'donut' },
  labels: donutLabels.value,
  colors: donutColors.value,
  legend: { position: 'bottom', fontSize: '11px' },
  dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%` },
  plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'Total', formatter: () => formatInt(totalTeus.value) } } } } },
  tooltip: { theme: 'dark', y: { formatter: (v: number) => `${formatInt(v)} TEUs` } },
}))

const tableHeaders = [
  { title: 'Client', key: 'name', align: 'start' as const },
  { title: 'TEUs', key: 'teusFmt', align: 'end' as const },
  { title: 'Share', key: 'shareFmt', align: 'end' as const },
]

const tableItems = computed(() => sorted.value.map(i => ({
  name: i.name,
  teusFmt: formatInt(i.teus),
  shareFmt: totalTeus.value > 0 ? `${((i.teus / totalTeus.value) * 100).toFixed(1)}%` : '0%',
})))

const tableTotals = computed(() => ({
  teusFmt: formatInt(totalTeus.value),
  shareFmt: '100%',
}))
</script>

<style scoped>
.client-summary {
  padding: 12px 16px;
  background: rgba(var(--v-theme-primary), 0.04);
  border-radius: 12px;
}
.cs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}
.cs-label {
  font-size: 0.82rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.cs-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}
.cs-muted .cs-value {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-weight: 600;
}
</style>
