<template>
  <ReportChartCard
    :title="title"
    :icon="icon"
    :icon-color="color"
    :subtitle="subtitle"
    type="bar"
    :series="series"
    :options="options"
    :table-headers="tableHeaders"
    :table-items="items"
    :table-totals="tableTotals"
    :height="height"
    :loading="loading"
    :export-file-name="exportFileName"
  />
</template>

<script setup lang="ts">
interface CategoryItem {
  name: string
  teus: number
  references: number
}

const props = withDefaults(defineProps<{
  title: string
  icon?: string
  color?: string
  subtitle?: string
  items: CategoryItem[]
  loading?: boolean
  height?: number
  /** Limit the bars shown in the chart (table always shows all). */
  topN?: number
  /** Whether the underlying data carries a references count. */
  showReferences?: boolean
  exportFileName?: string
}>(), {
  icon: 'mdi-chart-bar',
  color: 'primary',
  items: () => [],
  loading: false,
  height: 420,
  topN: 0,
  showReferences: true,
  exportFileName: 'report',
})

const { formatInt, categoryPalette, apexBaseOptions } = useReportFormatters()

// Hide entries with no TEUs (zero-value bars/rows add noise).
const visibleItems = computed(() => props.items.filter(i => (i.teus || 0) > 0))

const grandTotal = computed(() => visibleItems.value.reduce((a, b) => a + (b.teus || 0), 0))
const pct = (teus: number) => (grandTotal.value > 0 ? (teus / grandTotal.value) * 100 : 0)

const chartItems = computed(() =>
  props.topN > 0 ? visibleItems.value.slice(0, props.topN) : visibleItems.value
)

const series = computed(() => [{
  name: 'TEUs',
  data: chartItems.value.map(i => Number(i.teus.toFixed(2))),
}])

const options = computed(() => apexBaseOptions({
  chart: { type: 'bar', toolbar: { show: true } },
  colors: [props.color === 'primary' ? categoryPalette[0] : props.color],
  plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '60%', distributed: false, dataLabels: { position: 'top' } } },
  xaxis: {
    categories: chartItems.value.map(i => i.name),
    labels: { rotate: -45, rotateAlways: chartItems.value.length > 8, style: { fontSize: '11px' } },
  },
  yaxis: { title: { text: 'TEUs' }, labels: { formatter: (v: number) => formatInt(v) } },
  // Show each bar's share of the grand total above it.
  dataLabels: {
    enabled: true,
    offsetY: -18,
    formatter: (v: number) => `${pct(v).toFixed(1)}%`,
    style: { fontSize: '10px', fontWeight: 700, colors: ['#475569'] },
    background: { enabled: false },
  },
  tooltip: {
    theme: 'dark',
    y: { formatter: (v: number) => `${formatInt(v)} TEUs (${pct(v).toFixed(1)}%)` },
  },
}))

const tableHeaders = computed(() => {
  const headers: any[] = [
    { title: 'Name', key: 'name', align: 'start' },
    { title: 'TEUs', key: 'teusFmt', align: 'end' },
    { title: 'Share', key: 'shareFmt', align: 'end' },
  ]
  if (props.showReferences) {
    headers.push({ title: 'References', key: 'referencesFmt', align: 'end' })
  }
  return headers
})

const items = computed(() => visibleItems.value.map(i => ({
  ...i,
  teusFmt: formatInt(i.teus),
  shareFmt: `${pct(i.teus).toFixed(1)}%`,
  referencesFmt: formatInt(i.references),
})))

const tableTotals = computed(() => {
  const totals: Record<string, string> = {
    teusFmt: formatInt(grandTotal.value),
    shareFmt: '100%',
  }
  if (props.showReferences) {
    totals.referencesFmt = formatInt(visibleItems.value.reduce((a, b) => a + (b.references || 0), 0))
  }
  return totals
})
</script>
