<template>
  <v-dialog v-model="dialog.show" max-width="600" scrollable persistent>
    <v-card rounded="xl">
      <v-toolbar color="primary" density="comfortable">
        <v-toolbar-title>System Config — {{ consigneeName }}</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
      </v-toolbar>
      <v-card-text class="space-y-4 pt-4">
        <v-card density="compact" variant="tonal" color="blue-lighten-5">
          <v-card-title>Invoicing</v-card-title>
          <v-card-text>
            <div v-if="hasPermission('customers-update-credit-legend')">
              <v-switch
                v-model="form.show_credit_legend"
                label="Show credit legend on invoice PDFs"
                color="primary"
                density="compact"
                hide-details
              />
            </div>
            <div v-else class="text-sm">
              Credit legend on invoice PDFs: <strong>{{ form.show_credit_legend ? 'Enabled' : 'Disabled' }}</strong>
            </div>

            <div v-if="hasPermission('customers-update-invoicing-config')">
              <v-switch
                v-model="form.auto_invoicing"
                label="Transform proforma to invoice automatically"
                color="primary"
                density="compact"
                hide-details
              />
              <v-select
                v-if="form.auto_invoicing"
                v-model="form.invoice_trigger"
                :items="invoiceTriggerOptions"
                item-title="label"
                item-value="value"
                label="Date trigger"
                density="compact"
                variant="outlined"
                class="mt-3"
                hide-details
              />
              <div v-else class="text-sm text-grey-darken-1 mt-2">
                Proformas for this customer will stay as proforma until someone converts them manually.
              </div>
            </div>
            <div v-else class="text-sm mt-2">
              Automatic invoicing: <strong>{{ form.auto_invoicing ? 'Enabled' : 'Disabled' }}</strong>
              <span v-if="form.auto_invoicing"> ({{ invoiceTriggerLabel }})</span>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="save">
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
