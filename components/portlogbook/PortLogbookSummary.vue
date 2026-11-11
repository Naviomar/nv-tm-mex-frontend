<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <v-card
      v-for="card in cards"
      :key="card.key"
      elevation="0"
      class="pa-3 summary-card"
      :class="{ 'summary-card--link': !!card.status }"
      @click="card.status ? emit('select-status', card.status) : undefined"
    >
      <div class="flex items-center gap-3">
        <v-avatar size="42" :color="card.value ? card.color : 'secondary'" variant="tonal"><v-icon>{{ card.icon }}</v-icon></v-avatar>
        <div>
          <div class="text-h5 font-weight-bold leading-tight">{{ card.value }}</div>
          <div class="text-caption text-medium-emphasis">{{ card.label }}</div>
        </div>
      </div>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ summary: Record<string, number> }>()
const emit = defineEmits(['select-status'])

const cards = computed(() => [
  { key: 'active', label: 'Active events', value: props.summary.active_events ?? 0, icon: 'mdi-alert-circle-outline', color: 'error', status: 'active' },
  { key: 'closed', label: 'Ports closed now', value: props.summary.closed_ports ?? 0, icon: 'mdi-lock-outline', color: 'error', status: null },
  { key: 'scheduled', label: 'Scheduled', value: props.summary.scheduled_events ?? 0, icon: 'mdi-calendar-clock-outline', color: 'secondary', status: 'scheduled' },
  { key: 'resolved', label: 'Resolved (30 days)', value: props.summary.resolved_last_30_days ?? 0, icon: 'mdi-check-circle-outline', color: 'success', status: 'resolved' },
])
</script>
<style scoped>
.summary-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.summary-card--link {
  cursor: pointer;
}
.summary-card--link:hover {
  border-color: rgb(var(--v-theme-primary));
}
</style>
