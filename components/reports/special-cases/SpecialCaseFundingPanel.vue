<template>
  <div class="d-flex flex-column ga-6">
    <section>
      <div class="sc-section-title">Money already used <v-chip size="x-small" variant="tonal" class="ml-2">{{ sources.length }}</v-chip></div>
      <v-data-table
        :headers="usedHeaders"
        :items="sources"
        density="comfortable"
        :items-per-page="10"
        no-data-text="No reference has contributed yet"
      >
        <template #item.reference="{ item }">
          <strong>{{ item.reference }}</strong>
          <v-chip size="x-small" variant="tonal" class="ml-2" label>{{ item.system }}</v-chip>
        </template>
        <template #item.amount="{ item }">{{ formatCurrency(item.amount) }}</template>
        <template #item.used="{ item }"><span class="text-success">{{ formatCurrency(item.used) }}</span></template>
        <template #item.remaining="{ item }">{{ item.remaining > 0 ? formatCurrency(item.remaining) : '—' }}</template>
        <template #item.note="{ item }">
          <v-chip v-if="item.neutralization?.status === 'applied'" color="success" size="x-small" variant="tonal" label>Profit adjusted</v-chip>
          <v-chip v-else-if="item.neutralization?.status === 'failed'" color="error" size="x-small" variant="tonal" label>Note failed</v-chip>
          <span v-else class="sc-muted">—</span>
          <v-tooltip v-if="item.still_paid === false" text="Its freight invoice is not paid anymore" location="top">
            <template #activator="{ props: tip }">
              <v-icon v-bind="tip" color="warning" size="18" class="ml-2">mdi-alert-outline</v-icon>
            </template>
          </v-tooltip>
        </template>
        <template #tfoot>
          <tr class="sc-total-row">
            <td><strong>Total</strong></td>
            <td></td>
            <td class="text-end"><strong>{{ formatCurrency(usedTotals.amount) }}</strong></td>
            <td class="text-end text-success"><strong>{{ formatCurrency(usedTotals.used) }}</strong></td>
            <td class="text-end"><strong>{{ formatCurrency(usedTotals.remaining) }}</strong></td>
            <td></td>
          </tr>
        </template>
      </v-data-table>
    </section>

    <section v-if="upcoming.length">
      <div class="sc-section-title">
        On the way: freight not paid yet
        <v-chip size="x-small" variant="tonal" color="warning" class="ml-2">{{ upcoming.length }}</v-chip>
        <span class="sc-muted ml-3">{{ formatCurrency(upcomingTotal) }} when they are paid</span>
      </div>
      <v-data-table :headers="upcomingHeaders" :items="upcoming" density="comfortable" :items-per-page="10">
        <template #item.reference="{ item }"><strong>{{ item.reference }}</strong><v-chip size="x-small" variant="tonal" class="ml-2" label>{{ item.system }}</v-chip></template>
        <template #item.amount="{ item }">{{ formatCurrency(item.amount) }}</template>
        <template #tfoot>
          <tr class="sc-total-row">
            <td><strong>Total</strong></td>
            <td></td>
            <td></td>
            <td class="text-end"><strong>{{ formatCurrency(upcomingTotal) }}</strong></td>
          </tr>
        </template>
      </v-data-table>
    </section>

    <section v-if="candidates.length || mode === 'upfront'">
      <div class="sc-section-title">{{ mode === 'on_rebate_payment' ? 'Customer rebate not paid yet' : 'Rebate that can be withheld' }}</div>
      <div v-if="mode === 'on_rebate_payment'" class="sc-muted mb-2">The debt is withheld automatically when a rebate payment request is created and covered when it is marked as paid.</div>
      <div v-else class="sc-muted mb-2">Confirming a retention only records it. Whoever pays the rebate must deliver the reduced amount.</div>
      <v-data-table :headers="candidateHeaders" :items="candidates" density="comfortable" :items-per-page="10" no-data-text="No future reference with rebate yet">
        <template #item.amount="{ item }">{{ formatCurrency(item.amount) }}</template>
        <template #item.remaining="{ item }">{{ formatCurrency(item.remaining) }}</template>
        <template #item.action="{ item }">
          <v-btn v-if="canManage && mode === 'upfront'" size="small" variant="tonal" color="primary" :disabled="item.remaining <= 0 || toRecover <= 0" @click="$emit('recover', item)">
            Withhold
          </v-btn>
        </template>
      </v-data-table>
    </section>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ sources: any[]; upcoming: any[]; candidates: any[]; mode: string; toRecover: number; canManage: boolean }>()
defineEmits<{ (e: 'recover', item: any): void }>()
const { formatCurrency } = useReportFormatters()

const usedHeaders = [
  { title: 'Reference', key: 'reference' },
  { title: 'ETD', key: 'date' },
  { title: 'Collected', key: 'amount', align: 'end' },
  { title: 'Used', key: 'used', align: 'end' },
  { title: 'Unused', key: 'remaining', align: 'end' },
  { title: 'Profit', key: 'note', sortable: false },
] as const
const upcomingHeaders = [
  { title: 'Reference', key: 'reference' },
  { title: 'ETD', key: 'date' },
  { title: 'Invoice', key: 'invoice' },
  { title: 'Amount', key: 'amount', align: 'end' },
] as const
const candidateHeaders = [
  { title: 'Reference', key: 'reference' },
  { title: 'ETD', key: 'date' },
  { title: 'Rebate', key: 'amount', align: 'end' },
  { title: 'Available', key: 'remaining', align: 'end' },
  { title: '', key: 'action', align: 'end', sortable: false },
] as const

const usedTotals = computed(() => ({
  amount: props.sources.reduce((sum, row) => sum + (row.amount ?? 0), 0),
  used: props.sources.reduce((sum, row) => sum + (row.used ?? 0), 0),
  remaining: props.sources.reduce((sum, row) => sum + (row.remaining ?? 0), 0),
}))
const upcomingTotal = computed(() => props.upcoming.reduce((sum, row) => sum + row.amount, 0))
</script>
