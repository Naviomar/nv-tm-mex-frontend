<template>
  <div>
    <div @keyup.enter="onClickFilters">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-5 gap-5">
        <div><v-text-field v-model="filters.from" density="compact" type="date" label="Date from" /></div>
        <div><v-text-field v-model="filters.to" density="compact" type="date" label="Date to" /></div>
        <div>
          <v-autocomplete
            v-model="filters.serviceType"
            :items="[
              { id: 'all', value: 'All' },
              { id: 'sea', value: 'Maritime' },
              { id: 'air', value: 'Air' },
            ]"
            item-title="value"
            item-value="id"
            density="compact"
            label="Service type"
            @update:model-value="onServiceTypeChange"
          />
        </div>
        <div>
          <v-autocomplete
            v-model="filters.isProforma"
            :items="[
              { id: 1, value: 'Proforma' },
              { id: 0, value: 'Invoice' },
            ]"
            item-title="value"
            item-value="id"
            density="compact"
            label="Invoice type"
            clearable
          />
        </div>
        <div>
          <v-autocomplete
            v-model="filters.year"
            :items="prefixYears"
            density="compact"
            label="Year"
            @keyup.enter="getData"
          />
        </div>
        <div>
          <v-text-field
            v-model="filters.referencia"
            density="compact"
            label="Add reference #"
            hint="Separate multiple references with commas"
            @keyup.enter="addReferencia"
          >
            <template #append-inner>
              <v-btn
                v-if="filters.referencia"
                icon="mdi-plus"
                size="x-small"
                variant="text"
                color="primary"
                @click="addReferencia"
                title="Add reference to filter"
              />
            </template>
          </v-text-field>
        </div>
        <div>
          <AGlobalSearch
            v-model="filters.consigneeId"
            :onSearch="searchCustomers"
            validate-key="consigneeId"
            label="Customer"
          />
        </div>
        <div>
          <v-text-field v-model="filters.masterDocument" density="compact" type="text" label="Master BL / Master AWB" />
        </div>
        <div class="">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            @keyup.enter="getData"
            hide-details
          />
        </div>
        <div class="">
          <v-autocomplete
            density="compact"
            label="Payment status"
            v-model="filters.paymentStatus"
            :items="[
              { value: 'paid', name: 'Paid' },
              { value: 'parcial', name: 'Partial paid' },
              { value: 'pending', name: 'Pending' },
            ]"
            item-title="name"
            item-value="value"
            @keyup.enter="getData"
            hide-details
          />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="">
          <div class="font-bold text-base">Invoice number multiline</div>
          <v-textarea
            v-model="filters.multipleid"
            density="compact"
            label="Multiline invoice number"
            placeholder="Enter invoice number by line"
            rows="3"
            hide-details
          />
          <v-btn @click="addFolio" size="small" color="primary">
            <div class="flex gap-2">
              <v-icon>mdi-plus</v-icon>
              <div>Add to filters</div>
            </div>
          </v-btn>
        </div>
        <div class="col-span-4">
          <div v-if="filters.ids.length > 0" class="flex gap-2 px-2">Searching invoices #</div>
          <div class="flex gap-2 px-2">
            <v-chip
              v-for="(folio, index) in filters.ids"
              size="small"
              color="green"
              :key="`folio-${index}`"
              @click="removeFolio(index)"
            >
              {{ folio }}
              <v-icon>mdi-close</v-icon>
            </v-chip>
          </div>
        </div>
      </div>

      <div v-if="filters.referencias.length > 0" class="mb-4">
        <div>Filter by reference(s)</div>
        <div class="flex gap-2">
          <v-chip
            v-for="(ref, index) in filters.referencias"
            :key="`ref-search-${ref}`"
            closable
            @click:close="removeReferencia(index)"
          >
            {{ ref }}
          </v-chip>
        </div>
      </div>

      <div class="flex gap-4">
        <v-btn color="amber" size="small" @click="exportToExcel">Export to Excel</v-btn>
        <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
      </div>
    </div>
    <div>
      <v-pagination
        v-model="wmInvoices.current_page"
        :length="wmInvoices.last_page"
        rounded="circle"
        @update:model-value="onClickPagination"
        density="compact"
      ></v-pagination>
      <div class="text-xs">
        Showing {{ wmInvoices.from }} to {{ wmInvoices.to }} from {{ wmInvoices.total }} total records
      </div>
      <v-table density="compact" fixed-header height="75vh">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Service type</th>
            <th>Invoice #</th>
            <th>Services</th>
            <th>Status</th>
            <th>Inv. type</th>
            <th>Credit Notes</th>
            <th>Customer</th>
            <th>Concepts</th>
            <th>Total</th>
            <th>Currency</th>
            <th>Usuario / Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(invoiceWm, index) in wmInvoices.data" :key="`invoice-${index}`" :class="rowClass(invoiceWm)">
            <td>
              <div class="flex flex-col items-center gap-2">
                <ViewButton :item="invoiceWm" @click="viewInvoice(invoiceWm)" />
                <PreviewTmInvoice :service="invoiceWm.service_type || 'sea'" :invoice="invoiceWm" size="small" />
              </div>
            </td>
            <td>
              <v-chip size="small" :color="invoiceWm.service_type === 'air' ? 'blue' : 'cyan'">
                {{ invoiceWm.service_type === 'air' ? 'Air' : 'Maritime' }}
              </v-chip>
            </td>

            <td>
              <v-chip size="small" color="primary"> #{{ invoiceWm.invoice.invoice_number }} </v-chip>
            </td>
            <td>
              <div v-if="invoiceWm.is_free_format == 1">
                <v-chip size="small" color="primary"> Free format </v-chip>
              </div>
              <div v-if="invoiceWm.is_free_format == 0">
                <v-chip
                  v-for="(service, index) in invoiceWm.services"
                  :key="`service-${index}`"
                  size="small"
                  color="primary"
                  @click="viewService(service)"
                >
                  {{ service.referencia?.reference_number }}
                  {{ service.air_reference?.reference_number }}
                </v-chip>
              </div>
            </td>
            <td>
              <v-chip :color="getInvoiceStatusColor(invoiceWm)" size="small">
                {{ getInvoicePaidStatus(invoiceWm) }}
              </v-chip>
            </td>
            <td>
              <v-chip size="small" :color="invoiceWm.is_proforma ? 'amber' : 'primary'">
                {{ invoiceWm.is_proforma ? 'Profoma' : 'Invoice' }}
              </v-chip>
              <div v-if="invoiceWm.from_deleted_invoice != null">
                <v-chip size="small" color="red"
                  >Linked to deleted invoice #{{ invoiceWm.from_deleted_invoice }}</v-chip
                >
              </div>
            </td>
            <td>
              <div
                v-if="invoiceWm.invoice?.credit_notes?.length > 0"
                class="flex flex-col gap-1 items-center justify-center"
              >
                <v-chip
                  v-for="(creditNote, index) in invoiceWm.invoice?.credit_notes"
                  size="small"
                  color="red"
                  :key="`ccn-${index}`"
                  @click="viewCreditNote(creditNote)"
                >
                  <div class="flex gap-1"><v-icon>mdi-eye-outline</v-icon> CN #{{ creditNote.id }}</div>
                </v-chip>
              </div>
            </td>
            <td class="whitespace-nowrap">{{ invoiceWm.consignee?.name }}</td>
            <td>
              <div class="grid grid-cols-1 gap-1 overflow-hidden">
                <div
                  v-for="(charge, index) in invoiceWm.invoice_charges"
                  :key="`charge-${index}`"
                  class="text-xs text-nowrap text-ellipsis"
                >
                  {{ charge.charge?.name }} - {{ charge.amount }}
                </div>
              </div>
            </td>
            <td class="whitespace-nowrap">
              <div v-for="(totalCurrency, index) in getCurrenciesTotal(invoiceWm)" :key="`currency-total-${index}`">
                {{ totalCurrency }}
              </div>
            </td>
            <td>{{ getCurrencyName(invoiceWm.invoice?.currency_id) }}</td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="invoiceWm">
                <div>{{ formatDateString(invoiceWm.created_at) }}</div>
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="wmInvoices.current_page"
        :length="wmInvoices.last_page"
        rounded="circle"
        @update:model-value="onClickPagination"
        density="compact"
      ></v-pagination>
    </div>
  </div>
