<template>
  <div>
    <div class="font-bold">Select customer & address</div>
    <div>
      <v-autocomplete
        v-model="form.customer_id"
        :items="catalogs.consignees"
        density="compact"
        label="Customer"
        item-title="name"
        item-value="id"
        hide-details
        @update:model-value="getConsigneeInfo"
      />
    </div>

    <div class="font-bold mb-2">Invoice info (read only)</div>
    <div class="mb-2">
      <v-text-field v-model="form.rfc" density="compact" label="RFC" variant="outlined" readonly hide-details />
    </div>
    <div class="mb-2">
      <v-textarea
        v-model="form.address"
        density="compact"
        label="Address"
        variant="outlined"
        readonly
        hide-details
        rows="3"
      />
    </div>
    <div class="mb-2">
      <v-text-field
        v-model="form.zip_code"
        density="compact"
        label="Zip code"
        variant="outlined"
        readonly
        hide-details
      />
    </div>

    <div class="grid grid-cols-1 py-2">
      <v-alert v-if="hasCustomer && !currentConsignee.address" type="warning" variant="outlined" density="compact">
        <div class="font-bold">No address found for this customer</div>
      </v-alert>

      <v-alert
        v-if="hasCustomer && !hasCustomerAddresses"
        type="error"
        variant="outlined"
        density="compact"
        class="my-2"
      >
        <div class="font-bold">
          No more addresses found for this customer, add at least one address to the customer.
        </div>
      </v-alert>

      <div v-if="hasCustomerAddresses" class="text-right">
        <v-btn color="blue-lighten-1" size="small" @click="showAddressDialog = true">
          <v-icon>mdi-map-marker</v-icon>
          Change address
        </v-btn>
      </div>
      <ConsigneeChooseAddressSmart
        v-if="showAddressDialog"
        :consignee="currentConsignee"
        @close="showAddressDialog = false"
        @selected:address="setAddress"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const emits = defineEmits(['selected:customer'])

const catalogs = ref<any>({
  consigness: [],
})

const form = ref<any>({
  customer_id: null,
  razon_social: '',
  rfc: '',
  address: '',
  zip_code: '',
})

const currentConsignee = ref<any>({
  address: null,
  addresses: [],
})

const showAddressDialog = ref(false)

const hasCustomer = computed(() => {
  return form.value.customer_id !== null
})

const hasCustomerAddresses = computed(() => {
  return currentConsignee.value.addresses?.length > 0
})

const getConsigneeInfo = async (id: string) => {
  try {
    loadingStore.loading = true
    const response: any = await $api.consignees.getDetailsForInvoice(id)

    // console.log('result', response)
    currentConsignee.value = response
    form.value.razon_social = response?.name
    form.value.regimen_fiscal = response?.regimen_fiscal
    form.value.rfc = response?.tax_number
    form.value.address = fullAddress(response?.address)
    form.value.zip_code = response?.address?.zip_code

    emits('selected:customer', form.value)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.tmInvoices.getCatalogs()) as any

    catalogs.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const setAddress = (address: any) => {
  form.value.address = fullAddress(address)
  form.value.zip_code = address.zip_code
  showAddressDialog.value = false
  emits('selected:customer', form.value)
}

const fullAddress = (address: any) => {
  if (!address) return ''
  return `${address.street} ${address.number} - ${address.neighborhood} ${address.city} ${address.state} ${address.country?.name}, ${address.zip_code}`
}

await getCatalogs()
</script>
