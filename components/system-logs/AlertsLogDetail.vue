<template>
  <v-dialog v-model="dialogVisible" max-width="850" scrollable>
    <v-card rounded="xl" v-if="alert">
      <v-card-title class="bg-indigo-darken-2 text-white d-flex align-center ga-2 pa-4">
        <v-icon>{{ alert.icon || 'mdi-bell-alert-outline' }}</v-icon>
        Alert Detail
        <v-spacer />
        <v-chip :color="alert.resolved_at ? 'success' : 'grey'" size="small" variant="flat" class="font-weight-bold">
          {{ alert.resolved_at ? 'RESOLVED' : 'UNRESOLVED' }}
        </v-chip>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-row dense>
          <v-col cols="12">
            <div class="text-caption text-grey-darken-1">Title</div>
            <div class="font-weight-medium text-body-2">{{ alert.title }}</div>
          </v-col>
          <v-col cols="12" v-if="alert.message">
            <div class="text-caption text-grey-darken-1">Message</div>
            <div class="text-body-2">{{ alert.message }}</div>
          </v-col>

          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">Alert type</div>
            <div class="font-weight-medium text-body-2">{{ alert.alert_type_code }}</div>
          </v-col>
          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">Category</div>
            <div class="font-weight-medium text-body-2">{{ alert.category || '—' }}</div>
          </v-col>

          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">Reference</div>
            <div class="font-weight-medium text-body-2">{{ alert.reference || '—' }}</div>
          </v-col>
          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">Created by</div>
            <div class="font-weight-medium text-body-2">{{ alert.creator || 'System' }}</div>
          </v-col>

          <v-col cols="6">
            <div class="text-caption text-grey-darken-1">Created at</div>
            <div class="font-weight-medium text-body-2">{{ formatDate(alert.created_at) }}</div>
          </v-col>
          <v-col cols="6" v-if="alert.resolved_at">
            <div class="text-caption text-grey-darken-1">Resolved at</div>
            <div class="font-weight-medium text-body-2">{{ formatDate(alert.resolved_at) }}</div>
          </v-col>

          <v-col cols="12">
            <div class="text-caption text-grey-darken-1">Recipients</div>
            <div class="text-body-2">
              {{ alert.read_count }}/{{ alert.total_recipients }} read · {{ alert.dismissed_count }} dismissed
            </div>
          </v-col>

          <v-col cols="12" v-if="alert.action_url">
            <div class="text-caption text-grey-darken-1">Action URL</div>
            <NuxtLink :to="alert.action_url" class="text-body-2" target="_blank">{{ alert.action_url }}</NuxtLink>
          </v-col>

          <v-col cols="12" v-if="alert.data && Object.keys(alert.data).length > 0">
            <div class="text-caption text-grey-darken-1 mb-1">Data</div>
            <v-sheet color="grey-lighten-4" rounded="lg" class="pa-3" style="max-height: 300px; overflow-y: auto;">
              <pre class="text-body-2" style="white-space: pre-wrap; font-size: 11px; font-family: 'Fira Code', monospace;">{{ JSON.stringify(alert.data, null, 2) }}</pre>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-3">
        <v-spacer />
        <v-btn variant="text" @click="dialogVisible = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { IAdminAlert } from '~/repository/modules/alerts'

const props = defineProps<{
  modelValue: boolean
  alert: IAdminAlert | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

const formatDate = (date?: string | null) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
  })
}
</script>
