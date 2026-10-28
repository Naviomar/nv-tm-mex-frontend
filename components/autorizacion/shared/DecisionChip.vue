<template>
  <div>
    <div class="d-flex align-center gap-1 flex-wrap">
      <v-chip size="small" :color="color">{{ label }}</v-chip>
      <v-tooltip v-if="sigaLink" location="top">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-chip v-bind="tooltipProps" size="x-small" variant="tonal" :color="sigaChipColor">
            <v-icon start size="12">mdi-sync</v-icon>
            {{ sigaChipText }}
          </v-chip>
        </template>
        <span>
          {{ sigaStatusLabel }}
          <template v-if="sigaLink.last_synced_at">— last synced {{ formatSyncedAt(sigaLink.last_synced_at) }}</template>
        </span>
      </v-tooltip>
    </div>
    <div v-if="decision !== 'pending' && reason">{{ reason }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SigaTicketLink {
  sync_status: string | null
  last_synced_at: string | null
  siga_ticket_number?: string | number | null
}

const props = defineProps<{
  decision: 'pending' | 'granted' | 'denied'
  reason?: string | null
  sigaLink?: SigaTicketLink | null
}>()

const color = computed(() => ({ pending: 'warning', granted: 'success', denied: 'error' }[props.decision]))
const label = computed(() => ({ pending: 'Pending', granted: 'Granted', denied: 'Denied' }[props.decision]))

const sigaChipText = computed(() =>
  props.sigaLink?.siga_ticket_number ? `Ticket #${props.sigaLink.siga_ticket_number}` : 'SIGA',
)
const sigaChipColor = computed(() => (props.sigaLink?.sync_status === 'error' ? 'error' : 'info'))
const sigaStatusLabel = computed(() => {
  switch (props.sigaLink?.sync_status) {
    case 'synced': return 'Synced with SIGA'
    case 'error': return 'SIGA sync failed'
    case 'pending': return 'SIGA sync pending'
    default: return 'Linked to SIGA'
  }
})

function formatSyncedAt(iso: string) {
  return new Date(iso).toLocaleString()
}
</script>
