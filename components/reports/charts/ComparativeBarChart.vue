<template>
  <div>
    <!-- Per-year summary cards -->
    <v-row class="mb-2">
      <v-col
        v-for="(yd, idx) in chartData"
        :key="yd.year"
        cols="12"
        md="6"
        :lg="chartData.length > 2 ? 4 : 6"
      >
        <v-card
          class="year-summary-card"
          elevation="0"
          :style="{ animationDelay: `${idx * 90}ms`, '--ysc-accent': yearPalette[idx % yearPalette.length] }"
        >
          <div class="ysc-head" :style="{ borderColor: yearPalette[idx % yearPalette.length] }">
            <span class="ysc-year">{{ yd.year }}</span>
            <v-chip v-if="yd.is_locked" color="success" size="x-small" variant="flat">
              <v-icon size="12" start>mdi-lock</v-icon>Locked
            </v-chip>
          </div>
          <div class="ysc-body">
            <!-- Primary metric tiles -->
            <div class="ysc-tiles">
              <div class="ysc-tile ysc-tile-teus">
                <v-icon size="18" class="ysc-tile-icon">mdi-package-variant-closed</v-icon>
                <div>
                  <div class="ysc-tile-label">Total TEUs</div>
                  <div class="ysc-tile-value">{{ formatInt(yd.total_teus) }}</div>
                </div>
              </div>
              <div v-if="includeProfit" class="ysc-tile ysc-tile-profit">
                <v-icon size="18" class="ysc-tile-icon">mdi-cash-multiple</v-icon>
                <div>
                  <div class="ysc-tile-label">Total Profit</div>
                  <div class="ysc-tile-value text-success">{{ formatCurrency(yd.total_profit || 0) }}</div>
                </div>
              </div>
            </div>

            <!-- Comparable range sub-panel -->
            <div v-if="yd.comparable_range" class="ysc-comparable">
              <div class="ysc-comparable-title">
                <v-icon size="13" class="mr-1">mdi-calendar-check-outline</v-icon>
                Comparable through {{ formatCutoff(yd.comparable_range.cutoff) }}
              </div>
              <div class="ysc-comparable-grid">
                <div class="ysc-comparable-item">
                  <span class="ysc-label">TEUs</span>
                  <span class="ysc-value-sm">{{ formatInt(yd.comparable_range.teus) }}</span>
                </div>
                <div v-if="includeProfit" class="ysc-comparable-item">
                  <span class="ysc-label">Profit</span>
                  <span class="ysc-value-sm text-success">{{ formatCurrency(yd.comparable_range.profit || 0) }}</span>
                </div>
              </div>
            </div>

            <div
              v-if="includeEnTransito && isMaxYear(yd.year) && yd.without_eta?.teus > 0"
              class="ysc-entransito"
            >
              <v-icon size="16" color="warning" class="mr-1">mdi-truck-fast-outline</v-icon>
              <span class="ysc-label">En Transito</span>
              <span class="ysc-value-sm text-warning ml-auto">{{ formatInt(yd.without_eta.teus) }} TEUs</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main mixed chart + data table -->
    <ReportChartCard
      title="TEUs per Month — IMPO Maritime"
      :subtitle="includeProfit ? 'TEUs (bars) and Profit (lines)' : 'TEUs (bars)'"
      icon="mdi-chart-bar"
      type="line"
      :series="series"
      :options="options"
      :table-headers="tableHeaders"
      :table-items="tableItems"
      :table-totals="tableTotals"
      :height="500"
      :loading="loading"
      export-file-name="teus-per-month"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  chartData: any[]
  selectedYears: number[]
  includeProfit?: boolean
  includeEnTransito?: boolean
  loading?: boolean
}>(), {
  chartData: () => [],
  selectedYears: () => [],
  includeProfit: true,
  includeEnTransito: false,
  loading: false,
})

const { formatInt, formatCurrency, yearPalette, apexBaseOptions } = useReportFormatters()

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const maxYear = computed(() => props.selectedYears.length ? Math.max(...props.selectedYears) : null)
const isMaxYear = (year: number) => maxYear.value !== null && year === maxYear.value

