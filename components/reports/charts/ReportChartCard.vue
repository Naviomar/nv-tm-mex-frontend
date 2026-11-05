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
        <v-btn
          size="small"
          variant="outlined"
          color="primary"
          :loading="exportingImage"
          @click="exportChartAsImage(false)"
        >
          <v-icon size="18" start>mdi-camera-outline</v-icon>
          Imagen
        </v-btn>
        <v-btn
          size="small"
          variant="tonal"
          color="primary"
          @click="modalOpen = true"
        >
          <v-icon size="18" start>mdi-arrow-expand-all</v-icon>
          Ampliar
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
        <div v-show="view === 'chart'" :id="cardChartId" class="rcc-view">
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

    <!-- Modal para gráfica en tamaño completo -->
    <v-dialog
      v-model="modalOpen"
      max-width="1280px"
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="rounded-xl overflow-hidden" elevation="10">
        <!-- Dialog Header -->
        <div class="d-flex justify-space-between align-center px-6 py-4 border-b bg-surface flex-wrap gap-2">
          <div class="d-flex align-center gap-3">
            <div v-if="icon" class="rcc-icon-badge" :style="iconBadgeStyle">
              <v-icon :color="iconColor" size="24">{{ icon }}</v-icon>
            </div>
            <div>
              <div class="text-h6 font-weight-bold">{{ title }}</div>
              <div v-if="subtitle" class="text-caption text-grey">{{ subtitle }}</div>
            </div>
          </div>
          <div class="d-flex align-center gap-2">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              prepend-icon="mdi-download"
              class="text-capitalize font-weight-medium"
              :loading="exportingImage"
              @click="exportChartAsImage(true)"
            >
              Exportar Imagen (PNG)
            </v-btn>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              @click="modalOpen = false"
            />
          </div>
        </div>

        <!-- Dialog Body -->
        <v-card-text class="pa-6 bg-grey-lighten-5">
          <div :id="modalChartId" class="bg-surface pa-4 rounded-lg border">
            <client-only>
              <apexchart
                :type="type"
                height="560"
                :options="modalChartOptions"
                :series="series"
              />
            </client-only>
          </div>
        </v-card-text>

        <!-- Dialog Footer -->
        <v-divider />
        <v-card-actions class="px-6 py-3 bg-surface d-flex justify-end">
          <v-btn
            variant="outlined"
            size="small"
            class="text-capitalize"
            @click="modalOpen = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
const snackbar = useSnackbar()

const uid = Math.random().toString(36).substring(2, 9)
const cardChartId = `rcc-chart-${uid}`
const modalChartId = `rcc-modal-chart-${uid}`

const view = ref<'chart' | 'table'>(props.defaultView)
const exporting = ref(false)
const modalOpen = ref(false)
const exportingImage = ref(false)

const heightPx = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height
)

const modalChartOptions = computed(() => ({
  ...(props.options || {}),
  chart: {
    ...((props.options && props.options.chart) || {}),
    toolbar: { show: true, tools: { download: true, zoom: true, pan: true, reset: true } },
  },
}))

const exportChartAsImage = async (fromModal = false) => {
  exportingImage.value = true
  try {
    const targetId = fromModal ? modalChartId : cardChartId
    const container = document.getElementById(targetId)
    if (!container) {
      snackbar?.add?.({ type: 'error', text: 'No se encontró la gráfica para exportar.' })
      return
    }

    const svgElement = container.querySelector('svg.apexcharts-svg') as SVGSVGElement | null
    if (!svgElement) {
      snackbar?.add?.({ type: 'warning', text: 'La gráfica aún se está cargando. Intente en un momento.' })
      return
    }

    const clone = svgElement.cloneNode(true) as SVGSVGElement
    clone.style.backgroundColor = '#ffffff'
    clone.setAttribute('background-color', '#ffffff')

    const svgWidth = parseFloat(svgElement.getAttribute('width') || String(svgElement.clientWidth || 900))
    const svgHeight = parseFloat(svgElement.getAttribute('height') || String(svgElement.clientHeight || 500))

    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(clone)

    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
    }

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const blobUrl = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = svgWidth * scale
      canvas.height = svgHeight * scale

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(blobUrl)
        return
      }

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0, svgWidth, svgHeight)

      URL.revokeObjectURL(blobUrl)

      const pngUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = pngUrl
      const baseName = (props.exportFileName || props.title || 'grafica').toLowerCase().replace(/[^a-z0-9_-]/g, '_')
      a.download = `${baseName}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      snackbar?.add?.({ type: 'success', text: 'Gráfica exportada como imagen PNG.' })
    }
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl)
      snackbar?.add?.({ type: 'error', text: 'Error al procesar la imagen de la gráfica.' })
    }
    img.src = blobUrl
  } catch (err: any) {
    console.error('Error exportChartAsImage:', err)
    snackbar?.add?.({ type: 'error', text: 'Error al exportar la imagen.' })
  } finally {
    exportingImage.value = false
  }
}

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
