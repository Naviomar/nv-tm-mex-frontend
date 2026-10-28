<template>
  <v-dialog :model-value="modelValue" max-width="640" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-account-lock-outline</v-icon>
        Authorized test recipients
      </v-card-title>
      <v-card-subtitle class="text-wrap">
        Test emails sent from the sandbox are delivered only to these addresses, never to the original recipients.
      </v-card-subtitle>
      <v-card-text>
        <v-alert v-if="usingFallback" type="info" variant="tonal" density="compact" class="mb-3">
          The list is empty: using the fallback from the server configuration.
        </v-alert>

        <v-list v-if="recipients.length" density="compact" class="tm-border rounded mb-4">
          <v-list-item v-for="recipient in recipients" :key="recipient.id">
            <v-list-item-title>{{ recipient.email }}</v-list-item-title>
            <v-list-item-subtitle>{{ recipient.name || '—' }}</v-list-item-subtitle>
            <template #append>
              <v-switch
                :model-value="recipient.is_active"
                :disabled="!canManage"
                color="success"
                density="compact"
                hide-details
                class="mr-2"
                @update:model-value="toggle(recipient, !!$event)"
              />
              <v-btn v-if="canManage" icon="mdi-delete-outline" size="small" variant="text" color="error" @click="remove(recipient)" />
            </template>
          </v-list-item>
        </v-list>
        <p v-else class="text-medium-emphasis mb-4">No recipients yet.</p>

        <div v-if="canManage" class="d-flex ga-2 align-start">
          <v-text-field v-model="email" label="Email" type="email" density="compact" hide-details="auto" :error-messages="error" @keyup.enter="add" />
          <v-text-field v-model="name" label="Name (optional)" density="compact" hide-details @keyup.enter="add" />
          <v-btn color="primary" :loading="saving" :disabled="!email" @click="add">Add</v-btn>
        </div>
      </v-card-text>
      <v-card-actions><v-spacer /><v-btn @click="$emit('update:modelValue', false)">Close</v-btn></v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { IDiagnosticRecipient } from '~/repository/modules/diagnostics'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean]; changed: [string[]] }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { hasPermission } = useCheckUser()
const canManage = computed(() => hasPermission('diagnostics-recipients-manage'))

const recipients = ref<IDiagnosticRecipient[]>([])
const usingFallback = ref(false)
const email = ref('')
const name = ref('')
const error = ref<string | undefined>()
const saving = ref(false)

const load = async () => {
  try {
    const response: any = await $api.diagnostics.recipients()
    recipients.value = response.recipients
    usingFallback.value = response.using_fallback
    emit('changed', response.effective)
  } catch (e) {
    console.error(e)
  }
}

const add = async () => {
  if (!email.value) return
  saving.value = true
  error.value = undefined
  try {
    await $api.diagnostics.addRecipient({ email: email.value, name: name.value || undefined })
    email.value = ''
    name.value = ''
    await load()
  } catch (e: any) {
    error.value = e?.data?.errors?.email?.[0] ?? 'Could not add the recipient'
  } finally {
    saving.value = false
  }
}

const toggle = async (recipient: IDiagnosticRecipient, active: boolean) => {
  try {
    await $api.diagnostics.updateRecipient(recipient.id, { is_active: active })
    await load()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Could not update the recipient' })
  }
}

const remove = async (recipient: IDiagnosticRecipient) => {
  try {
    await $api.diagnostics.removeRecipient(recipient.id)
    await load()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Could not remove the recipient' })
  }
}

watch(() => props.modelValue, (open) => open && load(), { immediate: true })
</script>
