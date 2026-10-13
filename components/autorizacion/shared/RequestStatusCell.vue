<template>
  <div class="status-cell">
    <v-chip size="small" :color="state.color" variant="tonal" label>
      <v-icon start size="14">{{ state.icon }}</v-icon>{{ state.label }}
    </v-chip>
    <div v-if="state.detail" class="status-cell__detail">{{ state.detail }}</div>
    <div v-if="reason" class="status-cell__reason" :title="reason">“{{ reason }}”</div>
    <v-tooltip v-if="sigaLink" location="top">
      <template #activator="{ props: tip }">
        <v-chip v-bind="tip" size="x-small" variant="tonal" :color="sigaLink.sync_status === 'error' ? 'error' : 'info'" class="mt-1">
          <v-icon start size="12">mdi-sync</v-icon>{{ sigaChipText }}
        </v-chip>
      </template>
      <span>{{ sigaLabel }}</span>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
/**
 * One operator-friendly state for a request, folding approval outcome, use
 * and expiry (previously three separate Yes/No columns) into a single chip.
 */
const props = defineProps<{
  decision: 'pending' | 'granted' | 'denied'
  /** Whether the granted permission was already consumed */
  usedAt?: string | null
  expired?: boolean
  /** Support requests use open / granted / denied wording */
  support?: boolean
  reason?: string | null
  sigaLink?: { sync_status: string | null; last_synced_at: string | null; siga_ticket_number?: string | number | null } | null
}>()

const state = computed(() => {
  if (props.decision === 'pending') {
    return props.support
      ? { label: 'Open', color: 'warning', icon: 'mdi-clock-outline', detail: 'Waiting for the team' }
      : { label: 'Waiting for approval', color: 'warning', icon: 'mdi-clock-outline', detail: '' }
  }
  if (props.decision === 'denied') {
    return { label: props.support ? 'Rejected' : 'Denied', color: 'error', icon: 'mdi-close-circle-outline', detail: '' }
  }
  if (props.support) return { label: 'Attended', color: 'success', icon: 'mdi-check-circle-outline', detail: '' }
  if (props.usedAt) {
    return { label: 'Used', color: 'primary', icon: 'mdi-check-all', detail: formatDateString(props.usedAt) }
  }
  if (props.expired) return { label: 'Expired', color: 'grey', icon: 'mdi-timer-off-outline', detail: 'Not used in time' }
  return { label: 'Approved', color: 'success', icon: 'mdi-check-circle-outline', detail: 'Ready to use' }
})

const sigaChipText = computed(() =>
  props.sigaLink?.siga_ticket_number ? `Ticket #${props.sigaLink.siga_ticket_number}` : 'SIGA',
)

const sigaLabel = computed(() => {
  switch (props.sigaLink?.sync_status) {
    case 'synced': return 'Synced with SIGA'
    case 'error': return 'SIGA sync failed'
    case 'pending': return 'SIGA sync pending'
    default: return 'Linked to SIGA'
  }
})
</script>

<style scoped>
.status-cell__detail {
  margin-top: 2px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.status-cell__reason {
  margin-top: 2px;
  font-size: 0.72rem;
  font-style: italic;
  color: rgba(var(--v-theme-on-surface), 0.7);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
