<template>
  <ReportChartCard
    :title="title"
    :icon="icon"
    :icon-color="color"
    subtitle="Year-over-year comparison"
    type="bar"
    :series="series"
    :options="options"
    :table-headers="tableHeaders"
    :table-items="tableItems"
    :table-totals="tableTotals"
    :height="height"
    :loading="loading"
    :export-file-name="exportFileName"
  />
</template>

<script setup lang="ts">
interface YearItem {
  year: number
  name: string
  teus: number
}

const props = withDefaults(defineProps<{
  title: string
  icon?: string
  color?: string
  items: YearItem[]
  years: number[]
  loading?: boolean
  height?: number
  /** Limit how many categories (by combined TEUs across years) are charted. */
  topN?: number
  exportFileName?: string
}>(), {
  icon: 'mdi-chart-bar',
  color: 'primary',
  items: () => [],
  years: () => [],
  exportFileName: 'year-comparison',
  loading: false,
  height: 420,
  topN: 10,
})

const { formatInt, yearPalette, apexBaseOptions } = useReportFormatters()

const sortedYears = computed(() => [...props.years].sort((a, b) => a - b))

// Rank categories by their combined TEUs across all years, then keep topN.
const topCategories = computed(() => {
  const totals = new Map<string, number>()
  props.items.forEach(i => totals.set(i.name, (totals.get(i.name) ?? 0) + (i.teus || 0)))
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, props.topN)
    .map(([name]) => name)
})

const teusFor = (year: number, name: string) =>
  props.items.find(i => i.year === year && i.name === name)?.teus ?? 0

const series = computed(() =>
  sortedYears.value.map((year, idx) => ({
    name: String(year),
    data: topCategories.value.map(name => Number(teusFor(year, name).toFixed(2))),
  }))
)

const options = computed(() => apexBaseOptions({
  chart: { type: 'bar', toolbar: { show: true } },
  colors: sortedYears.value.map((_, idx) => yearPalette[idx % yearPalette.length]),
  plotOptions: { bar: { borderRadius: 4, columnWidth: '65%' } },
  xaxis: {
    categories: topCategories.value,
    labels: { rotate: -45, rotateAlways: topCategories.value.length > 6, style: { fontSize: '11px' } },
  },
  yaxis: { title: { text: 'TEUs' }, labels: { formatter: (v: number) => formatInt(v) } },
  dataLabels: { enabled: false },
  legend: { position: 'top' },
  tooltip: { theme: 'dark', y: { formatter: (v: number) => `${formatInt(v)} TEUs` } },
}))

const tableHeaders = computed(() => {
  const headers: any[] = [{ title: 'Name', key: 'name', align: 'start' }]
  sortedYears.value.forEach(year => headers.push({ title: String(year), key: `y${year}`, align: 'end' }))
  return headers
})

const tableItems = computed(() =>
  topCategories.value.map(name => {
    const row: any = { name }
    sortedYears.value.forEach(year => { row[`y${year}`] = formatInt(teusFor(year, name)) })
    return row
  })
)

const tableTotals = computed(() => {
  const totals: Record<string, string> = {}
  sortedYears.value.forEach(year => {
    const sum = topCategories.value.reduce((a, name) => a + teusFor(year, name), 0)
    totals[`y${year}`] = formatInt(sum)
  })
  return totals
})
</script>
