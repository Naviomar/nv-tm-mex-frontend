<template>
  <div>
    <div @keyup.enter="onClickFilters">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div><v-text-field v-model="filters.from" density="compact" type="date" label="Date from" /></div>
        <div><v-text-field v-model="filters.to" density="compact" type="date" label="Date to" /></div>
        <div>
          <v-autocomplete
            density="compact"
            label="Party"
            v-model="filters.partyable_type"
            :items="partyables"
            item-title="name"
            item-value="value"
            hide-details
            @update:model-value="clearPartyableId"
          />
        </div>
        <div>
          <div v-if="filters.partyable_type === 'App\\Models\\Mexico\\Consignee'">
            <AGlobalSearch
              :onSearch="searchCustomers"
              v-model="filters.partyable_id"
              validate-key="partyable_id"
              label="Customer *"
            />
          </div>
          <div v-if="filters.partyable_type === 'App\\Models\\Mexico\\Supplier'">
            <AGlobalSearch
              :onSearch="searchSuppliers"
              v-model="filters.partyable_id"
              validate-key="partyable_id"
              label="Supplier *"
            />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <v-text-field
            v-model="filters.invoice_number"
            density="compact"
            type="text"
            label="Invoice number"
            @keyup.enter="getData"
          />
        </div>

        <div>
          <v-autocomplete
            density="compact"
            label="Invoice type"
            v-model="filters.inv_type"
            :items="invoiceTypes"
            item-title="name"
            item-value="value"
            @keyup.enter="getData"
            hide-details
          />
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
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4"></div>
      <div class="flex gap-4">
        <v-btn color="amber" size="small" @click="exportToExcel">Export to Excel</v-btn>
        <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
      </div>
    </div>
    <div>
      <v-pagination
        v-model="freeFormatInvoices.current_page"
        :length="freeFormatInvoices.last_page"
        rounded="circle"
        @update:model-value="onClickPagination"
        density="compact"
      ></v-pagination>

      <!-- Tabla de Notas de Crédito -->
      <v-table v-if="isSearchingCreditNotes" density="compact" fixed-header height="75vh">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Credit Note #</th>
            <th>Related Invoice</th>
            <th>Party</th>
            <th>Party name</th>
            <th>Amount</th>
            <th>Concepts</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(creditNote, index) in freeFormatInvoices.data" :key="`credit-note-${index}`">
            <td>
              <div class="flex flex-col items-center gap-2">
                <ViewButton :item="creditNote" @click="viewInvoice(creditNote.party_invoice)" />
              </div>
            </td>
            <td>
              <v-chip size="small" color="purple" class="cursor-pointer"> CN #{{ creditNote.id }} </v-chip>
            </td>
            <td>
              <v-chip size="small" color="primary" class="cursor-pointer" @click="viewInvoice(creditNote.party_invoice)">
                Invoice #{{ creditNote.party_invoice?.invoice?.invoice_number }}
              </v-chip>
            </td>
            <td>
              <div>{{ getPartyableType(creditNote.party_invoice?.partyable_type) }}</div>
            </td>
            <td class="whitespace-nowrap">
              <div>{{ creditNote.party_invoice?.partyable?.name }}</div>
            </td>
            <td class="whitespace-nowrap font-bold">
              {{ getCurrencyName(creditNote.currency_id) }} {{ formatToCurrency(creditNote.amount_total) }}
            </td>
            <td>
              <div class="grid grid-cols-1 gap-1 overflow-hidden overflow-y-auto max-h-32 my-2">
                <div
                  v-for="(charge, idx) in creditNote.charges"
                  :key="`cn-charge-${idx}`"
                  class="text-xs text-nowrap text-ellipsis"
                >
                  {{ charge.charge?.name }} - {{ formatToCurrency(charge.amount) }}
                </div>
              </div>
            </td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="creditNote">
                {{ formatDateString(creditNote.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Tabla de Facturas (vista original) -->
      <v-table v-else density="compact" fixed-header height="75vh">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Invoice #</th>
            <th>Total</th>
            <th>Credit notes</th>
            <th>Party</th>
            <th>Party name</th>
            <th>Status</th>
            <th>Inv. type</th>
            <th>Concepts</th>
            <th class="min-w-[300px]">CFDI data</th>

            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(freeFormat, index) in freeFormatInvoices.data"
            :key="`party-invoice-${index}`"
            :class="rowClass(freeFormat)"
          >
            <td>
              <div class="flex flex-col items-center gap-2">
                <ViewButton :item="freeFormat" @click="viewInvoice(freeFormat)" />
                <PreviewPartyInvoice :invoice="freeFormat" size="small" />
              </div>
            </td>
            <td>
              <v-chip size="small" color="primary" class="cursor-pointer">
                {{ freeFormat.is_proforma == 1 ? 'Proforma' : 'Invoice' }} #{{
                  freeFormat?.invoice?.invoice_number
                }}</v-chip
              >
            </td>
            <td class="whitespace-nowrap">
              <div v-for="(totalCurrency, index) in getCurrenciesTotal(freeFormat)" :key="`currency-total-${index}`">
                {{ totalCurrency }}
              </div>
            </td>
            <td>
              <div class="grid grid-cols-1 gap-1 overflow-hidden">
                <v-chip
                  v-for="(creditNote, index) in freeFormat.party_credit_notes"
                  :key="`credit-note-${index}`"
                  class="text-xs text-nowrap text-ellipsis"
                  color="purple"
                  size="small"
                >
                  CN #{{ creditNote.id }}
                </v-chip>
              </div>
            </td>
            <td>
              <div>{{ getPartyableType(freeFormat.partyable_type) }}</div>
            </td>
            <td class="whitespace-nowrap">
              <div>{{ freeFormat.partyable?.name }}</div>
            </td>
            <td>
              <div class="text-xs">{{ getInvoicePaidStatus(freeFormat) }}</div>
            </td>
            <td>{{ freeFormat.inv_type?.toUpperCase() }}</td>
            <td>
              <div class="grid grid-cols-1 gap-1 overflow-hidden overflow-y-auto max-h-32 my-2">
                <div
                  v-for="(charge, index) in freeFormat.invoice_charges"
                  :key="`debit-charge-${index}`"
                  class="text-xs text-nowrap text-ellipsis"
                >
                  {{ charge.charge?.name }} - {{ charge.amount }}
                </div>
                <div
                  v-for="(charge, index) in freeFormat.charges"
                  :key="`credit-charge-${index}`"
                  class="text-xs text-nowrap text-ellipsis"
                >
                  {{ charge.charge?.name }} - {{ charge.amount }}
                </div>
              </div>
            </td>
            <td>
              <div class="grid grid-cols-1 overflow-hidden">
                <div class="text-xs text-nowrap text-ellipsis">Uso CFDI: {{ freeFormat.uso_cfdi }}</div>
                <div class="text-xs text-nowrap text-ellipsis">Forma de pago: {{ freeFormat.forma_pago }}</div>
                <div class="text-xs text-nowrap text-ellipsis">Método de pago: {{ freeFormat.metodo_pago }}</div>
              </div>
            </td>

            <td class="whitespace-nowrap">
              <UserInfoBadge :item="freeFormat">
                {{ formatDateString(freeFormat.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="freeFormatInvoices.current_page"
        :length="freeFormatInvoices.last_page"
        rounded="circle"
        @update:model-value="onClickPagination"
        density="compact"
      ></v-pagination>
    </div>
  </div>
</template>
<script setup lang="ts">
import { partyables } from '@/utils/data/systemData'
import { deletedStatus } from '@/utils/data/systemData'
import { formatToCurrency } from '@/utils/formatters'
import { currencies } from '@/utils/data/systemData'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const pdfViewer = ref<any>(null)

const filters = ref<any>({
  from: '',
  to: '',
  invoice_number: null,
  inv_type: '',
  partyable_type: '',
  partyable_id: '',
  deleted_status: '',
})

const freeFormatInvoices = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

// Variable para rastrear qué tipo de datos tenemos actualmente cargados
const currentDataType = ref<'invoices' | 'credit_notes'>('invoices')

const rowClass = (invoice: any) => {
  if (invoice.deleted_at) {
    return 'bg-red-100! dark:bg-red-900!'
  }
  if (invoice.is_proforma === 1) {
    return 'bg-stone-200'
  }
  return ''
}

const invoiceTypes = [
  { name: 'TM', value: 'tm' },
  { name: 'WM', value: 'wm' },
  { name: 'NC', value: 'nc' },
]

// Usar el tipo de datos cargados, no el filtro seleccionado
const isSearchingCreditNotes = computed(() => currentDataType.value === 'credit_notes')

const getCurrencyName = (currencyId: number) => {
  const currency = currencies.find((c) => c.id === currencyId)
  return currency?.name || ''
}

const onClickFilters = async () => {
  // set current page to 1
  freeFormatInvoices.value.current_page = 1
  await getData()
}

const onClickPagination = async (page: number) => {
  freeFormatInvoices.value.current_page = page
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

const getPartyableType = (partyableType: string) => {
  if (partyableType === 'App\\Models\\Mexico\\Consignee') {
    return 'Customer'
  }
  if (partyableType === 'App\\Models\\Mexico\\Supplier') {
    return 'Supplier'
  }
  if (partyableType === 'App\\Models\\Mexico\\Line') {
    return 'Freight line'
  }
  if (partyableType === 'App\\Models\\Mexico\\CustomAgent') {
    return 'Custom agent'
  }
  return partyableType
}

const clearPartyableId = () => {
  filters.value.partyable_id = null
}

const clearFilters = async () => {
  filters.value = {
    from: '',
    to: '',
    invoice_number: null,
    inv_type: '',
    partyable_type: '',
    partyable_id: '',
    deleted_status: '',
  }
  await getData()
}

const getInvoicePaidStatus = (freeFormat: any) => {
  if (freeFormat.deleted_at) {
    return 'Cancelled'
  }
  if (!freeFormat.invoice) {
    return 'Pending'
  }
  if (freeFormat.invoice?.is_paid) {
    return 'Paid @ ' + formatDateOnlyString(freeFormat.invoice.paid_at)
  }
  return 'Pending'
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

const searchSuppliers = async (params: any) => {
  try {
    const response = await $api.suppliers.searchSuppliers({
      query: params,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching suppliers',
    })
  }
}

const getData = async () => {
  try {
    loadingStore.loading = true

    // Si el filtro es 'nc', buscar notas de crédito directamente
    const searchingCreditNotes = filters.value.inv_type === 'nc'
    const queryFilters = { ...filters.value }

    // Remover inv_type del query si es 'nc' ya que usaremos otro endpoint
    if (searchingCreditNotes) {
      delete queryFilters.inv_type
    }

    const response = searchingCreditNotes
      ? ((await $api.freeFormatInvoices.getCreditNotesPaged({
          query: {
            page: freeFormatInvoices.value.current_page,
            limit: freeFormatInvoices.value.perPage,
            ...flattenArraysToCommaSeparatedString(queryFilters),
          },
        })) as any)
      : ((await $api.freeFormatInvoices.getPaged({
          query: {
            page: freeFormatInvoices.value.current_page,
            perPage: freeFormatInvoices.value.perPage,
            ...flattenArraysToCommaSeparatedString(queryFilters),
          },
        })) as any)

    freeFormatInvoices.value = response
    // Actualizar el tipo de datos cargados
    currentDataType.value = searchingCreditNotes ? 'credit_notes' : 'invoices'

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

await getData()

const viewInvoice = (invoice: any) => {
  if (!invoice?.id) {
    snackbar.add({ type: 'warning', text: 'Invoice not found' })
    return
  }
  router.push(`/invoices/search/free-format/view-${invoice.id}`)
}

const exportToExcel = async () => {
  try {
    loadingStore.start()

    // Si el filtro es 'nc', buscar notas de crédito directamente
    const searchingCreditNotes = filters.value.inv_type === 'nc'
    const queryFiltersNc = { ...filters.value }
    // Remover inv_type del query si es 'nc' ya que usaremos otro endpoint
    if (searchingCreditNotes) {
      delete queryFiltersNc.inv_type
    }

    console.log("queryFilters::",queryFiltersNc)
    console.log("searchingCreditNotes:",searchingCreditNotes);
    if(searchingCreditNotes){
      console.log('Excel NC')
      const response = (await $api.freeFormatInvoices.exportInvoicesToExcelNc({
        query: {
          ...flattenArraysToCommaSeparatedString(queryFiltersNc),
        },
      })) as any

      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const today = new Date();
      const currentDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `export-invoices-tmflnc-${currentDate}.xlsx`
      link.click()
    }else{
      const response = (await $api.freeFormatInvoices.exportInvoicesToExcel({
        query: {
          ...flattenArraysToCommaSeparatedString(queryFiltersNc),
        },
      })) as any

      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const today = new Date();
      const currentDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `export-invoices-tmfl-${currentDate}.xlsx`
      link.click()

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
