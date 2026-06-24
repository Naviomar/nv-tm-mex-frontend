<template>
  <v-card class="report-chart-card" elevation="0">
    <div class="rcc-header">
      <div class="rcc-title">
        <div v-if="icon" class="rcc-icon-badge" :style="iconBadgeStyle">
          <v-icon :color="iconColor" size="20">{{ icon }}</v-icon>
        </div>
        <div>
          <div class="rcc-title-text">{{ title }}</div>
          <div v-if="subtitle" class="rcc-subtitle">{{ subtitle }}</div>
        </div>
      </div>
      <div class="rcc-actions">
        <slot name="actions" />
        <v-btn
          v-if="tableItems.length"
          size="small"
          variant="outlined"
          color="success"
          :loading="exporting"
          @click="handleExport"
        >
          <v-icon size="18" start>mdi-file-excel-outline</v-icon>
          Excel
        </v-btn>
        <v-btn-toggle
          v-model="view"
          mandatory
          density="comfortable"
          variant="outlined"
          divided
          color="primary"
        >
          <v-btn value="chart" size="small">
            <v-icon size="18">mdi-chart-bar</v-icon>
          </v-btn>
          <v-btn value="table" size="small">
            <v-icon size="18">mdi-table</v-icon>
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <v-divider />

    <v-card-text class="pa-4">
      <div v-if="loading" class="d-flex justify-center align-center" :style="{ height: heightPx }">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <template v-else>
        <!-- Chart view -->
        <div v-show="view === 'chart'" class="rcc-view">
          <slot name="chart">
            <client-only>
              <apexchart
                :type="type"
                :height="height"
                :options="options"
                :series="series"
              />
              <template #fallback>
                <v-skeleton-loader type="image" :height="height" />
              </template>
            </client-only>
          </slot>
        </div>

        <!-- Table view -->
        <Transition name="rcc-view-fade">
        <div v-if="view === 'table'" class="rcc-view">
          <v-data-table
            :headers="tableHeaders"
            :items="tableItems"
            :items-per-page="tableItemsPerPage"
            density="comfortable"
            class="rcc-table"
            :items-per-page-options="[10, 25, 50, 100, -1]"
          >
            <template v-if="tableTotals" #body.append>
              <tr class="rcc-totals-row">
                <td
                  v-for="(header, idx) in tableHeaders"
                  :key="header.key"
                  :class="['font-weight-bold', headerAlignClass(header)]"
                >
                  <template v-if="idx === 0 && tableTotals[header.key] === undefined">Total</template>
                  <template v-else>{{ tableTotals[header.key] ?? '' }}</template>
                </td>
              </tr>
            </template>
          </v-data-table>
        </div>
        </Transition>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface TableHeader {
  title: string
  key: string
  align?: 'start' | 'center' | 'end'
}

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  icon?: string
  iconColor?: string
  type?: 'bar' | 'line' | 'pie' | 'donut' | 'area'
  series?: any
  options?: any
  tableHeaders?: TableHeader[]
  tableItems?: any[]
  tableTotals?: Record<string, number | string>
  height?: number | string
  loading?: boolean
  defaultView?: 'chart' | 'table'
  tableItemsPerPage?: number
  /** Base file name (without extension) used when exporting the table to Excel. */
  exportFileName?: string
}>(), {
  iconColor: 'primary',
  type: 'bar',
  series: () => [],
  options: () => ({}),
  tableHeaders: () => [],
  tableItems: () => [],
  height: 400,
  loading: false,
  defaultView: 'chart',
  tableItemsPerPage: 10,
  exportFileName: 'report',
})

const { exportTableToExcel } = useExcelExport()

const view = ref<'chart' | 'table'>(props.defaultView)
const exporting = ref(false)

const heightPx = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height
)

const handleExport = async () => {
  exporting.value = true
  try {
    await exportTableToExcel(props.tableHeaders, props.tableItems, props.tableTotals, props.exportFileName, props.title)
  } finally {
    exporting.value = false
  }
}

// Soft tinted badge behind the icon. Works for hex colors; named Vuetify colors
// fall back to a neutral primary tint.
const iconBadgeStyle = computed(() => {
  const c = props.iconColor
  if (c?.startsWith('#')) {
    const hex = c.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return { background: `rgba(${r}, ${g}, ${b}, 0.12)` }
  }
  return { background: 'rgba(var(--v-theme-primary), 0.1)' }
})

const headerAlignClass = (header: TableHeader) =>
  header.align === 'end' ? 'text-right' : header.align === 'center' ? 'text-center' : 'text-left'
</script>

<style scoped>
.report-chart-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s ease;
  animation: rcc-enter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.report-chart-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px -16px rgba(0, 0, 0, 0.28);
  border-color: rgba(var(--v-theme-primary), 0.35);
}

@keyframes rcc-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* View toggle transition (chart <-> table) */
.rcc-view-fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.rcc-view-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.rcc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  flex-wrap: wrap;
  background: linear-gradient(
    180deg,
    rgba(var(--v-theme-on-surface), 0.022) 0%,
    rgba(var(--v-theme-on-surface), 0) 100%
  );
}

.rcc-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.rcc-icon-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rcc-title-text {
  font-size: 1.02rem;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}

.rcc-subtitle {
  font-size: 0.76rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.rcc-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rcc-totals-row td {
  border-top: 2px solid rgba(var(--v-border-color), 0.4);
  background: rgba(var(--v-theme-primary), 0.04);
}
</style>
