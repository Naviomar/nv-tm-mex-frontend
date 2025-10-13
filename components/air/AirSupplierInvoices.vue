<template>
  <div>
    <div class="font-bold">Supplier invoices</div>
    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-left">Payment</th>
          <th class="text-left">Folio</th>
          <th class="text-left">Supplier</th>
          <th class="text-left">Amount</th>
          <th class="text-left">Invoice date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cfdi, key) in invoiceCfdis" :key="key">
          <td class="p-2">
            <div v-if="hasFirstInvoiceReqPay(cfdi)" class="flex flex-col items-center">
              <div v-if="!isPaid(cfdi)">
                <v-chip color="warning" size="small">Pending payment</v-chip>
              </div>
              <div v-if="isPaid(cfdi)">
                <v-chip color="success" size="small">Paid @ {{ formatDateString(getPaidDate(cfdi)) }}</v-chip>
              </div>
              <div class="text-xs">
                @ Requested at {{ formatDateOnlyString(cfdi.invoices[0].req_pay_invoice.created_at) }}
              </div>
            </div>
            <div v-if="!hasFirstInvoiceReqPay(cfdi)">
              <v-chip color="warning">Pending request</v-chip>
            </div>
          </td>
          <td class="p-2">
            <div @click="goToSupplierReqPaymentView(cfdi)" class="cursor-pointer hover:underline">{{ cfdi.folio }}</div>
          </td>
          <td class="p-2">{{ cfdi.supplier?.name }}</td>
          <td class="p-2">
            <div class="flex items-center">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-avatar v-bind="props">
                    <v-icon color="green">mdi-information-outline</v-icon>
                  </v-avatar>
                </template>
                <div class="flex flex-col">
                  <div class="flex justify-between">
                    <span>Amount:</span>
                    <span>{{ formatToCurrency(getAmountInvoices(cfdi)) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>IVA:</span>
                    <span>{{ formatToCurrency(getIvaInvoices(cfdi)) }}</span>
                  </div>
                  <div class="flex justify-between text-red dark:text-red-900!">
                    <span>ISR:</span>
                    <span>-{{ formatToCurrency(getIsrInvoices(cfdi)) }}</span>
                  </div>
                  <div class="flex justify-between text-red dark:text-red-900!">
                    <span>IVA Ret:</span>
                    <span>-{{ formatToCurrency(getIvaRetInvoices(cfdi)) }}</span>
                  </div>
                </div>
              </v-tooltip>

              {{ formatToCurrency(getTotalInvoices(cfdi)) }} {{ getCurrencyName(cfdi.currency_id) }}
            </div>
          </td>
          <td class="p-2">{{ formatDateOnlyString(cfdi.created_at) }}</td>
        </tr>
      </tbody>
    </v-table>

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
              Req. Adv. Payment #{{ reqAdvPayment.id }}
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

const hasFirstInvoiceReqPay = (cfdi: any) => {
  if (cfdi.invoices.length === 0) {
    return false
  }
  const invoice = cfdi.invoices[0]
  return invoice.req_pay_invoice != null
}

const isPaid = (cfdi: any) => {
  if (cfdi.invoices.length === 0) {
    return false
  }
  // foreach invoices check if all are paid checking req_pay_invoice.supplier_req_pay.invoice.is_paid = 1
  return cfdi.invoices.every((invoice: any) => {
    return invoice.req_pay_invoice?.supplier_req_pay?.invoice?.is_paid === 1
  })
}

const getPaidDate = (cfdi: any) => {
  if (cfdi.invoices.length === 0) {
    return ''
  }
  const invoice = cfdi.invoices[0]
  return invoice.req_pay_invoice?.supplier_req_pay?.invoice?.paid_at
}

const getAmountInvoices = (cfdi: any) => {
  return cfdi.invoices.reduce((acc: number, curr: any) => {
    return acc + parseFloat(curr.amount)
  }, 0)
}

const getIvaInvoices = (cfdi: any) => {
  return cfdi.invoices.reduce((acc: number, curr: any) => {
    return acc + parseFloat(curr.amount_iva)
  }, 0)
}

const getIsrInvoices = (cfdi: any) => {
  return cfdi.invoices.reduce((acc: number, curr: any) => {
    return acc + parseFloat(curr.amount_ret_isr)
  }, 0)
}

const getIvaRetInvoices = (cfdi: any) => {
  return cfdi.invoices.reduce((acc: number, curr: any) => {
    return acc + parseFloat(curr.amount_ret_iva)
  }, 0)
}

const getTotalInvoices = (cfdi: any) => {
  return cfdi.invoices.reduce((acc: number, curr: any) => {
    return acc + parseFloat(curr.amount_total)
  }, 0)
}

const goToSupplierReqPaymentView = (cfdi: any) => {
  router.push(`/invoices/suppliers/cfdis/request-payment/view-${cfdi.invoices[0].req_pay_invoice.supplier_req_pay_id}`)
}

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