</template>
<script setup lang="ts">
import { prefixYears } from '~/utils/date'
import { deletedStatus } from '@/utils/data/systemData'
import { formatToCurrency } from '@/utils/formatters'
import { currencies } from '@/utils/data/systemData'
import { useTableFilters } from '~/composables/useTableFilters'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

// Initial filter values
const initialFilters = {
  from: '',
  to: '',
  referencia: '',
  referencias: [] as string[],
  isProforma: null as number | null,
  multipleid: null as string | null,
  ids: [] as string[],
  masterDocument: '',
  houseBl: '',
  consigneeId: '',
  freight_forwarder_id: '',
  deleted_status: '',
  paymentStatus: null as string | null,
  serviceType: 'all' as string,
  year: '',
  masterBl: '',
  masterAwb: '',
}

// Use the table filters composable for URL persistence
const {
  filters,
  currentPage,
  syncToUrl,
  resetFilters: resetFiltersComposable,
  getFilteredUrl,
} = useTableFilters(initialFilters, {
  storageKey: 'invoices-wm-filters',
  arrayFields: ['referencias', 'ids'],
})

const wmInvoices = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

// Expose backUrl for child components
const backUrl = computed(() => getFilteredUrl('/invoices/search/sea-import-wm'))
provide('catalogBackUrl', backUrl)

