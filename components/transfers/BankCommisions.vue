<template>
  <div>
    <div>
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-3 gap-2 mb-4">
        <div>
          <v-text-field v-model="filters.id" type="text" density="compact" label="Invoice number" hide-details />
        </div>
        <div>
          <v-checkbox
            v-model="filters.invoiceAvailableForBankCommission"
            density="compact"
            :value="1"
            label="Show invoices available for commission"
            hide-details
          />
        </div>
        <div>
          <v-autocomplete
            v-model="filters.invoiceWithBankCommission"
            :items="yesNoOptions"
            density="compact"
            item-title="name"
            item-value="value"
            label="Show invoices with bank commission"
            hide-details
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 mt-4">
        <div>
          <v-text-field v-model="filters.from" type="date" density="compact" label="Date from" hide-details />
        </div>
        <div>
          <v-text-field v-model="filters.to" type="date" density="compact" label="Date to" hide-details />
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn color="primary" @click="getData"> Search </v-btn>
      </div>
    </div>
    <div>
      <v-pagination
        v-model="tmInvoices.current_page"
        :length="tmInvoices.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
      <v-table density="compact" fixed-header>
        <thead>
          <tr>
            <th>Actions</th>
            <th>Ref(s) #</th>
            <th>Balance</th>
            <th>Invoice # & type</th>
            <th>Customer</th>
            <th>Concepts</th>
            <th>Uso CFDI</th>
            <th>Método pago</th>
            <th>Total</th>
            <th>Moneda</th>
            <th>Usuario / Fecha</th>
            <th>Última modificación</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(invoiceTm, index) in tmInvoices.data" :key="`invoice-${index}`" :class="rowClass(invoiceTm)">
            <td>
              <v-btn
                v-if="hasPendingBalance(invoiceTm)"
                variant="text"
                size="small"
                color="blue-lighten-2"
                density="compact"
                @click="showApplyCommission(invoiceTm)"
                >Apply bank commission</v-btn
              >
            </td>
            <td>
              <div v-if="invoiceTm.is_free_format == 1">
                <v-chip size="small" color="primary"> Free format </v-chip>
              </div>
              <div v-if="invoiceTm.is_free_format == 0">
                <v-chip
                  v-for="(service, index) in invoiceTm.services"
                  :key="`service-${index}`"
                  size="small"
                  color="primary"
                >
                  {{ service.referencia?.reference_number }}
                </v-chip>
              </div>
            </td>
            <td>
              <div class="text-xs font-bold">{{ getInvoicePaidStatus(invoiceTm) }}</div>
            </td>
            <td>
              <v-chip size="small" color="primary" @click="viewInvoice(invoiceTm)">
                <v-icon>mdi-eye-outline</v-icon>{{ invoiceTm.is_proforma ? 'Profoma' : 'Invoice' }} #{{ invoiceTm.invoice.invoice_number }}
              </v-chip>
            </td>
            <td>{{ invoiceTm.consignee?.name }}</td>
            <td>
              <div class="grid grid-cols-1 gap-1 overflow-hidden">
                <div
                  v-for="(charge, index) in invoiceTm.invoice_charges"
                  :key="`charge-${index}`"
                  class="text-xs text-nowrap text-ellipsis"
                >
                  {{ charge.charge?.name }} - {{ charge.amount }}
                </div>
              </div>
            </td>
            <td>{{ invoiceTm.uso_cfdi }}</td>
            <td>{{ invoiceTm.metodo_pago }}</td>
            <td>
              <div v-for="(totalCurrency, index) in getCurrenciesTotal(invoiceTm)" :key="`currency-total-${index}`">
                {{ totalCurrency }}
              </div>
            </td>
            <td>{{ invoiceTm.moneda }}</td>
            <td>
              <div>{{ formatDateOnlyString(invoiceTm.created_at) }}</div>
              <div>{{ invoiceTm.creator?.name }}</div>
            </td>
            <td>{{ formatDateString(invoiceTm.updated_at) }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="tmInvoices.current_page"
        :length="tmInvoices.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
    </div>
    <v-dialog v-model="commissionDialog.show" max-width="600">
      <v-card v-if="commissionDialog.invoiceTm">
        <v-card-title>Invoice TM #{{ commissionDialog.invoiceTm?.id }}</v-card-title>
        <v-card-text>
          <div>
            Se aplicará el cargo de comisión bancaria a la factura TM #{{ commissionDialog.invoiceTm?.id }} para el
            cliente
            {{ commissionDialog.invoiceTm?.consignee?.name }}
          </div>
          <div class="font-bold">
            Pending balance: {{ formatToCurrency(pendingBalance(commissionDialog.invoiceTm)) }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="commissionDialog.show = false">Close</v-btn>
          <v-btn color="primary" @click="confirmApplyCommission">Yes apply commission</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
// import { tmInvoices } from '@/utils/data/invoicesData'
import { clientes } from '@/utils/data/clientesData'
import { formatToCurrency } from '@/utils/formatters'
import { currencies } from '@/utils/data/systemData'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const commissionDialog = ref<any>({ invoiceTm: null, show: false })

const filters = ref<any>({
  id: '',
  bankAccount: '',
  amount: '',
  from: '',
  to: '',
  isProforma: null,
  referenciaNumber: null,
  masterBl: '',
  houseBl: '',
  consigneeId: '',
  freight_forwarder_id: '',
  invoiceAvailableForBankCommission: null,
  invoiceWithBankCommission: null,
})

const catalogs = ref<any>({})

const tmInvoices = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const yesNoOptions = [
  { name: 'Yes', value: 1 },
  { name: 'No', value: 0 },
]

const rowClass = (invoice: any) => {
  return {
    'bg-red-100! dark:bg-red-900!': invoice.deleted_at,
    'bg-stone-200': invoice.is_proforma === 1,
  }
}

const onClickPagination = async (page: number) => {
  tmInvoices.value.current_page = page
  await getData()
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

const showApplyCommission = (invoiceTm: any) => {
  commissionDialog.value = {
    show: true,
    invoiceTm: invoiceTm,
  }
}

const clearFilters = async () => {
  filters.value = {
    id: '',
    bankAccount: '',
    amount: '',
    from: '',
    to: '',
    isProforma: null,
    referenciaNumber: null,
    masterBl: '',
    houseBl: '',
    consigneeId: '',
    freight_forwarder_id: '',
    invoiceAvailableForBankCommission: null,
    invoiceWithBankCommission: null,
  }
  await getData()
}

const hasPendingBalance = (invoiceTm: any) => {
  return parseFloat(invoiceTm.invoice?.pending_balance) > 0 && parseFloat(invoiceTm.invoice?.pending_balance) < 50
}

const getInvoicePaidStatus = (invoiceTm: any) => {
  if (invoiceTm.deleted_at) {
    return 'Cancelled'
  }
  if (!invoiceTm.invoice) {
    return 'Pending'
  }
  if (invoiceTm.invoice?.is_paid) {
    return 'Paid @ ' + formatDateOnlyString(invoiceTm.invoice.paid_at)
  }
  return `Pending ${formatToCurrency(pendingBalance(invoiceTm))}`
}

const pendingBalance = (invoiceTm: any) => {
  if (!invoiceTm.invoice) {
    return 0
  }
  // in invoiceTm.invoice_charges sum amount + amount_iva minus amount_paid
  const pendingAmount = invoiceTm.invoice_charges.reduce((acc: number, charge: any) => {
    return acc + (parseFloat(charge.amount) + parseFloat(charge.amount_iva)) - parseFloat(charge.amount_paid)
  }, 0)

  return pendingAmount
}

const confirmApplyCommission = async () => {
  try {
    loadingStore.loading = true
    await $api.tmInvoices.applyBankCommission(commissionDialog.value.invoiceTm.id)

    snackbar.add({ type: 'success', text: 'Bank commission applied' })
    await getData()

    commissionDialog.value.show = false
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error applying bank commission' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.tmInvoices.getCommissionsPaged({
      query: {
        page: tmInvoices.value.current_page,
        perPage: tmInvoices.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })) as any

    tmInvoices.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const viewInvoice = (invoice: any) => {
  router.push(`/invoices/search/tm-view-${invoice.id}`)
}
</script>
