<template>
  <div>
    <div class="flex mx-auto justify-center gap-4 mb-4">
      <v-btn color="green" size="small" @click="goToCreateInvoice">
        <v-icon>mdi-text-box-outline</v-icon> Create an invoice for this reference
      </v-btn>
    </div>
    <v-card class="mb-4" color="accent">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-abacus</v-icon>
            <div>TM Rates & Invoices</div>
          </div>
          <div>
            <v-btn icon size="x-small" @click="showInfoTm = !showInfoTm" color="blue-grey-darken-2">
              <v-icon v-if="showInfoTm">mdi-eye-outline</v-icon>
              <v-icon v-if="!showInfoTm">mdi-eye-closed</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text v-show="showInfoTm">
        <div class="grid grid-cols-2 gap-2">
          <!-- Charges TM -->
          <div>
            <div class="font-bold mb-4">TM concepts in reference</div>
            <div class="font-bold">Sell charges</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left font-bold!">Concept</th>
                  <th class="font-bold!">Amount</th>
                  <th class="font-bold!">+ iva</th>
                  <th class="font-bold!">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in sellChargesTm" :key="`ref-sell-charge-${idx}`">
                  <td>
                    <div class="flex items-center gap-1">
                      <v-chip size="small" :color="linkedChargeToInvoice(charge) === 'mdi-link' ? 'primary' : 'red'">
                        <v-icon>{{ linkedChargeToInvoice(charge) }}</v-icon>
                      </v-chip>
                      {{ charge.charge?.name }}
                    </div>
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(charge.amount) }} {{ getCurrencyName(charge.currency_id) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getTmConceptIva(charge)) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getTmConceptTotal(charge)) }}
                  </td>
                </tr>
              </tbody>
            </v-table>
            <div class="font-bold">Charges</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left font-bold!">Concept</th>
                  <th class="font-bold!">Amount</th>
                  <th class="font-bold!">+ iva</th>
                  <th class="font-bold!">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in chargesTm" :key="`ref-charge-${idx}`">
                  <td>
                    <v-chip size="small" :color="linkedChargeToInvoice(charge) === 'mdi-link' ? 'primary' : 'red'">
                      <v-icon>{{ linkedChargeToInvoice(charge) }}</v-icon>
                    </v-chip>
                    {{ charge.charge?.name }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(charge.amount) }} {{ getCurrencyName(charge.currency_id) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getTmConceptIva(charge)) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getTmConceptTotal(charge)) }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
          <!-- Invoices TM -->
          <div>
            <div class="font-bold mb-4">Linked TM invoice(s)</div>
            <div v-if="hasTmUnlinkedCharges">
              <v-btn v-if="false" color="green" size="small" @click="goToCreateTmInvoice">
                <v-icon>mdi-alert-circle-outline</v-icon> Create TM invoice
              </v-btn>
            </div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-bold!">Type</th>
                  <th class="font-bold!">Total</th>
                  <th class="font-bold!">Status</th>
                  <th class="font-bold!">Payment</th>
                  <th class="font-bold!">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(invoice, idx) in props.referencia.invoice_tms_all" :key="`ref-tm-invoice-${idx}`">
                  <td>
                    <div class="flex flex-col items-center gap-1 pt-1">
                      <v-chip size="small" color="purple" class="cursor-pointer" @click="viewTmInvoice(invoice)">
                        <v-icon>mdi-eye-outline</v-icon>{{ invoice.is_proforma == 1 ? 'Proforma' : 'Invoice' }} #{{
                          invoice.invoice.invoice_number
                        }}</v-chip
                      >
                      <PreviewTmInvoice service="sea" :invoice="invoice" size="small" />
                    </div>
                  </td>

                  <td class="text-right whitespace-nowrap">
                    <div v-for="(totalCurrency, index) in getCurrenciesTotal(invoice)" :key="`currency-total-${index}`">
                      {{ totalCurrency }}
                    </div>
                  </td>
                  <td>
                    <v-chip size="small" v-if="invoice.deleted_at" color="error">Cancelled</v-chip>
                    <v-chip size="small" v-if="!invoice.deleted_at" color="success">Active</v-chip>
                  </td>
                  <td>
                    <v-chip size="small" :color="invoice.invoice?.is_paid == 1 ? 'green' : 'red'">{{
                      invoice.invoice?.is_paid == 1 ? 'Paid' : 'Unpaid'
                    }}</v-chip>
                  </td>
                  <td class="whitespace-nowrap">
                    <UserInfoBadge :item="invoice">
                      {{ formatDateString(invoice.created_at) }}
                    </UserInfoBadge>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-abacus</v-icon>
            <div>WM Rates & Invoices</div>
          </div>
          <div>
            <v-btn icon size="x-small" @click="showInfoWm = !showInfoWm" color="blue-grey-darken-2">
              <v-icon v-if="showInfoWm">mdi-eye-outline</v-icon>
              <v-icon v-if="!showInfoWm">mdi-eye-closed</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text v-show="showInfoWm">
        <div class="grid grid-cols-2 gap-2">
          <!-- Charges WM -->
          <div>
            <div class="font-bold mb-4">WM concepts in reference</div>
            <div class="font-bold">Sell charges</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left font-bold!">Concept</th>
                  <th class="font-bold!">Amount</th>
                  <th class="font-bold!">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in sellChargesWm" :key="`ref-sell-charge-${idx}`">
                  <td>
                    <div class="flex items-center gap-1">
                      <v-chip size="small" :color="linkedChargeToInvoice(charge) === 'mdi-link' ? 'primary' : 'red'">
                        <v-icon>{{ linkedChargeToInvoice(charge) }}</v-icon>
                      </v-chip>
                      {{ charge.charge?.name }}
                    </div>
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(charge.amount) }} {{ getCurrencyName(charge.currency_id) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(charge.amount) }} {{ getCurrencyName(charge.currency_id) }}
                  </td>
                </tr>
              </tbody>
            </v-table>
            <div class="font-bold">Charges</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left font-bold!">Concept</th>
                  <th class="font-bold!">Amount</th>
                  <th class="font-bold!">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in chargesWm" :key="`ref-charge-${idx}`">
                  <td>
                    <div class="flex items-center gap-1">
                      <v-chip size="small" color="primary">
                        <v-icon>{{ linkedChargeToInvoice(charge) }}</v-icon>
                      </v-chip>
                      {{ charge.charge?.name }}
                    </div>
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(charge.amount) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(charge.amount) }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
          <!-- Invoices WM -->
          <div>
            <div class="font-bold mb-4">Linked WM invoice(s)</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-bold!">Type</th>
                  <th class="font-bold!">Total</th>
                  <th class="font-bold!">Status</th>
                  <th class="font-bold!">Payment</th>
                  <th class="font-bold!">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(invoice, idx) in props.referencia.invoice_wms_all" :key="`ref-wm-invoice-${idx}`">
                  <td>
                    <div class="flex flex-col items-center gap-1">
                      <v-chip size="small" color="primary" class="cursor-pointer" @click="viewWmInvoice(invoice)">
                        <v-icon>mdi-eye-outline</v-icon>{{ invoice.is_proforma == 1 ? 'Proforma' : 'Invoice' }} #{{
                          invoice.invoice.invoice_number
                        }}</v-chip
                      >
                      <PreviewWmInvoice service="sea" :invoice="invoice" size="small" />
                    </div>
                  </td>

                  <td class="text-right">
                    <div v-for="(totalCurrency, index) in getCurrenciesTotal(invoice)" :key="`currency-total-${index}`">
                      {{ totalCurrency }}
                    </div>
                  </td>
                  <td>
                    <v-chip size="small" v-if="invoice.deleted_at" color="error">Cancelled</v-chip>
                    <v-chip size="small" v-if="!invoice.deleted_at" color="success">Active</v-chip>
                  </td>
                  <td>
                    <v-chip size="small" color="error">Unpaid</v-chip>
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
  referencia: {
    type: Object,
    required: true,
  },
})

