<template>
  <div>
    <v-btn color="red" variant="tonal" size="small" @click="toggleDialog">
      <v-icon>mdi-link</v-icon>Link a deleted invoice
    </v-btn>
    <v-dialog v-model="dialog" width="600">
      <v-card>
        <v-card-title class="whitespace-nowrap! text-sm!">
          Search a deleted {{ invType }} invoice to link it to the current invoice (reinvoicing)
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.invoiceId"
            density="compact"
            :label="`${invType} Invoice #`"
            hint="Only deleted invoices can be found and not linked to another invoice in the past."
          />
          <v-btn color="primary" size="small" @click="searchInvoice">Search</v-btn>
          <div v-if="form.deletedInvoice" class="m-8 p-2 ">
            <v-divider />
            <div class="text-sm!">
              <div class="font-bold!">Deleted Invoice Details</div>
              <div>Invoice # {{ form.deletedInvoice.id }}</div>
              <div>Invoice Date: {{ formatDateString(form.deletedInvoice.created_at) }}</div>
              <div>Invoice Status: Cancelled @ {{ formatDateString(form.deletedInvoice.deleted_at) }}</div>
              <v-btn color="secondary" size="small" @click="linkInvoice">Link Invoice</v-btn>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  invType: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const dialog = ref(false)

const form = reactive<any>({
  invoiceId: '',
  deletedInvoice: null,
})

const toggleDialog = () => {
  dialog.value = !dialog.value
}

const linkInvoice = async () => {
  emit('update:modelValue', form.deletedInvoice)
  dialog.value = false
  form.invoiceId = ''
  form.deletedInvoice = null
}

const searchInvoice = async () => {
  console.log('searching invoice', form.invoiceId)
  if (!form.invoiceId) {
    snackbar.add({ type: 'warning', text: 'Please fill all required fields' })
    return
  }

  form.deletedInvoice = null
  if (props.invType === 'WM') {
    await findDeletedWmInvoices()
  }
  if (props.invType === 'TM') {
    await findDeletedTmInvoices()
  }
}

const findDeletedWmInvoices = async () => {
  loadingStore.start()
  try {
    const response = await $api.wmInvoices.findDeletedInvoicesToLink(form.invoiceId)
    form.deletedInvoice = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const findDeletedTmInvoices = async () => {
  loadingStore.start()
  try {
    const response = await $api.tmInvoices.findDeletedInvoicesToLink(form.invoiceId)
    form.deletedInvoice = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
