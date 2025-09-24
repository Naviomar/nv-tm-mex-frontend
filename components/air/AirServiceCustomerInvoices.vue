<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="font-bold"><span class="text-xl">💰</span>Customer invoices</div>
      <v-btn icon size="x-small" variant="tonal" color="primary" @click="getAirServiceCustomerInvoices">
        <v-icon>mdi-sync</v-icon>
      </v-btn>
    </div>

    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-left">Pay status</th>
          <th class="text-left">Invoice #</th>
          <th class="text-left">Credit notes</th>
          <th class="text-left">Customer</th>
          <th class="text-left">Amount</th>
          <th class="text-left">Invoice date</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(airInvoice, key) in customerAirInfo.invoices"
          :key="key"
          :class="{ 'bg-red-100! dark:bg-red-900!': airInvoice.deleted_at != null }"
        >
          <td class="p-2">
            <div class="flex flex-col items-center gap-1 mb-2">
              <v-chip v-if="airInvoice.deleted_at != null" color="red" size="small"> Cancelada </v-chip>
              <v-chip v-else-if="airInvoice.invoice?.is_paid === 0" color="warning" size="small"> Pending </v-chip>
              <v-chip v-else color="success" size="small"> Paid </v-chip>

              <InvoiceChargePaymentsView size="x-small" :invoice="airInvoice.invoice" />
            </div>
          </td>
          <td class="p-2">
            <div class="flex flex-col items-center gap-0 mb-2">
              {{ airInvoice.invoice.invoice_number }} <br />
              <div v-if="isInvoiceTm(airInvoice.invoice)">
                <PreviewTmInvoice service="air" :invoice="airInvoice" size="small" />
              </div>
              <div v-if="isInvoiceWm(airInvoice.invoice)">
                <PreviewWmInvoice service="air" :invoice="airInvoice" size="small" />
              </div>
            </div>
          </td>
          <td class="p-2">
            <div v-if="airInvoice.credit_notes.length <= 0">
              <v-chip color="grey" size="x-small">None</v-chip>
            </div>
            <div v-for="(creditNote, key) in airInvoice.credit_notes" :key="`credit-note-${key}`">
              <v-chip color="red" size="x-small">
                <UserInfoBadge :item="creditNote"> Credit Note #{{ creditNote.id }} </UserInfoBadge>
              </v-chip>
            </div>
          </td>
          <td class="p-2">{{ airInvoice.consignee_name }}</td>
          <td class="p-2">
            {{ formatToCurrency(getTotalInvoice(airInvoice.invoice)) }}
            {{ getCurrencyName(airInvoice.invoice.currency_id) }}
          </td>
          <td class="p-2">
            <UserInfoBadge :item="airInvoice">
              {{ formatDateOnlyString(airInvoice.created_at) }}
            </UserInfoBadge>
          </td>
        </tr>
      </tbody>
    </v-table>

    <div class="flex items-center justify-between">
      <div class="font-bold"><span class="text-xl">🤑</span>Customer payments</div>
      <v-btn icon size="x-small" variant="tonal" color="primary" @click="getAirServiceCustomerInvoices">
        <v-icon>mdi-sync</v-icon>
      </v-btn>
    </div>

    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-left">Payment</th>
          <th class="text-left">Amount</th>
          <th class="text-left">Created at</th>
          <th class="text-left">By</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="customerAirInfo.service_payments.length <= 0">
          <td class="p-2 text-center" colspan="4">No payments found</td>
        </tr>
        <tr v-for="(servicePayment, key) in customerAirInfo.service_payments" :key="`serv-pay-${key}`">
          <td class="p-2">{{ servicePayment.charge?.name }}</td>
          <td class="p-2">
            {{ formatToCurrency(servicePayment.amount) }} {{ getCurrencyName(servicePayment.currency_id) }}
          </td>
          <td class="p-2">{{ formatDateString(servicePayment.created_at) }}</td>
          <td class="p-2">{{ servicePayment.creator?.name }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  airReferenceId: {
    type: [String, Number],
    required: true,
  },
})

const customerAirInfo = ref<any>({
  invoices: [],
  service_payments: [],
})

const isInvoiceTm = (invoice: any) => {
  return invoice.invoiceable_type.includes('InvoiceAirTm')
}

const isInvoiceWm = (invoice: any) => {
  return invoice.invoiceable_type.includes('InvoiceAirWm')
}

const getTotalInvoice = (invoice: any) => {
  if (invoice.deleted_at !== null) {
    return (invoice.charges_cancelled || []).reduce((acc: number, curr: any) => {
      return acc + (parseFloat(curr.amount) + parseFloat(curr.amount_iva))
    }, 0)
  }
  return invoice.charges.reduce((acc: number, curr: any) => {
    return acc + (parseFloat(curr.amount) + parseFloat(curr.amount_iva))
  }, 0)
}

const getAirServiceCustomerInvoices = async () => {
  try {
    loadingStore.start()
    const response = await $api.airReferences.getAirServiceCustomerInvoices(props.airReferenceId.toString())
    customerAirInfo.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getAirServiceCustomerInvoices()
</script>
