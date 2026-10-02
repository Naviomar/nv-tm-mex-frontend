<template>
  <v-tooltip location="top" :text="tooltip">
    <template #activator="{ props: tooltipProps }">
      <v-chip v-bind="tooltipProps" size="x-small" variant="tonal" :color="meta.color" class="font-weight-medium">
        <v-icon start size="12">{{ meta.icon }}</v-icon>
        {{ meta.label }}
      </v-chip>
    </template>
  </v-tooltip>
</template>
<script setup lang="ts">
// Estado del corte de un contenedor: pending (nunca enviado), outdated (cambió
// después del último envío) o sent. `cut_status` / `latest_cut` vienen del backend.
const props = defineProps<{
  status?: 'pending' | 'outdated' | 'sent' | string
  lastCut?: any
}>()

const META: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Cut pending', color: 'grey', icon: 'mdi-send-clock-outline' },
  outdated: { label: 'Changed since cut', color: 'warning', icon: 'mdi-alert-outline' },
  sent: { label: 'Cut sent', color: 'success', icon: 'mdi-check' },
}

const meta = computed(() => META[props.status ?? 'pending'] ?? META.pending)

const tooltip = computed(() => {
  if (!props.lastCut) return 'This container has not been included in any cut yet'
  const who = props.lastCut.creator?.name ?? 'System'
  const when = formatDateString(props.lastCut.created_at)
  return props.status === 'outdated'
    ? `Last cut sent ${when} by ${who}. Dates, rates or amounts changed afterwards — resend it`
    : `Last cut sent ${when} by ${who}`
})
</script>
