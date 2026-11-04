<template>
  <div>
    <div class="sc-muted mb-3">
      Profit of the references involved. The references that paid the debt lose the covered amount; the ones that owed it keep their demurrage as collected.
    </div>

    <div v-if="loading" class="d-flex justify-center pa-8"><v-progress-circular indeterminate color="primary" /></div>

    <template v-else-if="impact?.rows">
      <v-row dense class="mb-2">
        <v-col v-for="stat in stats" :key="stat.label" cols="6" md="3">
          <div class="sc-stat">
            <div class="sc-muted">{{ stat.label }}</div>
            <div class="sc-stat-value">{{ formatCurrency(stat.value) }}</div>
          </div>
        </v-col>
      </v-row>

      <v-data-table :headers="headers" :items="impact.rows" density="comfortable" :items-per-page="15" no-data-text="Nothing to show yet">
        <template #item.reference="{ item }">
          <strong>{{ item.reference }}</strong>
          <v-chip size="x-small" variant="tonal" label class="ml-2" :color="item.role === 'debt' ? 'warning' : 'primary'">{{ item.role === 'debt' ? 'Owed' : 'Paid' }}</v-chip>
        </template>
        <template #item.sell="{ item }">{{ money(item.sell) }}</template>
        <template #item.cost="{ item }">{{ money(item.cost) }}</template>
        <template #item.rebate="{ item }">{{ money(item.rebate) }}</template>
        <template #item.profit="{ item }"><strong :class="{ 'text-error': item.profit < 0 }">{{ money(item.profit) }}</strong></template>
        <template #item.adjust="{ item }">
          <span v-if="item.role === 'source' && item.neutralized">− {{ formatCurrency(item.neutralized) }}</span>
          <span v-else-if="item.role === 'debt' && item.covered" class="text-success">{{ formatCurrency(item.covered) }} collected</span>
          <span v-else class="sc-muted">—</span>
        </template>
      </v-data-table>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ impact: any | null; loading: boolean }>()
const { formatCurrency } = useReportFormatters()

const money = (value: number | null) => (value === null || value === undefined ? '—' : formatCurrency(value))

const headers = [
  { title: 'Reference', key: 'reference' },
  { title: 'Customer', key: 'consignee' },
  { title: 'Sell', key: 'sell', align: 'end' },
  { title: 'Cost', key: 'cost', align: 'end' },
  { title: 'Rebate', key: 'rebate', align: 'end' },
  { title: 'Profit', key: 'profit', align: 'end' },
  { title: 'Case effect', key: 'adjust', align: 'end', sortable: false },
] as const

const stats = computed(() => [
  { label: 'Profit of references that owed', value: props.impact?.totals?.debt ?? 0 },
  { label: 'Profit of references that paid', value: props.impact?.totals?.source ?? 0 },
  { label: 'Taken off the paying references', value: props.impact?.totals?.neutralized ?? 0 },
  { label: 'Marked as collected', value: props.impact?.totals?.covered ?? 0 },
])
</script>
