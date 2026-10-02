<template>
  <div>
    <v-btn block size="small" variant="outlined" @click="open">
      <v-icon>mdi-history</v-icon>
      Cut history
    </v-btn>

    <v-dialog v-model="dialog" max-width="720" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon>mdi-history</v-icon>
          Demurrage cut history
        </v-card-title>
        <v-card-text>
          <div v-if="loading" class="d-flex justify-center py-8">
            <v-progress-circular indeterminate />
          </div>

          <div v-else-if="!batches.length" class="text-center text-medium-emphasis py-8">
            No cuts have been sent for this reference yet.
          </div>

          <v-timeline v-else density="compact" side="end" truncate-line="both">
            <v-timeline-item v-for="batch in batches" :key="batch.batch_uuid" size="small" dot-color="primary">
              <v-card variant="tonal" density="compact" class="pa-3">
                <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-1">
                  <span class="text-caption font-weight-bold">{{ formatDateString(batch.sent_at) }}</span>
                  <span class="text-caption font-weight-bold">{{ formatToCurrency(batch.total) }} USD</span>
                </div>
                <div class="text-body-2 d-flex align-center ga-1">
                  <v-icon size="15">mdi-account</v-icon>
                  Sent by <strong>{{ batch.sent_by?.name ?? 'System' }}</strong>
                </div>
                <div v-if="batch.emails?.length" class="text-caption text-medium-emphasis d-flex align-center ga-1 mt-1">
                  <v-icon size="15">mdi-email-outline</v-icon>
                  {{ batch.emails.join(', ') }}
                </div>
                <div class="d-flex flex-wrap ga-1 mt-2">
                  <v-chip v-for="c in batch.containers" :key="c.reference_container_id" size="x-small" variant="outlined">
                    {{ c.container_number }} · {{ c.is_parcial ? 'Parcial' : 'Total' }} ·
                    {{ formatToCurrency(c.amount + c.amount_iva) }}
                  </v-chip>
                </div>
              </v-card>
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
const { $api } = useNuxtApp()

const props = defineProps<{ referenciaId: number | string }>()

const dialog = ref(false)
const loading = ref(false)
const batches = ref<any[]>([])

const open = async () => {
  dialog.value = true
  loading.value = true
  try {
    batches.value = ((await $api.demurrages.getDemurrageCuts(String(props.referenciaId))) as any[]) ?? []
  } catch (e) {
    console.error(e)
    batches.value = []
  } finally {
    loading.value = false
  }
}
</script>
