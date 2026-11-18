<template>
  <v-dialog :model-value="modelValue" max-width="680" persistent scrollable @update:model-value="close">
    <v-card>
      <v-card-title class="d-flex align-center gap-2 pt-4 px-6">
        <v-icon icon="mdi-gavel" color="primary" />
        <span>{{ title }}</span>
      </v-card-title>
      <v-card-subtitle v-if="decision?.type_label" class="px-6">{{ decision.type_label }}</v-card-subtitle>

      <v-divider class="mt-2" />

      <v-card-text class="px-6 py-4" style="max-height: 72vh">
        <div v-if="loading" class="d-flex justify-center py-10">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else-if="decision">
          <div class="tm-panel tm-border rounded pa-3 mb-4">
            <slot name="context" :has-summary="!!decision.summary" />
            <template v-if="decision.summary">
              <v-divider v-if="$slots.context" class="my-3" />
              <RequestSummaryView :summary="decision.summary" />
            </template>
          </div>

          <v-alert v-if="decision.state !== 'pending'" type="info" variant="tonal" density="compact">
            {{ stateMessage }}
          </v-alert>

          <template v-else>
            <div class="text-subtitle-2 font-weight-bold mb-2">Response</div>
            <v-radio-group v-model="selectedKey" hide-details class="mb-2">
              <div
                v-for="option in decision.options"
                :key="option.key"
                class="option-card tm-border rounded px-3 py-2 mb-2"
                :class="{ 'option-selected': selectedKey === option.key, 'option-disabled': !!option.disabled_reason }"
                @click="!option.disabled_reason && (selectedKey = option.key)"
              >
                <div class="d-flex align-start gap-2">
                  <v-radio :value="option.key" :disabled="!!option.disabled_reason" :color="option.outcome === 'grant' ? 'success' : 'error'" density="compact" hide-details class="flex-grow-0" />
                  <div class="flex-grow-1 pt-1">
                    <div class="font-weight-medium" :class="option.outcome === 'grant' ? 'text-success' : 'text-error'">
                      {{ option.label }}
                      <v-icon v-if="option.tm2_redirect" size="14" class="ml-1">mdi-open-in-new</v-icon>
                    </div>
                    <div v-if="option.description" class="text-caption text-medium-emphasis">{{ option.description }}</div>
                    <div v-if="option.disabled_reason" class="text-caption text-warning">{{ option.disabled_reason }}</div>
                  </div>
                </div>
              </div>
            </v-radio-group>

            <template v-if="selected?.outcome === 'grant' && selected.editable_window && decision.window">
              <v-text-field
                v-model="expiresAt"
                type="datetime-local"
                label="Valid until"
                density="compact"
                :min="minExpiresAt"
                :hint="windowHint"
                persistent-hint
                class="mb-3"
              >
                <template #append-inner>
                  <v-btn
                    v-if="expiresAt !== decision.window.expires_at_local"
                    size="x-small"
                    variant="text"
                    icon="mdi-restore"
                    title="Back to the default"
                    @click="expiresAt = decision.window.expires_at_local"
                  />
                </template>
              </v-text-field>
            </template>

            <div v-if="batchPending > 1 && selected && !selected.tm2_redirect" class="batch-apply tm-panel tm-border rounded px-3 py-2 mb-3">
              <v-switch
                v-model="applyToBatch"
                color="primary"
                density="compact"
                hide-details
                :label="`Apply to all ${batchPending} pending requests of this batch`"
              />
              <div class="text-caption text-medium-emphasis">
                {{ batchLabels }}
              </div>
            </div>

            <v-textarea
              v-model="reason"
              :label="selected?.reason_required ? 'Comments (required)' : 'Comments'"
              rows="2"
              auto-grow
              density="compact"
            />

            <template v-if="kind === 'authorization-request' && selected?.outcome === 'grant' && !selected.tm2_redirect">
              <div class="d-flex align-center mt-1">
                <v-switch v-model="tempPermissionEnabled" hide-details density="compact" color="warning" class="mr-2 flex-grow-0" />
                <div>
                  <div class="text-body-2 font-weight-medium">Temporary permission</div>
                  <div class="text-caption text-medium-emphasis">Allow the user to repeat this action on other records without new requests</div>
                </div>
              </div>
              <div v-if="tempPermissionEnabled" class="grid grid-cols-2 gap-3 mt-2">
                <v-text-field v-model="tempValidFrom" type="datetime-local" label="Valid from" density="compact" />
                <v-text-field v-model="tempValidUntil" type="datetime-local" label="Valid until" density="compact" />
              </div>
            </template>

            <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-3">{{ error }}</v-alert>
          </template>
        </template>

        <v-alert v-else-if="error" type="error" variant="tonal" density="compact">{{ error }}</v-alert>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-6 py-3">
        <v-spacer />
        <v-btn variant="text" :disabled="saving" @click="close">Cancel</v-btn>
        <v-btn
          v-if="decision?.state === 'pending'"
          :color="selected?.outcome === 'deny' ? 'error' : 'success'"
          variant="flat"
          :loading="saving"
          :disabled="!selected || !!selected.disabled_reason"
          @click="submit"
        >
          {{ selected?.tm2_redirect ? 'Continue' : batchApplies ? `Save response (${batchPending})` : 'Save response' }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="showConfirm" max-width="440">
      <v-card>
        <v-card-title class="pt-4">Confirm</v-card-title>
        <v-card-text>{{ selected?.confirm }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showConfirm = false">Back</v-btn>
          <v-btn color="error" variant="flat" :loading="saving" @click="apply">Yes, continue</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import type {
  IBatchDecisionResult,
  IDecisionRedirect,
  IRequestBatchSummary,
  IRequestDecision,
  RequestKind,
} from '~/repository/modules/catalogs/requestDecisions'
import RequestSummaryView from './RequestSummaryView.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    kind: RequestKind
    requestId: number | null
    title?: string
    /** Set when the request was asked together with others: offers answering all of them at once. */
    batchId?: string | null
  }>(),
  { title: 'Respond request', batchId: null },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'decided', decision: IRequestDecision): void
  (e: 'decided-batch', result: IBatchDecisionResult): void
  (e: 'redirect', payload: IDecisionRedirect): void
}>()

