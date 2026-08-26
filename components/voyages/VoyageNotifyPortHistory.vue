<template>
  <div v-if="hasHistory" class="mt-1">
    <v-tooltip location="top" text="View full notify port history">
      <template #activator="{ props: tooltipProps }">
        <div v-bind="tooltipProps" class="text-caption text-grey-darken-1 cursor-pointer" @click="showDialog">
          <v-icon size="14">mdi-history</v-icon>
          {{ lastLog?.triggered_by?.name ?? 'System' }}
          <br />
          {{ formatDate(lastLog?.occurred_at) }}
        </div>
      </template>
    </v-tooltip>

    <v-dialog v-model="dialog" max-width="650" scrollable>
      <v-card>
        <v-card-title class="bg-primary text-white d-flex align-center ga-2">
          <v-icon>mdi-history</v-icon>
          Notify Port History
        </v-card-title>
        <v-card-text class="pa-4">
          <div v-if="loading" class="flex justify-center py-6">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <v-timeline v-else density="compact" side="end" truncate-line="both">
            <v-timeline-item v-for="log in logs" :key="log.id" size="small">
              <div class="d-flex align-center ga-2 flex-wrap">
                <span class="text-caption text-grey-darken-1">{{ formatDate(log.occurred_at) }}</span>
                <v-chip v-if="log.status === 'no_recipient'" size="small" color="error" variant="tonal">
                  No recipient
                </v-chip>
              </div>
              <div class="text-body-2">Sent by {{ log.triggered_by?.name ?? 'System' }}</div>
              <div v-if="log.to?.length" class="text-caption text-grey-darken-1">
                To: {{ log.to.map((a) => a.address).join(', ') }}
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import type { IMailLog } from '~/repository/modules/mailLogs'

const { $api } = useNuxtApp()

const props = defineProps<{
  voyageDestId: number | string
}>()

const logs = ref<IMailLog[]>([])
const hasHistory = ref(false)
const loading = ref(false)
const dialog = ref(false)

// historyFor() returns oldest -> newest, so the last item is the most recent send.
const lastLog = computed(() => logs.value[logs.value.length - 1] ?? null)

const fetchHistory = async () => {
  try {
    const res = await $api.mailLogs.voyageDestinationHistory(props.voyageDestId)
    logs.value = (res as any)?.data ?? []
    hasHistory.value = logs.value.length > 0
  } catch (e) {
    console.error('[VoyageNotifyPortHistory] Failed to fetch history for voyage destination', props.voyageDestId, e)
  }
}

const showDialog = async () => {
  dialog.value = true
  loading.value = true
  await fetchHistory()
  loading.value = false
}

const formatDate = (date?: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(fetchHistory)
</script>
