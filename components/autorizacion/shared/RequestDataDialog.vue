<template>
  <v-dialog :model-value="modelValue" max-width="640" scrollable @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center pt-4 px-6">
        <v-icon class="mr-2" color="secondary">mdi-information-outline</v-icon>
        Request data — #{{ requestId }}
      </v-card-title>
      <v-card-subtitle v-if="data?.type_label || subtitle" class="px-6">{{ data?.type_label || subtitle }}</v-card-subtitle>

      <v-divider class="mt-2" />

      <v-card-text class="px-6 py-4" style="max-height: 72vh">
        <div v-if="loading" class="d-flex justify-center py-10">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <v-alert v-else-if="error" type="error" variant="tonal" density="compact">{{ error }}</v-alert>

        <template v-else>
          <div class="tm-panel tm-border rounded pa-3 mb-3">
            <slot name="context" />
            <div v-if="decisionLabel" class="text-body-2" :class="{ 'mt-1': $slots.context }">
              <span class="text-medium-emphasis">Status:</span> {{ decisionLabel }}
            </div>
          </div>

          <RequestSummaryView v-if="data?.summary" :summary="data.summary" />
          <slot v-else name="fallback">
            <div class="text-body-2 text-medium-emphasis">No additional data</div>
          </slot>
        </template>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-6 py-3">
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { IRequestSummaryView, RequestKind } from '~/repository/modules/catalogs/requestDecisions'
import RequestSummaryView from './RequestSummaryView.vue'

const props = defineProps<{
  modelValue: boolean
  kind: RequestKind
  requestId: number | null
  /** Shown while loading or when the type has no label. */
  subtitle?: string | null
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const { $api } = useNuxtApp()

const loading = ref(false)
const error = ref<string | null>(null)
const data = ref<IRequestSummaryView | null>(null)

const decisionLabel = computed(() => {
  const d = data.value
  if (!d || d.state === 'pending') return d ? 'Pending' : ''
  if (d.state === 'withdrawn') return 'Withdrawn by the requester'
  return `${d.state === 'granted' ? 'Approved' : 'Denied'}${d.decided_by ? ` by ${d.decided_by}` : ''}`
})

async function load() {
  if (!props.requestId) return
  data.value = null
  error.value = null
  loading.value = true
  try {
    data.value = await $api.requestDecisions.summary(props.kind, props.requestId)
  } catch (e: any) {
    error.value = e?.response?._data?.message || 'Could not load the request data.'
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.requestId],
  ([open]) => {
    if (open) load()
  },
  { immediate: true },
)
</script>
