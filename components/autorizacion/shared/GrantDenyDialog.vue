<template>
  <v-dialog :model-value="modelValue" max-width="560" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>{{ title ?? (mode === 'process' ? 'Grant process authorization' : 'Grant authorization') }}</v-card-title>
      <v-card-text>
        <div class="border-4 border-dotted border-gray-300 p-2 mb-4">
          <slot name="context" />
        </div>

        <v-autocomplete
          v-model="decision"
          :items="[
            { text: 'Pending', value: 'pending' },
            { text: 'Grant', value: 'granted' },
            { text: 'Deny', value: 'denied' },
          ]"
          item-title="text"
          item-value="value"
          label="Grant or deny?"
        />

        <v-text-field
          v-if="mode === 'authorization' && decision === 'granted'"
          v-model="untilDate"
          type="date"
          label="Until date granted"
        />
        <v-text-field
          v-if="mode === 'process' && decision === 'granted'"
          v-model="expiresAt"
          type="datetime-local"
          label="Expires at"
          hint="Please provide an expiration date for the authorization"
          :min="minExpiresAt"
        />

        <v-textarea v-model="reason" label="Comments" />

        <!-- Temporary permission (opt-in, authorization mode, only when granting) -->
        <template v-if="mode === 'authorization' && decision === 'granted'">
          <v-divider class="my-3" />
          <div class="d-flex align-center mb-2">
            <v-switch
              v-model="tempPermissionEnabled"
              hide-details
              density="compact"
              color="warning"
              class="mr-2"
            />
            <div>
              <div class="text-body-2 font-weight-medium">Temporary permission</div>
              <div class="text-caption text-medium-emphasis">Allow user to repeat this action on multiple entities without new requests</div>
            </div>
          </div>
          <template v-if="tempPermissionEnabled">
            <div class="grid grid-cols-2 gap-3">
              <v-text-field v-model="tempValidFrom" type="datetime-local" label="Valid from" density="compact" />
              <v-text-field v-model="tempValidUntil" type="datetime-local" label="Valid until" density="compact" />
            </div>
          </template>
        </template>
      </v-card-text>
      <v-card-actions>
        <div class="grow"></div>
        <v-btn color="error" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="success" @click="onSubmit">Save response</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const snackbar = useSnackbar()

const props = defineProps<{
  modelValue: boolean
  mode: 'authorization' | 'process'
  title?: string
  minExpiresAt?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', payload: {
    decision: 'granted' | 'denied'
    reason: string
    untilDate: string | null
    tempPermissionEnabled: boolean
    tempValidFrom: string | null
    tempValidUntil: string | null
    expiresAt: string | null
  }): void
}>()

const decision = ref<'pending' | 'granted' | 'denied'>('pending')
const reason = ref('')
const untilDate = ref<string | null>(null)
const tempPermissionEnabled = ref(false)
const tempValidFrom = ref<string | null>(null)
const tempValidUntil = ref<string | null>(null)
const expiresAt = ref<string | null>(null)

function reset() {
  decision.value = 'pending'
  reason.value = ''
  untilDate.value = null
  tempPermissionEnabled.value = false
  tempValidFrom.value = null
  tempValidUntil.value = null
  expiresAt.value = null
}

// Reset whenever the dialog is (re)opened, so a previous response never leaks into the next request.
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) reset()
})

function onSubmit() {
  if (decision.value === 'pending') {
    snackbar.add({ type: 'error', text: 'Please provide a response for the authorization request' })
    return
  }
  emit('submit', {
    decision: decision.value,
    reason: reason.value,
    untilDate: untilDate.value,
    tempPermissionEnabled: tempPermissionEnabled.value,
    tempValidFrom: tempValidFrom.value,
    tempValidUntil: tempValidUntil.value,
    expiresAt: expiresAt.value,
  })
}
</script>
