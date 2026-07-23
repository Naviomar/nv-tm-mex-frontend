<template>
  <v-dialog v-model="dialog.show" max-width="640" scrollable persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex justify-space-between align-center bg-primary text-white pa-4">
        <div>
          <div class="text-h6">System Config</div>
          <div class="text-caption text-white" style="opacity: 0.8">{{ consigneeName }}</div>
        </div>
        <v-btn icon="mdi-close" variant="text" color="white" size="small" @click="closeDialog" />
      </v-card-title>

      <v-card-text class="pa-0">
        <v-list class="py-0" lines="two">
          <v-list-subheader class="text-uppercase text-caption font-weight-bold">
            Invoicing
          </v-list-subheader>

          <v-list-item>
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" size="40" class="mr-3">
                <v-icon icon="mdi-file-document-outline" />
              </v-avatar>
            </template>

            <v-list-item-title>Credit legend on invoices</v-list-item-title>
            <v-list-item-subtitle class="text-wrap">
              Prints the credit days/start/due date legend on invoice PDFs.
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-switch
                v-if="hasPermission('customers-update-credit-legend')"
                v-model="form.show_credit_legend"
                color="primary"
                density="compact"
                hide-details
                inset
              />
              <v-chip v-else size="small" variant="tonal" :color="form.show_credit_legend ? 'success' : 'default'">
                {{ form.show_credit_legend ? 'Enabled' : 'Disabled' }}
              </v-chip>
            </template>
          </v-list-item>

          <v-divider />

          <v-list-item>
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" size="40" class="mr-3">
                <v-icon icon="mdi-autorenew" />
              </v-avatar>
            </template>

            <v-list-item-title>Automatic invoicing</v-list-item-title>
            <v-list-item-subtitle class="text-wrap">
              Transforms the proforma into an invoice automatically once the deadline passes.
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-switch
                v-if="hasPermission('customers-update-invoicing-config')"
                v-model="form.auto_invoicing"
                color="primary"
                density="compact"
                hide-details
                inset
              />
              <v-chip v-else size="small" variant="tonal" :color="form.auto_invoicing ? 'success' : 'default'">
                {{ form.auto_invoicing ? 'Enabled' : 'Disabled' }}
              </v-chip>
            </template>
          </v-list-item>

          <v-list-item v-if="form.auto_invoicing">
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" size="40" class="mr-3">
                <v-icon icon="mdi-calendar-clock-outline" />
              </v-avatar>
            </template>

            <v-list-item-title>Date trigger</v-list-item-title>
            <v-list-item-subtitle class="text-wrap">
              What the proforma deadline is calculated from.
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-select
                v-if="hasPermission('customers-update-invoicing-config')"
                v-model="form.invoice_trigger"
                :items="invoiceTriggerOptions"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                style="min-width: 220px"
              />
              <span v-else class="text-body-2">{{ invoiceTriggerLabel }}</span>
            </template>
          </v-list-item>

          <v-list-item v-else>
            <template v-slot:prepend>
              <v-icon icon="mdi-information-outline" color="warning" class="mr-3" />
            </template>
            <v-list-item-subtitle class="text-wrap">
              Proformas for this customer will stay as proforma until someone converts them manually.
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions class="px-6 py-4">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-content-save" :loading="saving" @click="save">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { hasPermission } = useCheckUser()

const dialog = reactive({
  show: false,
  itemId: null as number | null,
})

const consigneeName = ref('')
const saving = ref(false)

const invoiceTriggerOptions = [
  { label: 'Standard deadline (business days)', value: 'deadline' },
  { label: "Reference's ETA", value: 'eta' },
]

const form = reactive({
  show_credit_legend: false,
  auto_invoicing: true,
  invoice_trigger: 'deadline',
})

const invoiceTriggerLabel = computed(() => {
  return invoiceTriggerOptions.find((o) => o.value === form.invoice_trigger)?.label ?? form.invoice_trigger
})

const resetForm = () => {
  form.show_credit_legend = false
  form.auto_invoicing = true
  form.invoice_trigger = 'deadline'
}

const openEdit = async (consignee: any) => {
  dialog.itemId = consignee.id
  consigneeName.value = consignee.name
  form.show_credit_legend = !!consignee.show_credit_legend
  form.auto_invoicing = consignee.auto_invoicing === undefined ? true : !!consignee.auto_invoicing
  form.invoice_trigger = consignee.invoice_trigger ?? 'deadline'
  dialog.show = true
}

const closeDialog = () => {
  dialog.show = false
  resetForm()
}

const save = async () => {
  if (!dialog.itemId) return

  try {
    saving.value = true
    loadingStore.start()
    await $api.consignees.updateSystemConfig(dialog.itemId.toString(), { ...form })
    snackbar.add({ type: 'success', text: 'System config updated successfully' })
    closeDialog()
    emit('refresh')
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error updating system config' })
  } finally {
    saving.value = false
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const emit = defineEmits(['refresh'])

defineExpose({
  openEdit,
})
</script>
