<template>
  <div>
    <div class="sc-muted mb-2">Oldest first: this is the order in which new money covers the debt.</div>
    <v-data-table
      :headers="headers"
      :items="debts"
      item-value="reference"
      density="comfortable"
      :items-per-page="-1"
      hide-default-footer
      show-expand
      no-data-text="No debt registered"
    >
      <template #item.reference="{ item }">
        <strong>{{ item.reference }}</strong>
        <span class="sc-muted ml-2">{{ item.items_count }} {{ item.items_count === 1 ? 'item' : 'items' }}</span>
      </template>
      <template #item.original="{ item }">{{ formatCurrency(item.original) }}</template>
      <template #item.covered="{ item }"><span class="text-success">{{ formatCurrency(item.covered) }}</span></template>
      <template #item.pending="{ item }"><strong>{{ formatCurrency(item.pending) }}</strong></template>
      <template #item.status="{ item }">
        <v-chip :color="statusColor(item.status)" size="x-small" variant="tonal" label>{{ statusLabel(item.status) }}</v-chip>
      </template>
      <template #expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" class="pa-0">
            <v-table density="compact" class="sc-nested">
              <tbody>
                <tr v-for="row in item.items" :key="row.label">
                  <td class="pl-12">{{ row.label }}</td>
                  <td class="text-end">{{ formatCurrency(row.original) }}</td>
                  <td class="text-end text-success">{{ formatCurrency(row.covered) }}</td>
                  <td class="text-end"><strong>{{ formatCurrency(row.pending) }}</strong></td>
                  <td class="text-end"><v-chip :color="statusColor(row.status)" size="x-small" variant="tonal" label>{{ statusLabel(row.status) }}</v-chip></td>
                </tr>
              </tbody>
            </v-table>
          </td>
        </tr>
      </template>
      <template #tfoot>
        <tr class="sc-total-row">
          <td><strong>Total</strong></td>
          <td></td>
          <td class="text-end"><strong>{{ formatCurrency(totals.original) }}</strong></td>
          <td class="text-end text-success"><strong>{{ formatCurrency(totals.covered) }}</strong></td>
          <td class="text-end"><strong>{{ formatCurrency(totals.pending) }}</strong></td>
          <td></td>
          <td></td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ debts: any[] }>()
const { formatCurrency } = useReportFormatters()

const headers = [
  { title: 'Reference', key: 'reference', sortable: false },
  { title: 'ETD', key: 'date', sortable: false },
  { title: 'Debt', key: 'original', align: 'end', sortable: false },
  { title: 'Covered', key: 'covered', align: 'end', sortable: false },
  { title: 'Pending', key: 'pending', align: 'end', sortable: false },
  { title: '', key: 'status', align: 'end', sortable: false },
] as const

const totals = computed(() => ({
  original: props.debts.reduce((sum, row) => sum + row.original, 0),
  covered: props.debts.reduce((sum, row) => sum + row.covered, 0),
  pending: props.debts.reduce((sum, row) => sum + row.pending, 0),
}))

const statusColor = (status: string) => ({ settled: 'success', partial: 'warning', pending: 'grey' }[status] ?? 'grey')
const statusLabel = (status: string) => ({ settled: 'Covered', partial: 'In progress', pending: 'Open' }[status] ?? status)
</script>
