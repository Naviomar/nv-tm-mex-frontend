<template>
  <v-card class="sc-card sc-case-card" :class="{ 'sc-case-card--active': active }" elevation="0" @click="$emit('select')">
    <v-card-text class="pa-4">
      <div class="d-flex align-start justify-space-between ga-2">
        <div class="min-w-0">
          <div class="sc-case-name text-truncate">{{ item.name }}</div>
          <div class="sc-muted text-truncate">{{ item.customer_name }}</div>
        </div>
        <v-chip :color="statusColor" size="x-small" variant="tonal" label>{{ statusLabel }}</v-chip>
      </div>

      <div class="sc-case-pending mt-3">{{ formatCurrency(item.focus_value) }}</div>
      <div class="sc-muted">{{ item.focus_label }} of {{ formatCurrency(item.focus_of) }}</div>

      <v-progress-linear :model-value="item.progress" height="6" rounded :color="item.progress >= 100 ? 'success' : 'primary'" class="mt-3" />

      <div v-if="!item.live" class="mt-2">
        <v-chip color="warning" size="x-small" variant="tonal" prepend-icon="mdi-cloud-off-outline">TM1 not reachable</v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{ item: any; active: boolean }>()
defineEmits<{ (e: 'select'): void }>()

const { formatCurrency } = useReportFormatters()

const statusColor = computed(() => ({ settled: 'success', paused: 'grey', active: 'primary' }[props.item.status as string] ?? 'primary'))
const statusLabel = computed(() => ({ settled: 'Settled', paused: 'Paused', active: 'Active' }[props.item.status as string] ?? props.item.status))
</script>