const catalogs = ref<any>({
  consignees: [],
  freightForwarders: [],
})

const rowClass = (invoice: any) => {
  if (invoice.deleted_at) {
    return 'bg-red-100! dark:bg-red-900!'
  }
  if (invoice.is_proforma === 1) {
    return 'bg-stone-200'
  }
  return ''
}

const addFolio = () => {
  let ids = filters.value.multipleid?.split('\n').map((bl: string) => bl.trim())
  // remove empty
  ids = ids?.filter((bl: string) => bl.length > 0)
  filters.value.ids = [...filters.value.ids, ...(ids || [])]
  // unique
  filters.value.ids = Array.from(new Set(filters.value.ids))
  filters.value.multipleid = ''
}

const removeFolio = (index: number) => {
  filters.value.ids.splice(index, 1)
}

const viewServiceTmp = (service: any) => {
  if (service.referencia?.impoExpo === 'I') {
    router.push(`/invoices/search/sea-import/view-${service.referencia.id}`)
  }
  if (service.referencia?.impoExpo === 'E') {
    router.push(`/invoices/search/sea-export/view-${service.referencia.id}`)
  }
}

const viewService = (service: any, serviceType: string) => {
  if (serviceType === 'air' && service.air_reference?.impoExpo === 'I')
    router.push(`/invoices/search/air-import/view-${service.air_reference?.id}`)

  if (serviceType === 'air' && service.air_reference?.impoExpo === 'E')
    router.push(`/invoices/search/air-export/view-${service.air_reference?.id}`)

  if (service.referencia?.impoExpo === 'I') router.push(`/invoices/search/sea-import/view-${service.referencia.id}`)

  if (service.referencia?.impoExpo === 'E') router.push(`/invoices/search/sea-export/view-${service.referencia.id}`)
}

const viewCreditNote = (creditNote: any) => {
  router.push(`/invoices/search/credit-notes/view-${creditNote.id}`)
}

const onClickFilters = async () => {
  addReferencia()
  currentPage.value = 1
  wmInvoices.value.current_page = 1
  await syncToUrl()
  await getData()
}

async function onServiceTypeChange() {
  currentPage.value = 1
  wmInvoices.value.current_page = 1
  await syncToUrl()
  await getData()
}

