<template>
  <v-dialog :model-value="modelValue" max-width="640" persistent scrollable @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="xl">
      <v-toolbar color="warning" density="comfortable">
        <v-icon class="ml-4">mdi-shield-lock-outline</v-icon>
        <v-toolbar-title>Request approval for rate changes</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-toolbar>

      <v-card-text class="pt-4 space-y-4">
        <v-alert type="info" variant="tonal" density="compact">
          You don't have permission to apply these changes directly. Submit them for approval — once granted, they are
          applied automatically. You can send as many requests as you need.
        </v-alert>

        <div>
          <div class="text-sm font-semibold mb-1">{{ lineName || `Line ${lineId}` }}</div>
          <div class="text-xs opacity-70">
            {{ summary.creates }} to add · {{ summary.updates }} to update · {{ summary.deletes }} to remove
          </div>
        </div>

        <div class="rounded-lg border max-h-[260px] overflow-y-auto">
          <v-list density="compact">
            <v-list-item v-for="(op, index) in ops" :key="`op-${index}`">
              <template #prepend>
                <v-icon size="small" :color="opColor(op.action)">{{ opIcon(op.action) }}</v-icon>
              </template>
              <v-list-item-title class="text-sm">{{ describeOperation(op) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </div>

        <v-textarea
          v-model="reason"
          label="Reason for this request"
          variant="outlined"
          rows="3"
          counter
          clearable
          :rules="[(v) => !!(v && v.trim()) || 'Reason is required']"
        />
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" :disabled="submitting" @click="close">Cancel</v-btn>
        <v-btn color="warning" :loading="submitting" :disabled="!ops.length" @click="submit">Send request</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {
  describeOperation,
  getPeriodLabel,
  summarizeOperations,
  type RateOp,
} from '~/composables/useContainerDelayRates'
import { useContainerDelayRateActions } from '~/composables/useContainerDelayRateActions'

const props = defineProps<{
  modelValue: boolean
  lineId: number
  lineName?: string | null
  ops: RateOp[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submitted'): void
}>()

const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { submitAsRequest } = useContainerDelayRateActions()

const reason = ref('')
const submitting = ref(false)

const summary = computed(() => summarizeOperations(props.ops))

const displayName = computed(() => {
  const create = props.ops.find((op) => op.action === 'create')
  const periodLabel = create && create.action === 'create' ? getPeriodLabel(create.start_date, create.end_date) : ''
  const base = `${props.lineName || `Line ${props.lineId}`}`
  const detail = periodLabel ? ` · ${periodLabel}` : ''
  return `${base}${detail} (${summary.value.total} change${summary.value.total === 1 ? '' : 's'})`
})

function opIcon(action: RateOp['action']) {
  if (action === 'create') return 'mdi-plus-circle-outline'
  if (action === 'update') return 'mdi-pencil-outline'
  return 'mdi-delete-outline'
}

function opColor(action: RateOp['action']) {
  if (action === 'create') return 'success'
  if (action === 'update') return 'primary'
  return 'error'
}

function close() {
  reason.value = ''
  emit('update:modelValue', false)
}

async function submit() {
  if (!reason.value.trim()) {
    snackbar.add({ type: 'error', text: 'Please provide a reason for the request.' })
    return
  }

  try {
    submitting.value = true
    loadingStore.start()
    await submitAsRequest({
      lineId: props.lineId,
      lineName: props.lineName,
      ops: props.ops,
      reason: reason.value.trim(),
      displayName: displayName.value,
    })
    snackbar.add({ type: 'success', text: 'Request sent for approval.' })
    reason.value = ''
    emit('submitted')
    emit('update:modelValue', false)
  } catch (error: any) {
    console.error(error)
    snackbar.add({ type: 'error', text: error?.data?.message || 'Failed to send request.' })
  } finally {
    submitting.value = false
    setTimeout(() => loadingStore.stop(), 250)
  }
}
</script>