const { $api } = useNuxtApp()

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const decision = ref<IRequestDecision | null>(null)
const selectedKey = ref<string | null>(null)
const expiresAt = ref<string | null>(null)
const reason = ref('')
const tempPermissionEnabled = ref(false)
const tempValidFrom = ref<string | null>(null)
const tempValidUntil = ref<string | null>(null)
const showConfirm = ref(false)
const batchSummary = ref<IRequestBatchSummary | null>(null)
const applyToBatch = ref(true)

const batchPending = computed(() => batchSummary.value?.pending ?? 0)
const batchApplies = computed(() => batchPending.value > 1 && applyToBatch.value && !selected.value?.tm2_redirect)
const batchLabels = computed(() =>
  (batchSummary.value?.items ?? [])
    .filter((item) => item.status === 'pending')
    .map((item) => item.label || `#${item.id}`)
    .join(', '),
)

const selected = computed(() => decision.value?.options.find((o) => o.key === selectedKey.value) ?? null)

const localNow = (timezone: string) => {
  // "YYYY-MM-DDTHH:mm" in the requester's office timezone (the datetime-local input has no zone).
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

const minExpiresAt = computed(() => (decision.value?.window ? localNow(decision.value.window.timezone) : undefined))

const windowHint = computed(() => {
  const w = decision.value?.window
  if (!w) return ''
  return `Default: ${w.policy_label} from now (${w.timezone.replace('_', ' ')} time). Change it if the requester needs more or less time.`
})

const stateMessage = computed(() => {
  const d = decision.value
  if (!d) return ''
  if (d.state === 'withdrawn') return 'The requester withdrew this request.'
  return `This request was already ${d.state === 'granted' ? 'approved' : 'denied'}${d.decided_by ? ` by ${d.decided_by}` : ''}.`
})

function reset() {
  error.value = null
  decision.value = null
  selectedKey.value = null
  expiresAt.value = null
  reason.value = ''
  tempPermissionEnabled.value = false
  tempValidFrom.value = null
  tempValidUntil.value = null
  showConfirm.value = false
  batchSummary.value = null
  applyToBatch.value = true
}

async function load() {
  if (!props.requestId) return
  reset()
  loading.value = true
  try {
    decision.value = await $api.requestDecisions.get(props.kind, props.requestId)
    expiresAt.value = decision.value.window?.expires_at_local ?? null
    // Preselect only when there is a single way to approve; with several (e.g. with/without rebilling) the approver picks.
    const grants = decision.value.options.filter((o) => o.outcome === 'grant' && !o.disabled_reason)
    if (grants.length === 1) selectedKey.value = grants[0]!.key
    if (props.batchId && decision.value.state === 'pending') {
      // Not essential: without it the dialog answers just this request
      batchSummary.value = await $api.requestDecisions.batchSummary(props.batchId).catch(() => null)
    }
  } catch (e: any) {
    error.value = e?.response?._data?.message || 'Could not load the request.'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) load()
  },
)