const onClickPagination = async (page: number) => {
  currentPage.value = page
  wmInvoices.value.current_page = page
  await syncToUrl()
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

const clearFilters = async () => {
  await resetFiltersComposable()
  wmInvoices.value.current_page = 1
  await getData()
}

const addReferencia = () => {
  if (filters.value.referencia) {
    // split by comma and remove empty spaces
    filters.value.referencia = filters.value.referencia.replace(/\s/g, '')
    const refs = Array.from(new Set(filters.value.referencia.split(','))).filter((ref) => ref !== '')
    // remove duplicates in refs array using set

    refs.forEach((ref) => {
      filters.value.referencias.push(ref)
    })
    filters.value.referencias = [...new Set(filters.value.referencias)]
    filters.value.referencia = ''
    syncToUrl()
  }
}
const removeReferencia = (index: number) => {
  filters.value.referencias.splice(index, 1)
  syncToUrl()
}

const getServiceReferenceNumber = (service: any, serviceType: string) => {
  if (serviceType === 'air') {
    return service.air_reference?.reference_number
  }
  return service.referencia?.reference_number
}

const getInvoicePaidStatus = (invoiceWm: any) => {
  if (invoiceWm.deleted_at) {
    return 'Cancelled'
  }
  if (!invoiceWm.invoice) {
    return 'Pending'
  }
  if (invoiceWm.invoice?.is_paid) {
    return 'Paid @ ' + formatDateOnlyString(invoiceWm.invoice.paid_at)
  }
  return checkParcialPaid(invoiceWm)
}

const getInvoiceStatusColor = (invoiceWm: any) => {
  if (invoiceWm.deleted_at) {
    return 'red' // Cancelled invoices
  }
  if (!invoiceWm.invoice) {
    return 'purple' // Pending invoice
  }
  if (invoiceWm.invoice?.is_paid) {
    return 'green' // Fully paid
  }
  if (checkParcialPaid(invoiceWm) === 'Partial paid') {
    return 'amber' // Partial payments
  }
  if (checkParcialPaid(invoiceWm) === 'Pending payment') {
    return 'red' // Partial payments
  }
  return 'purple' // Default for pending payments
}

const checkParcialPaid = (invoiceWm: any) => {
  // get invoiceWm.invoice.charges.amount_paid and compare with invoiceWm.invoice.total
  if (invoiceWm.invoice?.charges) {
    const totalPaid = invoiceWm.invoice.charges.reduce((acc: number, charge: any) => {
      return acc + parseFloat(charge.amount_paid)
    }, 0)
    if (totalPaid === invoiceWm.invoice.total) {
      return 'Paid @ ' + formatDateOnlyString(invoiceWm.invoice.paid_at)
    }
    if (totalPaid > 0) {
      return 'Partial paid'
    }
  }
  return 'Pending payment'
}

const searchCustomers = async (search: any) => {
  try {
    const response = await $api.consignees.searchConsignees({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching customers',
    })
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = await $api.wmInvoices.getFilterCatalogs()

    catalogs.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const exportToExcel = async () => {
  try {
    loadingStore.start()

    const response = (await $api.wmInvoices.exportInvoicesToExcel({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })) as any

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `export-invoices-wm-${Date.now()}.xlsx`
    link.click()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const apiFilters = prepareFiltersForApi()

    const response = (await $api.wmInvoices.getUnifiedPaged({
      query: {
        page: currentPage.value,
        perPage: wmInvoices.value.perPage,
        ...flattenArraysToCommaSeparatedString(apiFilters),
      },
    })) as any

    wmInvoices.value = response
    wmInvoices.value.current_page = currentPage.value

    if (response.data.length === 0) {
      snackbar.add({
        type: 'info',
        text: 'No data found',
      })
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

function prepareFiltersForApi() {
  const apiFilters = { ...filters.value }

  if (filters.value.masterDocument) {
    apiFilters.masterBl = filters.value.masterDocument
    apiFilters.masterAwb = filters.value.masterDocument
  }

  // delete apiFilters.masterDocument

  return apiFilters
}

onMounted(() => {
  wmInvoices.value.current_page = currentPage.value
  getData()
  getCatalogs()
})

const viewInvoice = (invoice: any) => {
  router.push(`/invoices/search/wm-view-${invoice.id}`)
}
</script>
