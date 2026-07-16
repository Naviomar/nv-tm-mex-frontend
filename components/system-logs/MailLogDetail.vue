<template>
  <v-dialog v-model="dialogVisible" max-width="850" scrollable>
    <v-card rounded="xl">
      <v-card-title class="bg-indigo-darken-2 text-white d-flex align-center ga-2 pa-4">
        <v-icon>mdi-email-search-outline</v-icon>
        Mail Log Detail
        <v-spacer />
        <v-chip :color="log?.status === 'no_recipient' ? 'error' : 'success'" size="small" variant="flat" class="font-weight-bold">
          {{ log?.status === 'no_recipient' ? 'SIN DESTINATARIO' : 'ENVIADO' }}
        </v-chip>
      </v-card-title>

      <v-card-text class="pa-4" v-if="log">
        <v-row dense>
          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">Mailable</div>
            <div class="font-weight-medium text-body-2" style="word-break: break-word;">{{ log.mailable_class || '—' }}</div>
          </v-col>
          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">Notification</div>
            <div class="font-weight-medium text-body-2" style="word-break: break-word;">{{ log.notification_class || '—' }}</div>
          </v-col>
          <v-col cols="12">
            <div class="text-caption text-grey-darken-1">Subject</div>
            <div class="font-weight-medium text-body-2">{{ log.subject || '(sin asunto)' }}</div>
          </v-col>

          <v-col cols="12">
            <div class="text-caption text-grey-darken-1">To</div>
            <div class="font-weight-medium text-body-2">{{ formatAddresses(log.to) }}</div>
          </v-col>
          <v-col cols="6" v-if="log.cc?.length">
            <div class="text-caption text-grey-darken-1">Cc</div>
            <div class="text-body-2">{{ formatAddresses(log.cc) }}</div>
          </v-col>
          <v-col cols="6" v-if="log.bcc?.length">
            <div class="text-caption text-grey-darken-1">Bcc</div>
            <div class="text-body-2">{{ formatAddresses(log.bcc) }}</div>
          </v-col>

          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">Triggered by</div>
            <div class="font-weight-medium">{{ log.triggered_by?.name ?? 'System (queued)' }}</div>
          </v-col>
          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">Occurred At</div>
            <div class="font-weight-medium">{{ formatDate(log.occurred_at) }}</div>
          </v-col>

          <v-col cols="6" v-if="log.related_type">
            <div class="text-caption text-grey-darken-1">Related to</div>
            <v-chip size="small" variant="tonal" color="indigo">
              {{ log.related_type }} #{{ log.related_id }}
            </v-chip>
          </v-col>
          <v-col cols="6" v-if="log.message_id">
            <div class="text-caption text-grey-darken-1">Message-ID</div>
            <div class="text-body-2" style="font-size: 11px; word-break: break-all;">{{ log.message_id }}</div>
          </v-col>

          <v-col cols="12" v-if="log.payload && Object.keys(log.payload).length > 0">
            <div class="text-caption text-grey-darken-1 mb-1">Payload</div>
            <v-sheet color="grey-lighten-4" rounded="lg" class="pa-3" style="max-height: 300px; overflow-y: auto;">
              <pre class="text-body-2" style="white-space: pre-wrap; font-size: 11px; font-family: 'Fira Code', monospace;">{{ JSON.stringify(log.payload, null, 2) }}</pre>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text v-else class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" />
      </v-card-text>

      <v-card-actions class="pa-3">
        <v-spacer />
        <v-btn variant="text" @click="dialogVisible = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { IMailLog, IMailLogAddress } from '~/repository/modules/mailLogs'

const dialogVisible = defineModel<boolean>({ default: false })

defineProps<{
  log: IMailLog | null
}>()

const formatAddresses = (addresses?: IMailLogAddress[]) => {
  if (!addresses || addresses.length === 0) return '—'
  return addresses.map((a) => (a.name ? `${a.name} <${a.address}>` : a.address)).join(', ')
}

const formatDate = (date?: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}
</script>