const showInfoTm = ref(true)
const showInfoWm = ref(true)

const buyRates = computed(() => {
  return props.referencia.buy_rate_breakdown
})

const sellChargesWm = computed(() => {
  return props.referencia.sell_rate_breakdown.filter((charge: any) => charge.inv_type === 'wm')
})

const chargesWm = computed(() => {
  return props.referencia.charges.filter((charge: any) => charge.inv_type === 'wm')
})

const sellChargesTm = computed(() => {
  return props.referencia.sell_rate_breakdown.filter((charge: any) => charge.inv_type === 'tm')
})

const chargesTm = computed(() => {
  return props.referencia.charges.filter((charge: any) => charge.inv_type === 'tm')
})

const getTmConceptIva = (concept: any) => {
  return concept.is_con_iva ? parseFloat(concept.amount) * 0.16 : 0
}

const getTmConceptTotal = (concept: any) => {
  return parseFloat(concept.amount) + getTmConceptIva(concept)
}

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

const hasTmUnlinkedCharges = computed(() => {
  const chargesTmUnlinked = chargesTm.value.filter((charge: any) => charge.invoice_charge == null).length > 0
  const sellChargesTmUnlinked = sellChargesTm.value.filter((charge: any) => charge.invoice_charge == null).length > 0
  return chargesTmUnlinked || sellChargesTmUnlinked
})

const viewTmInvoice = (invoice: any) => {
  console.log('View TM invoice', invoice)
  router.push(`/invoices/search/tm-view-${invoice.id}`)
}

const viewWmInvoice = (invoice: any) => {
  router.push(`/invoices/search/wm-view-${invoice.id}`)
}

const goToCreateTmInvoice = () => {
  router.push(`/invoices/capture/sea-import-${props.referencia.id}-tm-invoice`)
}

const goToCreateInvoice = () => {
  const serviceSearch = `${props.referencia.impoExpo}M`
  navigateTo(
    `/invoices/capture/consignee/by-service?service=${serviceSearch}&year=${props.referencia.reference_year}&service_number=${props.referencia.consecutive}`,
    {
      open: {
        target: '_blank',
      },
    }
  )
}
</script>
