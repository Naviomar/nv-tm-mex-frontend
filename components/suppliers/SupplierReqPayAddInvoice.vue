<template>
  <div>
    <v-btn color="primary" size="small" class="mb-1" @click="showDialog">Add Supplier Invoice available</v-btn>
    <v-dialog v-model="form.show" max-width="800">
      <v-card>
        <v-card-title>Search & add invoice</v-card-title>
        <v-card-text>
          <div v-if="!form.ffNote">
            <v-text-field v-model="form.supplierCfdiFolio" label="Invoice Folio #" clearable />
            <v-btn color="primary" @click="serachSupplierInvoice">Search</v-btn>
          </div>
          <div v-if="hasSupplierInvoices">
            <v-btn size="x-small" color="purple" @click="form.supplierInvoices = []">Clear</v-btn>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Actions</th>
                  <th class="text-left">Folio</th>
                  <th class="text-left">Ref #</th>
                  <th class="text-left">Supplier</th>
                  <th class="text-left">Date</th>
                  <th class="text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(supInvoice, index) in form.supplierInvoices" :key="`sup-invoice-${index}`">
                  <td>
                    <v-btn color="primary" size="x-small" @click="onClickAddInvoice(supInvoice)">Add</v-btn>
                  </td>
                  <td class="whitespace-nowrap">{{ supInvoice.cfdi.folio }}</td>
                  <td class="whitespace-nowrap">{{ supInvoice.referenceable?.reference_number }}</td>
                  <td>{{ supInvoice.supplier?.name }}</td>
                  <td class="whitespace-nowrap">
                    <UserInfoBadge :item="supInvoice.cfdi">
                      {{ formatDateString(supInvoice.cfdi.created_at) }}
                    </UserInfoBadge>
                  </td>
                  <td class="whitespace-nowrap">
                    {{ getCurrencyName(supInvoice.currency_id) }}
                    {{ formatToCurrency(supInvoice.amount_total) }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="form.show = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  supReqPayment: {
    type: Object,
    required: true,
  },
})

const form = reactive<any>({
  show: false,
  supplierCfdiFolio: null,
  supplierInvoices: [],
  ffNote: null,
})

const emits = defineEmits(['addInvoice'])

const showDialog = () => {
  form.show = true
}

const onClickAddInvoice = (supplierInvoice: any) => {
  emits('addInvoice', supplierInvoice)
  // form.ffNote = null
  form.show = false
}

const hasSupplierInvoices = computed(() => {
  return form.supplierInvoices.length > 0
})

const serachSupplierInvoice = async () => {
  try {
    if (!form.supplierCfdiFolio) {
      snackbar.add({ type: 'warning', text: 'Please enter a supplier invoice folio' })
      return
    }

    form.supplierInvoices = []

    loadingStore.loading = true
    const body = {
      folio: form.supplierCfdiFolio,
      sup_req_payment_id: props.supReqPayment.id,
    }
    const response = (await $api.supplierInvoices.searchInvoiceForSupReqPayment(body)) as any
    form.supplierInvoices = response
    if (form.supplierInvoices.length === 0) {
      snackbar.add({ type: 'warning', text: 'No supplier invoice available found' })
      return
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
