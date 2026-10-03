<template>
  <div>
    <ServiceSupplierInvoicesTable :invoice-cfdis="invoiceCfdis" class="mb-4" />

    <div class="font-bold">Supplier Advance Payments</div>
    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-left">Status</th>
          <th class="text-left">Folio</th>
          <th class="text-left">Supplier</th>
          <th class="text-left">Amount</th>
          <th class="text-left">Created</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(reqAdvPayment, index) in serviceAdvPayments" :key="`serv-adv-pay-${index}`">
          <td class="p-2">Pending to apply</td>
          <td class="p-2">
            <v-btn size="small" color="lime" variant="outlined" @click="goToReqAdvPayment(reqAdvPayment)">
              <v-icon>mdi-open-in-new</v-icon>
              Req. Adv. Payment {{ reqAdvPayment.folio || '#' + reqAdvPayment.id }}
            </v-btn>
          </td>
          <td class="p-2">{{ reqAdvPayment.supplier?.name }}</td>
          <td class="p-2">
            {{ formatToCurrency(reqAdvPayment.amount) }} {{ getCurrencyName(reqAdvPayment.currency_id) }}
          </td>
          <td class="p-2">{{ formatDateOnlyString(reqAdvPayment.created_at) }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  airReferenceId: {
    type: [String, Number],
    required: true,
  },
})

const invoiceCfdis = ref<any>([])
const serviceAdvPayments = ref<any>([])

const goToReqAdvPayment = (reqAdvPayment: any) => {
  router.push(`/advance-payments/view-${reqAdvPayment.id}`)
}

const getAirSupplierInvoices = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.airServices.getSupplierInvoices(props.airReferenceId.toString())
    invoiceCfdis.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getServiceAdvancePayments = async () => {
  try {
    loadingStore.loading = true
    const body = {
      serviceable_id: props.airReferenceId,
      serviceable_type: 'AirReference',
    }
    const response = await $api.suppliers.getAdvancePaymentsByService(body)
    serviceAdvPayments.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  Promise.allSettled([getAirSupplierInvoices(), getServiceAdvancePayments()])
})
</script>
