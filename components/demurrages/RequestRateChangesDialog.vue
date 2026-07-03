<template>
  <v-dialog :model-value="modelValue" max-width="640" persistent scrollable @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="xl">
      <v-toolbar color="warning" density="comfortable">
        <v-icon class="ml-4">mdi-shield-lock-outline</v-icon>
        <v-toolbar-title>{{ tpl.title || 'Request approval for rate changes' }}</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-toolbar>

      <v-card-text class="pt-4 space-y-4">
        <v-alert type="info" variant="tonal" density="compact">
          {{ tpl.subtitle || "You don't have permission to apply these changes directly. Submit them for approval — once granted, they are applied automatically. You can send as many requests as you need." }}
        </v-alert>

        <!-- Template elements -->
        <template v-for="el in tpl.elements" :key="el.id">
          <v-alert
            v-if="el.type === 'alert_block'"
            :type="(el as any).alert_type"
            variant="tonal"
            density="compact"
          >
            {{ (el as any).alert_text }}
          </v-alert>
          <p v-else-if="el.type === 'text_block'" class="text-sm text-medium-emphasis">
            {{ (el as any).text }}
          </p>
        </template>

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
          v-if="tpl.reason.show"
          v-model="reason"
          :label="tpl.reason.label"
          variant="outlined"
          :rows="tpl.reason.rows ?? 3"
          counter
          clearable
          :rules="tpl.reason.required ? [(v: any) => !!(v && v.trim()) || 'Reason is required'] : []"
        />
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" :disabled="submitting" @click="close">Cancel</v-btn>
        <v-btn color="warning" :loading="submitting" :disabled="!ops.length" @click="submit">{{ tpl.buttons.submit }}</v-btn>
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
const { getTemplate, loadCatalog } = useRequestTypeCatalog()

const tpl = computed(() => getTemplate('container-delay-rates.apply-changes'))

// Refresh the catalog when the dialog opens so template edits are reflected
watch(
  () => props.modelValue,
  (open) => { if (open) loadCatalog(true) }
)

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
  if (tpl.value.reason.show && tpl.value.reason.required && !reason.value.trim()) {
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