const formatCutoff = (cutoff?: string) => {
  if (!cutoff) return ''
  const ts = new Date(cutoff + 'T00:00:00').getTime()
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(ts)
}

const monthsTeus = (yd: any) => monthLabels.map((_, i) => Number((yd.months?.[i]?.teus ?? 0).toFixed(2)))
const monthsProfit = (yd: any) => monthLabels.map((_, i) => Number((yd.months?.[i]?.profit ?? 0).toFixed(2)))
const monthsEnTransito = (yd: any) => monthLabels.map((_, i) => Number((yd.months?.[i]?.teus_without_eta ?? 0).toFixed(2)))

// Build series + axis grouping together. Profit lines are pushed ONLY when
// includeProfit is true (fixes the old bug where the line was always present).
const built = computed(() => {
  const series: any[] = []
  const colors: string[] = []
  const teusNames: string[] = []
  const profitNames: string[] = []

  props.chartData.forEach((yd: any, idx: number) => {
    const color = yearPalette[idx % yearPalette.length]
    const name = `${yd.year} TEUs`
    // Each year is its own stack group so years render side by side, while the
    // En Transito series shares the max year's group to stack on top of its bar.
    series.push({ name, type: 'column', group: `g${yd.year}`, data: monthsTeus(yd) })
    colors.push(color)
    teusNames.push(name)

    if (props.includeEnTransito && isMaxYear(yd.year)) {
      const enTransitoName = `${yd.year} En Transito`
      series.push({ name: enTransitoName, type: 'column', group: `g${yd.year}`, data: monthsEnTransito(yd) })
      colors.push('#f59e0b')
      teusNames.push(enTransitoName)
    }
  })

  if (props.includeProfit) {
    props.chartData.forEach((yd: any, idx: number) => {
      const color = yearPalette[idx % yearPalette.length]
      const name = `${yd.year} Profit`
      series.push({ name, type: 'line', data: monthsProfit(yd) })
      colors.push(color)
      profitNames.push(name)
    })
  }

  return { series, colors, teusNames, profitNames }
})

const series = computed(() => built.value.series)

