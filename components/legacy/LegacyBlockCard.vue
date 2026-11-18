<template>
  <div v-intersect="{ handler: onIntersect, options: { rootMargin: '300px' } }">
    <v-card :color="tint === 'blue' ? 'light-blue-lighten-4' : tint === 'red' ? 'red-lighten-4' : undefined" :class="{ 'tm-tint-green': tint === 'green' }">
      <v-card-title>
        <div class="flex items-center gap-2">
          <v-icon v-if="icon" size="small">{{ icon }}</v-icon>
          <div class="font-bold">{{ title }}</div>
          <v-chip v-if="rowCount" size="x-small" variant="tonal">{{ rowCount }}</v-chip>
        </div>
      </v-card-title>
      <v-card-text>
        <v-skeleton-loader v-if="!requested || loading" type="table-row-divider@2" />
        <v-alert v-else-if="error" type="warning" variant="tonal" density="compact">{{ error }}</v-alert>
        <v-alert v-else-if="isEmpty" type="info" density="compact">No {{ title.toLowerCase() }} found</v-alert>
        <template v-else>
          <div v-if="block?.highlights?.length" class="legacy-highlights mb-4">
            <v-card v-for="h in block.highlights" :key="h.label" :color="toneColor(h.tone)" variant="tonal" density="compact">
              <v-card-text class="py-2">
                <div class="text-xs opacity-70">{{ h.label }}</div>
                <div class="text-lg font-bold">{{ formatToCurrency(h.value) }}</div>
                <div v-if="h.caption" class="text-xs opacity-70">{{ h.caption }}</div>
              </v-card-text>
            </v-card>
          </div>

          <div :class="layoutClass">
            <div v-for="table in tables" :key="table.key" :class="{ 'legacy-masonry-item': layout === 'masonry' }">
              <div v-if="tables.length > 1" class="font-bold text-base mb-1">{{ table.title }}</div>
              <v-alert v-if="!table.rows.length" type="info" density="compact" variant="tonal">No records</v-alert>
              <v-table v-else density="compact" style="height: auto">
                <thead>
                  <tr>
                    <th v-for="col in columnsOf(table)" :key="col.key" :class="isNumeric(table, col.key) ? 'text-right' : 'text-left'">
                      {{ col.label }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in table.rows" :key="i" :class="{ 'font-bold': row.strong }">
                    <td v-for="col in columnsOf(table)" :key="col.key" :class="cellClass(table, col.key)">
                      <v-chip v-if="col.key === 'status' && row[col.key]" size="x-small" variant="tonal" :color="statusColor(row[col.key])">
                        {{ row[col.key] }}
                      </v-chip>
                      <span v-else :class="valueClass(col.key, row[col.key])">{{ format(col.key, row[col.key]) }}</span>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </div>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
interface BlockTable {
  key: string
  title?: string
  columns: { key: string; label: string }[]
  rows: Record<string, any>[]
}
interface Highlight {
  label: string
  value: number
  caption?: string | null
  tone: 'neutral' | 'positive' | 'negative' | 'warning' | 'info'
}

// Card of a TM1 reference view whose data is requested the first time it is about to be seen,
// so a reference only costs the queries of the cards the user actually reaches.
// layout: stack (one under another), split (two columns) or masonry (balanced columns).
// tint: same card colors the TM2 view uses for invoices (blue), refunds (red) and profit (green).
const props = withDefaults(
  defineProps<{
    service: string
    id: string | number
    blockKey: string
    title: string
    icon?: string
    layout?: 'stack' | 'split' | 'masonry'
    tint?: 'blue' | 'red' | 'green'
  }>(),
  { layout: 'stack' },
)

const { $api } = useNuxtApp()

const block = ref<{ columns?: BlockTable['columns']; rows?: BlockTable['rows']; tables?: BlockTable[]; highlights?: Highlight[] } | null>(null)
const loading = ref(false)
const requested = ref(false)
const error = ref('')

const tables = computed<BlockTable[]>(() => {
  if (!block.value) return []
  return block.value.tables ?? [{ key: 'main', columns: block.value.columns ?? [], rows: block.value.rows ?? [] }]
})
const rowCount = computed(() => tables.value.reduce((sum, t) => sum + t.rows.length, 0))
const isEmpty = computed(() => !rowCount.value && !block.value?.highlights?.length)

const layoutClass = computed(() => ({
  stack: 'flex flex-col gap-4',
  split: 'grid gap-4 lg:grid-cols-2 items-start',
  masonry: 'legacy-masonry',
})[props.layout])

const onIntersect = async (isIntersecting: boolean) => {
  if (!isIntersecting || requested.value) return
  requested.value = true
  loading.value = true
  try {
    block.value = (await $api.legacy.getReferenceBlock(props.service, props.id, props.blockKey)) as any
  } catch (e: any) {
    const status = e?.response?.status
    error.value = status === 404 ? 'Not found in TM1.' : status === 403 ? 'You do not have access to this information.' : 'TM1 information is not available right now.'
  } finally {
    loading.value = false
  }
}

const moneyKeys = ['subtotal', 'vat', 'discount', 'total', 'invoice_total', 'line_cost', 'invoice_value', 'amount', 'paid', 'buy_amount', 'usd']
const wrapKeys = ['note', 'notification', 'recipients', 'comment', 'shipper', 'concepts', 'concept', 'supplier']

// Columns with no value in any row are noise: leave them out
const columnsOf = (table: BlockTable) =>
  table.columns.filter((c) => table.rows.some((r) => r[c.key] !== null && r[c.key] !== undefined && r[c.key] !== ''))

const isNumeric = (table: BlockTable, key: string) => table.rows.some((r) => typeof r[key] === 'number')

const toneColor = (tone: Highlight['tone']) =>
  ({ positive: 'success', negative: 'error', warning: 'warning', info: 'info', neutral: undefined })[tone]

const statusColor = (status: string) => {
  const s = status.toLowerCase()
  if (s.includes('cancel')) return 'error'
  if (s.includes('paid') || s.includes('refunded')) return 'success'
  if (s.includes('credit')) return 'info'
  return 'warning'
}

const cellClass = (table: BlockTable, key: string) => [
  isNumeric(table, key) ? 'text-right' : '',
  wrapKeys.includes(key) ? 'whitespace-normal break-words' : 'whitespace-nowrap',
]

const valueClass = (key: string, value: any) => {
  if (typeof value !== 'number' || !moneyKeys.includes(key)) return ''
  return value < 0 ? 'text-error' : ''
}

const format = (key: string, value: any) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return formatDateOnlyString(value)
  if (typeof value === 'number') return moneyKeys.includes(key) ? formatToCurrency(value) : value.toLocaleString('en-US')
  return value
}
</script>

<style scoped>
.legacy-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.75rem;
}
.legacy-masonry {
  column-gap: 1rem;
}
@media (min-width: 1024px) {
  .legacy-masonry {
    columns: 2;
  }
}
.legacy-masonry-item {
  break-inside: avoid;
  margin-bottom: 1rem;
}
</style>
