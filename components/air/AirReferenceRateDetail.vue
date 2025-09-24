<template>
  <div>
    <div class="flex mx-auto justify-center gap-4 mb-4">
      <v-btn color="green" size="small" @click="goToCreateInvoice">
        <v-icon>mdi-text-box-outline</v-icon> Create an invoice for this reference
      </v-btn>
    </div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-abacus</v-icon>
            <div>Invoices</div>
          </div>
          <div>
            <v-btn icon size="x-small" @click="showInfoInvoices = !showInfoInvoices" color="blue-grey-darken-2">
              <v-icon v-if="showInfoInvoices">mdi-eye-outline</v-icon>
              <v-icon v-if="!showInfoInvoices">mdi-eye-closed</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text v-show="showInfoInvoices">
        <div class="">
          <!-- Invoices TM/WM -->
          <div>
            <div class="font-bold mb-4">Linked invoice(s)</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-bold! w-10">Type</th>
                  <th class="font-bold! w-10">Document</th>
                  <th class="font-bold!">Total</th>
                  <th class="font-bold!">Status</th>
                  <th class="font-bold!">Payment</th>
                  <th class="font-bold!">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="allInvoices.length <= 0">
                  <td colspan="6" class="text-center">No invoices found</td>
                </tr>
                <tr v-for="(invoice, idx) in airReference.invoice_tms_all" :key="`air-ref-invoice-tm-${idx}`">
                  <td>
                    <v-chip size="small" color="primary">TM</v-chip>
                  </td>
                  <td>
                    <div class="flex flex-col items-center gap-1">
                      <v-chip size="small" color="primary" class="cursor-pointer" @click="viewInvoice(invoice, 'tm')">
                        <v-icon>mdi-eye-outline</v-icon>{{ invoice.is_proforma == 1 ? 'Proforma' : 'Invoice' }} #{{
                          invoice.invoice.invoice_number
                        }}</v-chip
                      >
                      <PreviewTmInvoice service="air" :invoice="invoice" size="small" />
                    </div>
                  </td>

                  <td class="text-right">
                    <div v-for="(totalCurrency, index) in getCurrenciesTotal(invoice)" :key="`currency-total-${index}`">
                      {{ totalCurrency }}
                    </div>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" v-if="invoice.deleted_at" color="error">Cancelled</v-chip>
                    <v-chip size="small" v-if="!invoice.deleted_at" color="success">Active</v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" :color="invoice.invoice?.is_paid == 1 ? 'green' : 'red'">{{
                      invoice.invoice?.is_paid == 1 ? 'Paid' : 'Unpaid'
                    }}</v-chip>
                  </td>
                  <td>{{ formatDateString(invoice.created_at) }}</td>
                </tr>
                <tr v-for="(invoice, idx) in airReference.invoice_wms_all" :key="`air-ref-invoice-wm-${idx}`">
                  <td>
                    <v-chip size="small" color="primary">WM</v-chip>
                  </td>
                  <td>
                    <div class="flex flex-col items-center gap-1">
                      <v-chip size="small" color="primary" class="cursor-pointer" @click="viewInvoice(invoice, 'wm')">
                        <v-icon>mdi-eye-outline</v-icon>{{ invoice.is_proforma == 1 ? 'Proforma' : 'Invoice' }} #{{
                          invoice.invoice.invoice_number
                        }}</v-chip
                      >
                      <PreviewWmInvoice service="air" :invoice="invoice" size="small" />
                    </div>
                  </td>

                  <td class="text-right">
                    <div v-for="(totalCurrency, index) in getCurrenciesTotal(invoice)" :key="`currency-total-${index}`">
                      {{ totalCurrency }}
                    </div>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" v-if="invoice.deleted_at" color="error">Cancelled</v-chip>
                    <v-chip size="small" v-if="!invoice.deleted_at" color="success">Active</v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" :color="invoice.invoice?.is_paid == 1 ? 'green' : 'red'">{{
                      invoice.invoice?.is_paid == 1 ? 'Paid' : 'Unpaid'
                    }}</v-chip>
                  </td>
                  <td>{{ formatDateString(invoice.created_at) }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
const router = useRouter()

const props = defineProps({
  airReference: {
    type: Object,
    required: true,
  },
})

const showInfoInvoices = ref(true)

const sellChargesTm = computed(() => {
  return props.airReference.sell_rate_breakdown?.filter((charge: any) => charge.inv_type === 'tm') || []
})

const chargesTm = computed(() => {
  return props.airReference.charges?.filter((charge: any) => charge.inv_type === 'tm') || []
})

const allInvoices = computed(() => {
  // return invoice_tms_all and invoice_wms_all
  return props.airReference.invoice_tms_all?.concat(props.airReference.invoice_wms_all) || []
})

const getCurrenciesTotal = (invoice: any) => {
  if (!invoice.invoice_total) return []
  const totales = Object.keys(invoice.invoice_total).map((currency_id: any) => {
    // console.log('currency_id', currency_id)
    // console.log('total', invoice.invoice_total[currency_id])
    const currency = currencies.find((c) => c.id == currency_id)
    return `${currency?.name}: ${formatToCurrency(invoice.invoice_total[currency_id])}`
  })
  return totales
}

const getInvoiceWmTotal = (invoice: any) => {
  if (invoice.concepts_total.length <= 0) {
    return 0
  }
  if (invoice.concepts_total[0].total) {
    return invoice.concepts_total[0].total
  }
}

const linkedChargeToInvoice = (charge: any) => {
  if (charge.invoice_charge != null) {
    return 'mdi-link'
  }
  return 'mdi-link-off'
}

const viewInvoice = (invoice: any, invType: string) => {
  if (invType === 'tm') {
    router.push(`/invoices/search/tm-air-view-${invoice.id}`)
  }
  if (invType === 'wm') {
    router.push(`/invoices/search/wm-air-view-${invoice.id}`)
  }
}

const goToCreateInvoice = () => {
  const serviceSearch = `${props.airReference.impoExpo}A`
  navigateTo(
    `/invoices/capture/consignee/by-service?service=${serviceSearch}&year=${props.airReference.reference_year}&service_number=${props.airReference.consecutive}`,
    {
      open: {
        target: '_blank',
      },
    }
  )
}
</script>