const options = computed(() => {
  const { colors, teusNames, profitNames } = built.value
  const yaxis: any[] = [
    {
      seriesName: teusNames,
      title: { text: 'TEUs' },
      min: 0,
      labels: { formatter: (v: number) => formatInt(v) },
    },
  ]
  if (props.includeProfit && profitNames.length) {
    yaxis.push({
      seriesName: profitNames,
      opposite: true,
      title: { text: 'Profit (USD)' },
      labels: { formatter: (v: number) => formatCurrency(v) },
    })
  }

  // Stroke width per series in order: columns get 0, profit lines get 3.
  const builtSeries = built.value.series
  const strokeWidth = builtSeries.map((s: any) => (s.type === 'line' ? 3 : 0))

  // Per-column total: enable labels on every column series, but only render the
  // group total on the TOP-MOST NON-ZERO segment of each year group at each month.
  // (Labelling a zero-height top segment — e.g. En Transito = 0 — would render
  // nothing, which is why some 2026 totals were missing.)
  const columnIndices = builtSeries
    .map((s: any, i: number) => (s.type === 'column' ? i : -1))
    .filter((i: number) => i >= 0)

  return apexBaseOptions({
    chart: { type: 'line', stacked: true, toolbar: { show: true } },
    colors,
    stroke: { width: strokeWidth, curve: 'smooth' },
    plotOptions: {
      bar: {
        borderRadius: 3,
        columnWidth: '70%',
        // Place totals at the top of the (top non-zero) segment and never hide them,
        // so even very small bars (e.g. 11 TEUs) keep their label above the bar.
        dataLabels: { position: 'top', hideOverflowingLabels: false },
      },
    },
    markers: { size: props.includeProfit ? 4 : 0 },
    xaxis: { categories: monthLabels },
    yaxis,
    dataLabels: {
      enabled: true,
      enabledOnSeries: columnIndices,
      formatter: (val: number, opts: any) => {
        const cfg = opts?.w?.config?.series ?? []
        const grp = cfg[opts.seriesIndex]?.group
        const dp = opts.dataPointIndex
        let total = 0
        let topNonZeroIdx = -1
        cfg.forEach((s: any, i: number) => {
          if (s.type === 'column' && s.group === grp) {
            const v = Number(s.data?.[dp] ?? 0)
            total += v
            if (v > 0) topNonZeroIdx = i
          }
        })
        return opts.seriesIndex === topNonZeroIdx && total > 0 ? formatInt(total) : ''
      },
      offsetY: -8,
      style: { fontSize: '10px', fontWeight: 700, colors: ['#334155'] },
      background: {
        enabled: true,
        foreColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 3,
        opacity: 0.92,
        padding: 3,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      itemMargin: { horizontal: 10, vertical: 4 },
      fontSize: '12px',
      offsetY: 4,
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      y: {
        formatter: (v: number, opts: any) => {
          const name = opts?.w?.config?.series?.[opts.seriesIndex]?.name ?? ''
          return name.includes('Profit') ? formatCurrency(v) : `${formatInt(v)} TEUs`
        },
      },
    },
  })
})

// Data table: one row per month, columns per year (TEUs + Profit) + totals row.
const tableHeaders = computed(() => {
  const headers: any[] = [{ title: 'Month', key: 'month', align: 'start' }]
  props.chartData.forEach((yd: any) => {
    headers.push({ title: `${yd.year} TEUs`, key: `teus_${yd.year}`, align: 'end' })
    if (props.includeProfit) {
      headers.push({ title: `${yd.year} Profit`, key: `profit_${yd.year}`, align: 'end' })
    }
  })
  return headers
})

const tableItems = computed(() =>
  monthLabels.map((label, i) => {
    const row: any = { month: label }
    props.chartData.forEach((yd: any) => {
      row[`teus_${yd.year}`] = formatInt(yd.months?.[i]?.teus ?? 0)
      if (props.includeProfit) {
        row[`profit_${yd.year}`] = formatCurrency(yd.months?.[i]?.profit ?? 0)
      }
    })
    return row
  })
)

const tableTotals = computed(() => {
  const totals: Record<string, string> = {}
  props.chartData.forEach((yd: any) => {
    totals[`teus_${yd.year}`] = formatInt(yd.total_teus ?? 0)
    if (props.includeProfit) {
      totals[`profit_${yd.year}`] = formatCurrency(yd.total_profit ?? 0)
    }
  })
  return totals
})
</script>

<style scoped>
.year-summary-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  position: relative;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s ease;
  animation: ysc-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.year-summary-card::after {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--ysc-accent, var(--v-theme-primary));
  opacity: 0;
  transition: opacity 0.3s ease;
}
.year-summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px -18px rgba(0, 0, 0, 0.3);
}
.year-summary-card:hover::after {
  opacity: 1;
}
@keyframes ysc-enter {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.ysc-tile-value,
.ysc-value-sm {
  font-variant-numeric: tabular-nums;
}
.ysc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-left: 4px solid;
  background: rgba(var(--v-theme-on-surface), 0.02);
}
.ysc-year {
  font-size: 1.3rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}
.ysc-body {
  padding: 14px 16px 16px;
}

/* Primary metric tiles */
.ysc-tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.ysc-tiles > .ysc-tile:only-child {
  grid-column: 1 / -1;
}
.ysc-tile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.03);
}
.ysc-tile-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ysc-tile-teus .ysc-tile-icon {
  background: rgba(59, 130, 246, 0.14);
  color: #3b82f6;
}
.ysc-tile-profit .ysc-tile-icon {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}
.ysc-tile-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
.ysc-tile-value {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
  color: rgb(var(--v-theme-on-surface));
}

.ysc-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.ysc-value-sm {
  font-size: 1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

/* En Transito row */
.ysc-entransito {
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.1);
}

/* Comparable sub-panel */
.ysc-comparable {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px dashed rgba(var(--v-theme-primary), 0.35);
  background: rgba(var(--v-theme-primary), 0.04);
}
.ysc-comparable-title {
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(var(--v-theme-primary), 0.9);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
}
.ysc-comparable-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.ysc-comparable-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ysc-comparable-item:only-child {
  grid-column: 1 / -1;
}
</style>
