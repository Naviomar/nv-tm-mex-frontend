<template>
  <div>
    <v-row>
      <v-col cols="12" lg="5">
        <v-card elevation="0" class="tm-panel">
          <v-card-title class="text-subtitle-1 font-weight-bold">Test a real email</v-card-title>
          <v-card-text>
            <v-select
              v-model="scenarioKey"
              :items="scenarios"
              item-title="label"
              item-value="key"
              label="Email"
              density="comfortable"
              hide-details="auto"
              class="mb-2"
              @update:model-value="reset"
            />
            <p v-if="scenario" class="text-body-2 text-medium-emphasis mb-3">{{ scenario.description }}</p>
            <div v-if="scenario?.template_keys.length" class="mb-3">
              <span class="text-caption text-medium-emphasis mr-1">Managed template:</span>
              <v-chip v-for="key in scenario.template_keys" :key="key" size="x-small" label class="mr-1">{{ key }}</v-chip>
            </div>

            <v-text-field
              v-for="input in scenario?.inputs ?? []"
              :key="input.name"
              v-model="params[input.name]"
              :label="input.label + (input.required ? ' *' : '')"
              :hint="input.help"
              persistent-hint
              density="comfortable"
              class="mb-2"
              @keyup.enter="submit"
            />

            <v-btn-toggle v-model="mode" mandatory color="primary" density="comfortable" class="mb-3 w-100" divided>
              <v-btn value="dry" class="flex-grow-1">
                <v-icon start>mdi-eye-outline</v-icon>
                Dry run
              </v-btn>
              <v-btn value="send" class="flex-grow-1" :disabled="!allowed.length">
                <v-icon start>mdi-send-outline</v-icon>
                Send to sandbox
              </v-btn>
            </v-btn-toggle>
            <p class="text-caption text-medium-emphasis mb-3">
              <template v-if="mode === 'dry'">Builds the real email and shows who it would reach. Nothing is sent.</template>
              <template v-else>Sends the real email, but only to the authorized recipients below.</template>
            </p>

            <div class="mb-3">
              <div class="d-flex align-center mb-1">
                <span class="text-body-2 font-weight-medium">Sandbox recipients</span>
                <v-spacer />
                <v-btn size="x-small" variant="text" prepend-icon="mdi-account-cog-outline" @click="recipientsOpen = true">Manage</v-btn>
              </div>
              <v-chip-group v-if="allowed.length" v-model="selected" multiple column :disabled="mode === 'dry'">
                <v-chip v-for="email in allowed" :key="email" :value="email" filter size="small" variant="tonal">{{ email }}</v-chip>
              </v-chip-group>
              <v-alert v-else type="warning" variant="tonal" density="compact">No authorized recipients: only dry runs are possible.</v-alert>
            </div>

            <v-btn color="primary" block :loading="running" :disabled="!canSubmit" @click="submit">
              {{ mode === 'dry' ? 'Run dry run' : 'Send test email' }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <v-card v-if="!report" elevation="0" class="tm-panel">
          <v-card-text class="text-medium-emphasis text-center py-12">
            <v-icon size="48" class="mb-2">mdi-email-search-outline</v-icon>
            <div>Pick an email and run it to see the result here.</div>
          </v-card-text>
        </v-card>

        <template v-else>
          <v-alert :type="alertType" variant="tonal" class="mb-4">
            <div class="font-weight-bold">{{ report.label }} · {{ report.mode === 'dry' ? 'dry run' : 'sent to sandbox' }}</div>
            <div v-if="report.error">{{ report.error }}</div>
            <div v-else-if="report.mode === 'send'">Delivered only to {{ report.delivered_to.join(', ') }}.</div>
            <div v-else>Nothing was sent.</div>
          </v-alert>

          <v-card v-for="(message, index) in report.messages.filter((m) => m.status !== 'blocked')" :key="index" elevation="0" class="tm-panel mb-4">
            <v-card-title class="text-subtitle-1 text-wrap">{{ message.subject }}</v-card-title>
            <v-card-text>
              <v-table density="compact" class="mb-3">
                <tbody>
                  <tr v-for="field in ['to', 'cc', 'bcc']" :key="field">
                    <td class="text-medium-emphasis text-uppercase" style="width: 70px">{{ field }}</td>
                    <td>
                      <template v-if="message.original[field as 'to'].length">
                        <v-chip v-for="email in message.original[field as 'to']" :key="email" size="x-small" label class="mr-1 mb-1">{{ email }}</v-chip>
                      </template>
                      <span v-else class="text-medium-emphasis">none</span>
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <div class="text-caption text-medium-emphasis mb-2">Original recipients (what production would use).</div>

              <div v-if="message.attachments.length" class="mb-3">
                <v-chip v-for="file in message.attachments" :key="file.name" size="small" prepend-icon="mdi-paperclip" class="mr-1">
                  {{ file.name }} · {{ file.size_kb }} KB
                </v-chip>
              </div>

              <v-btn v-if="message.html" size="small" variant="tonal" prepend-icon="mdi-monitor-eye" @click="preview = message.html">Preview body</v-btn>
            </v-card-text>
          </v-card>
        </template>
      </v-col>
    </v-row>

    <v-dialog :model-value="!!preview" max-width="900" @update:model-value="preview = null">
      <v-card>
        <v-card-title>Email body preview</v-card-title>
        <v-card-text>
          <!-- sandbox sin permisos: el HTML del correo no ejecuta scripts ni navega -->
          <iframe :srcdoc="preview ?? ''" sandbox="" class="tm-border rounded" style="width: 100%; height: 560px; background: #fff" />
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="preview = null">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmOpen" max-width="520">
      <v-card>
        <v-card-title>Send test email?</v-card-title>
        <v-card-text>
          The real <strong>{{ scenario?.label }}</strong> email will be sent only to:
          <ul class="mt-2"><li v-for="email in effectiveRecipients" :key="email">{{ email }}</li></ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="confirmOpen = false">Cancel</v-btn>
          <Can permission="diagnostics-mail-test">
            <v-btn color="primary" @click="execute">Send</v-btn>
          </Can>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <DiagnosticsRecipientsDialog v-model="recipientsOpen" @changed="onRecipientsChanged" />
  </div>
</template>

<script setup lang="ts">
import type { IMailScenario, IMailTestReport } from '~/repository/modules/diagnostics'

const props = defineProps<{ initialScenario?: string | null }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const scenarios = ref<IMailScenario[]>([])
const scenarioKey = ref<string | null>(null)
const params = reactive<Record<string, string>>({})
const mode = ref<'dry' | 'send'>('dry')
const allowed = ref<string[]>([])
const selected = ref<string[]>([])
const running = ref(false)
const report = ref<IMailTestReport | null>(null)
const preview = ref<string | null>(null)
const confirmOpen = ref(false)
const recipientsOpen = ref(false)

const scenario = computed(() => scenarios.value.find((s) => s.key === scenarioKey.value) ?? null)
const effectiveRecipients = computed(() => (selected.value.length ? selected.value : allowed.value))
const canSubmit = computed(() => {
  if (!scenario.value || running.value) return false
  if (mode.value === 'send' && !allowed.value.length) return false
  return scenario.value.inputs.every((input) => !input.required || !!params[input.name]?.trim())
})
const alertType = computed(() => ({ ok: 'success', warn: 'warning', fail: 'error', skip: 'info' } as Record<string, any>)[report.value?.status ?? 'ok'])

const reset = () => {
  Object.keys(params).forEach((k) => delete params[k])
  report.value = null
}

const onRecipientsChanged = (effective: string[]) => {
  allowed.value = effective
  selected.value = selected.value.filter((e) => effective.includes(e))
  if (!effective.length) mode.value = 'dry'
}

const execute = async () => {
  confirmOpen.value = false
  running.value = true
  try {
    report.value = (await $api.diagnostics.runMail({
      scenario: scenarioKey.value!,
      mode: mode.value,
      params: { ...params },
      recipients: mode.value === 'send' && selected.value.length ? selected.value : undefined,
    })) as IMailTestReport
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'The test could not be executed' })
  } finally {
    running.value = false
  }
}

const submit = () => {
  if (!canSubmit.value) return
  if (mode.value === 'send') {
    confirmOpen.value = true
    return
  }
  execute()
}

onMounted(async () => {
  try {
    const response: any = await $api.diagnostics.mailScenarios()
    scenarios.value = response.scenarios
    allowed.value = response.allowed_recipients
    if (!allowed.value.length) mode.value = 'dry'
    scenarioKey.value = props.initialScenario && scenarios.value.some((s) => s.key === props.initialScenario) ? props.initialScenario : scenarios.value[0]?.key ?? null
  } catch (e) {
    console.error(e)
  }
})

watch(() => props.initialScenario, (key) => {
  if (key && scenarios.value.some((s) => s.key === key)) {
    scenarioKey.value = key
    reset()
  }
})
</script>
