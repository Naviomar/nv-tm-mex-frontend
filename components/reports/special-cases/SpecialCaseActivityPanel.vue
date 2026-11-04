<template>
  <v-data-table
    :headers="headers"
    :items="activity"
    density="comfortable"
    :items-per-page="15"
    no-data-text="No movements yet"
  >
    <template #item.kind="{ item }">
      <v-chip size="x-small" variant="tonal" label :color="kindColor(item.kind)">{{ kindLabel(item.kind) }}</v-chip>
    </template>
    <template #item.flow="{ item }">
      <span v-if="item.source_reference"><strong>{{ item.source_reference }}</strong> <v-icon size="14">mdi-arrow-right</v-icon> </span>
      <span v-if="item.debt_reference"><strong>{{ item.debt_reference }}</strong> <span class="sc-muted">{{ item.debt_label }}</span></span>
      <span v-else-if="!item.source_reference">—</span>
    </template>
    <template #item.amount="{ item }"><strong :class="{ 'text-decoration-line-through sc-muted': item.status === 'reversed' }">{{ formatCurrency(item.amount) }}</strong></template>
    <template #item.status="{ item }">
      <v-chip :color="statusColor(item.status)" size="x-small" variant="tonal" label>{{ statusLabel(item.status) }}</v-chip>
      <v-tooltip v-if="item.error" :text="item.error" location="top">
        <template #activator="{ props: tip }"><v-icon v-bind="tip" color="error" size="16" class="ml-1">mdi-alert-circle-outline</v-icon></template>
      </v-tooltip>
    </template>
    <template #item.action="{ item }">
      <v-btn v-if="canManage && item.status !== 'reversed'" size="x-small" variant="text" color="error" @click="$emit('reverse', item)">Reverse</v-btn>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
defineProps<{ activity: any[]; canManage: boolean }>()
defineEmits<{ (e: 'reverse', item: any): void }>()
const { formatCurrency } = useReportFormatters()

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Type', key: 'kind', sortable: false },
  { title: 'From → To', key: 'flow', sortable: false },
  { title: 'Amount', key: 'amount', align: 'end' },
  { title: 'Status', key: 'status', sortable: false },
  { title: '', key: 'action', align: 'end', sortable: false },
] as const

const kindLabel = (kind: string) => ({ coverage: 'Coverage', advance: 'Marked collected', recovery: 'Withheld' }[kind] ?? kind)
const kindColor = (kind: string) => ({ coverage: 'primary', advance: 'warning', recovery: 'success' }[kind] ?? 'grey')
const statusColor = (status: string) => ({ applied: 'success', pending: 'warning', reversed: 'grey' }[status] ?? 'grey')
const statusLabel = (status: string) => ({ applied: 'Applied', pending: 'Not confirmed', reversed: 'Reversed' }[status] ?? status)
</script>
