<template>
  <v-dialog :model-value="modelValue" persistent max-width="760px" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>Ref#{{ referencia.reference_number }} Send demurrages cut</v-card-title>
      <v-card-text>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-2">
          <div class="text-subtitle-2">Containers to include</div>
          <div class="d-flex ga-2">
            <v-btn size="x-small" variant="outlined" :disabled="!actionableIds.length" @click="selectActionable">
              Select pending ({{ actionableIds.length }})
            </v-btn>
            <v-btn size="x-small" variant="outlined" @click="selected = containers.map((c) => c.id)">All</v-btn>
            <v-btn size="x-small" variant="outlined" @click="selected = []">None</v-btn>
          </div>
        </div>

        <v-table density="compact">
          <thead>
            <tr>
              <th class="w-8"></th>
              <th>Container</th>
              <th>Cálculo</th>
              <th class="text-right">Total USD</th>
              <th>Cut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in containers" :key="c.id">
              <td><v-checkbox v-model="selected" :value="c.id" color="primary" hide-details density="compact" /></td>
              <td>{{ c.container_number }}</td>
              <td>{{ c.demurrage.is_parcial ? 'Parcial' : 'Total' }}</td>
              <td class="text-right">{{ formatToCurrency(Number(c.demurrage.amount) + Number(c.demurrage.amount_iva)) }}</td>
              <td><DemurrageCutStatusChip :status="c.demurrage.cut_status" :last-cut="c.demurrage.latest_cut" /></td>
            </tr>
          </tbody>
        </v-table>

        <v-textarea v-model="emails" label="Email(s)" rows="4" class="mt-4" />
      </v-card-text>
      <v-card-actions>
        <v-btn @click="emit('update:modelValue', false)">Close</v-btn>
        <v-spacer />
        <PreviewDemurrageCut
          :referencia="referencia"
          :container-ids="selected"
          :disabled="!selected.length"
          class="w-40"
        />
        <v-btn color="primary" :disabled="!selected.length" :loading="loadingStore.loading" @click="send">
          Send ({{ selected.length }})
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { hasAtLeastOneValidEmail } = useEmailListValidation()

const props = defineProps<{
  modelValue: boolean
  referencia: any
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'sent'): void
}>()

const emails = ref('')
const selected = ref<number[]>([])

const containers = computed<any[]>(() => (props.referencia?.containers ?? []).filter((c: any) => c.demurrage))

// pending + outdated: los que todavía requieren (re)enviar corte
const actionableIds = computed<number[]>(() =>
  containers.value.filter((c) => c.demurrage.cut_status !== 'sent').map((c) => c.id)
)

const selectActionable = () => {
  selected.value = [...actionableIds.value]
}

// Cada vez que se abre, preseleccionar lo pendiente (o todo si ya está al día)
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    selected.value = actionableIds.value.length ? [...actionableIds.value] : containers.value.map((c) => c.id)
  }
)

const send = async () => {
  if (!selected.value.length) {
    snackbar.add({ type: 'warning', text: 'Select at least one container' })
    return
  }
  if (!hasAtLeastOneValidEmail(emails.value)) {
    snackbar.add({ type: 'warning', text: 'Enter at least one valid email' })
    return
  }
  try {
    loadingStore.loading = true
    const response = (await $api.demurrages.sendEmailDemurrageCut(String(props.referencia.id), {
      emails: emails.value,
      container_ids: selected.value,
    })) as any
    snackbar.add({ type: 'success', text: response.message })
    emails.value = ''
    emit('update:modelValue', false)
    emit('sent')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