function close() {
  if (saving.value) return
  emit('update:modelValue', false)
}

function submit() {
  const option = selected.value
  if (!option) return
  error.value = null
  if (option.reason_required && !reason.value.trim()) {
    error.value = 'Please write the reason.'
    return
  }
  if (option.outcome === 'grant' && option.editable_window && !expiresAt.value) {
    error.value = 'Please set until when the authorization is valid.'
    return
  }
  if (option.tm2_redirect) {
    emit('redirect', {
      option,
      reason: reason.value,
      expiresAt: expiresAt.value ?? decision.value?.window?.expires_at_local ?? null,
      tempPermissionEnabled: tempPermissionEnabled.value,
      tempValidFrom: tempValidFrom.value,
      tempValidUntil: tempValidUntil.value,
    })
    return
  }
  if (option.confirm) {
    showConfirm.value = true
    return
  }
  apply()
}

async function apply() {
  const option = selected.value
  if (!option || !props.requestId) return
  saving.value = true
  try {
    if (batchApplies.value && props.batchId) {
      const batchResult = await $api.requestDecisions.decideBatch(props.batchId, {
        option: option.key,
        reason: reason.value || null,
        expires_at: option.outcome === 'grant' && option.editable_window ? expiresAt.value : null,
      })
      showConfirm.value = false
      emit('decided-batch', batchResult)
      emit('update:modelValue', false)
      return
    }
    const result = await $api.requestDecisions.decide(props.kind, props.requestId, {
      option: option.key,
      reason: reason.value || null,
      expires_at: option.outcome === 'grant' && option.editable_window ? expiresAt.value : null,
      temp_permission_enabled: tempPermissionEnabled.value,
      temp_valid_from: tempPermissionEnabled.value ? tempValidFrom.value : null,
      temp_valid_until: tempPermissionEnabled.value ? tempValidUntil.value : null,
    })
    showConfirm.value = false
    emit('decided', result)
    emit('update:modelValue', false)
  } catch (e: any) {
    showConfirm.value = false
    const message = e?.response?._data?.message || 'Could not save the response.'
    // Decided elsewhere (SIGA or another approver) or withdrawn: show the current state.
    if (e?.response?.status === 409) await load()
    error.value = message
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.option-card {
  cursor: pointer;
  transition: background-color 0.15s;
}
.option-selected {
  background: rgba(var(--v-theme-primary), 0.06);
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
}
.option-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
