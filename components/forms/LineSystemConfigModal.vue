<template>
  <v-dialog v-model="dialog.show" max-width="640" scrollable persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex justify-space-between align-center bg-primary text-white pa-4">
        <div>
          <div class="text-h6">System Config</div>
          <div class="text-caption text-white" style="opacity: 0.8">{{ lineName }}</div>
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
                <v-icon icon="mdi-file-document-edit-outline" />
              </v-avatar>
            </template>

            <v-list-item-title>Allow folio/PDF edit after payment</v-list-item-title>
            <v-list-item-subtitle class="text-wrap">
              Allows the one-time free folio/PDF edit on this line's invoices to be used even after the invoice is
              paid.
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-switch
                v-if="hasPermission('lines-update-folio-edit-config')"
                v-model="form.allow_folio_edit_after_payment"
                color="primary"
                density="compact"
                hide-details
                inset
              />
              <v-chip
                v-else
                size="small"
                variant="tonal"
                :color="form.allow_folio_edit_after_payment ? 'success' : 'default'"
              >
                {{ form.allow_folio_edit_after_payment ? 'Enabled' : 'Disabled' }}
              </v-chip>
            </template>
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

const lineName = ref('')
const saving = ref(false)

const form = reactive({
  allow_folio_edit_after_payment: false,
})

const resetForm = () => {
  form.allow_folio_edit_after_payment = false
}

const openEdit = async (line: any) => {
  dialog.itemId = line.id
  lineName.value = line.name
  form.allow_folio_edit_after_payment = !!line.allow_folio_edit_after_payment
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
    await $api.lines.updateSystemConfig(dialog.itemId.toString(), { ...form })
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
