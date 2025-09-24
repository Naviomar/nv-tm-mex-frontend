<template>
  <div>
    <v-btn v-if="isLinkedToSupplier" color="purple" size="small" @click="toggleDialog">
      <v-icon>mdi-link</v-icon>Reissued Invoice
    </v-btn>
    <v-dialog v-model="dialog" width="600">
      <v-card>
        <v-card-title class="whitespace-nowrap! text-sm!">
          Search other supplier invoice to link it to the current invoice (Reissued Invoice)
        </v-card-title>
        <v-card-text>
          <div v-if="isLinked" class="mb-4">
            <v-alert type="warning" title="Info" variant="tonal" density="compact">
              This invoice is already linked to
              <NuxtLink
                :to="`/invoices/suppliers/cfdis/view-${props.supplierCfdi.id}`"
                target="_blank"
                class="underline"
                ><v-icon>mdi-open-in-new</v-icon> {{ props.supplierCfdi.parent_deleted?.serie_folio }}
              </NuxtLink>
              <div>
                <v-btn color="error" size="small" @click="unlinkInvoice">Unlink</v-btn>
              </div>
            </v-alert>
          </div>
          <div v-if="!isLinked">
            <div class="grid grid-cols-2 gap-2">
              <v-text-field
                v-model="form.folio"
                density="compact"
                :label="`Folio`"
                hint="Only deleted invoices can be found and not linked to another invoice in the past."
              />
              <v-text-field
                v-model="form.serie"
                density="compact"
                :label="`Serie`"
                hint="Only deleted invoices can be found and not linked to another invoice in the past."
              />
            </div>
            <v-btn color="primary" size="small" @click="searchInvoice">Search</v-btn>
            <div v-if="form.deletedInvoice" class="m-8 p-2">
              <v-divider />
              <div class="text-sm!">
                <div class="font-bold!">Deleted Invoice Details</div>
                <div>Invoice # {{ form.deletedInvoice.id }}</div>
                <div>Invoice Date: {{ formatDateString(form.deletedInvoice.created_at) }}</div>
                <div>Invoice Status: Cancelled @ {{ formatDateString(form.deletedInvoice.deleted_at) }}</div>
                <v-btn color="secondary" size="small" @click="linkInvoice">Link Invoice</v-btn>
              </div>
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
  supplierCfdi: {
    type: Object as PropType<any>,
    required: true,
  },
})

const emit = defineEmits(['refresh'])

const dialog = ref(false)

const form = reactive<any>({
  folio: null,
  serie: null,
  deletedInvoice: null,
})

const isLinkedToSupplier = computed(() => {
  return !!props.supplierCfdi.supplier_id && props.supplierCfdi.deleted_at == null
})

const isLinked = computed(() => {
  return !!props.supplierCfdi.from_deleted_id
})

const toggleDialog = () => {
  dialog.value = !dialog.value
}

const linkInvoice = async () => {
  try {
    loadingStore.start()
    const body = {
      supplier_cfdi_id: props.supplierCfdi.id,
      deletedInvoiceId: form.deletedInvoice.id,
    }
    await $api.supplierInvoices.linkDeletedCfdi(body)
    dialog.value = false
    form.folio = null
    form.serie = null
    form.deletedInvoice = null

    emit('refresh')
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }

  emit('refresh')
}

const unlinkInvoice = async () => {
  try {
    loadingStore.start()
    const body = {
      supplier_cfdi_id: props.supplierCfdi.id,
    }
    await $api.supplierInvoices.unlinkDeletedCfdi(body)
    emit('refresh')
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const searchInvoice = async () => {
  if (!form.folio || !form.serie) {
    snackbar.add({ type: 'warning', text: 'Please fill all required fields' })
    return
  }

  form.deletedInvoice = null
  await findDeletedSupplierCfdis()
}

const findDeletedSupplierCfdis = async () => {
  try {
    loadingStore.start()
    const body = {
      supplier_id: props.supplierCfdi.supplier_id,
      folio: form.folio,
      serie: form.serie,
    }
    const response = await $api.supplierInvoices.findDeletedCfdisToLink(body)
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
