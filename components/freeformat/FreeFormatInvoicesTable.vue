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
        v-model="unifiedData.current_page"
        :length="unifiedData.last_page"
        rounded="circle"
        @update:model-value="onClickPagination"
        density="compact"
      />
      <div class="text-xs mb-1">
        Showing {{ unifiedData.from ?? 1 }} to {{ unifiedData.to ?? unifiedData.data?.length }} of {{ unifiedData.total ?? unifiedData.data?.length }} records
      </div>
      <v-table density="compact" fixed-header height="75vh">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Tipo</th>
            <th>Folio</th>
            <th>Party</th>
            <th>Nombre Party</th>
            <th>Total / Monto</th>
            <th>Inv. Type</th>
            <th>Conceptos</th>
            <th>Relacionado</th>
            <th>Status</th>
            <th>Creado</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in unifiedData.data"
            :key="`unified-${index}`"
            :class="rowClass(row)"
          >
            <!-- ── Invoice row ───────────── -->
            <template v-if="row._record_type === 'invoice'">
              <td>
                <div class="flex flex-col items-center gap-1">
                  <ViewButton :item="row" @click="viewInvoice(row)" />
                  <PreviewPartyInvoice :invoice="row" size="small" />
                </div>
              </td>
              <td><v-chip size="x-small" color="blue-darken-2">Factura</v-chip></td>
              <td>
                <v-chip size="small" color="primary" class="cursor-pointer">
                  {{ row.is_proforma == 1 ? 'Proforma' : 'Invoice' }} #{{ row?.invoice?.invoice_number }}
                </v-chip>
              </td>
              <td>{{ getPartyableType(row.partyable_type) }}</td>
              <td class="whitespace-nowrap">{{ row.partyable?.name }}</td>
              <td class="whitespace-nowrap">
                <div v-for="(t, i) in getCurrenciesTotal(row)" :key="`ct-${i}`">{{ t }}</div>
              </td>
              <td>{{ row.inv_type?.toUpperCase() }}</td>
              <td>
                <div class="grid gap-1 overflow-y-auto max-h-28 my-1">
                  <div v-for="(c, i) in row.invoice_charges" :key="`ic-${i}`" class="text-xs text-nowrap text-ellipsis">
                    {{ c.charge?.name }} - {{ c.amount }}
                  </div>
                </div>
              </td>
              <td>
                <div class="flex flex-col gap-1">
                  <v-chip v-for="(cn, i) in row.credit_notes" :key="`cn-${i}`" size="x-small" color="purple">
                    CN #{{ cn.id }}
                  </v-chip>
                </div>
              </td>
              <td><div class="text-xs">{{ getInvoicePaidStatus(row) }}</div></td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="row">{{ formatDateString(row.created_at) }}</UserInfoBadge>
              </td>
            </template>

            <!-- ── Credit Note row ────────── -->
            <template v-else-if="row._record_type === 'credit_note'">
              <td>
                <div class="flex flex-col items-center gap-1">
                  <ViewButton :item="row" @click="viewInvoice(row.party_invoice)" />
                </div>
              </td>
              <td><v-chip size="x-small" color="purple">NC</v-chip></td>
              <td><v-chip size="small" color="purple">CN #{{ row.id }}</v-chip></td>
              <td>{{ getPartyableType(row.party_invoice?.partyable_type) }}</td>
              <td class="whitespace-nowrap">{{ row.party_invoice?.partyable?.name }}</td>
              <td class="whitespace-nowrap font-bold">
                {{ getCurrencyName(row.currency_id) }} {{ formatToCurrency(row.amount_total) }}
              </td>
              <td>{{ row.inv_type?.toUpperCase() }}</td>
              <td>
                <div class="grid gap-1 overflow-y-auto max-h-28 my-1">
                  <div v-for="(c, i) in row.charges" :key="`cnc-${i}`" class="text-xs text-nowrap text-ellipsis">
                    {{ c.charge?.name }} - {{ formatToCurrency(c.amount) }}
                  </div>
                </div>
              </td>
              <td>
                <v-chip size="x-small" color="primary" class="cursor-pointer" @click="viewInvoice(row.party_invoice)">
                  Invoice #{{ row.party_invoice?.invoice?.invoice_number }}
                </v-chip>
              </td>
              <td><div class="text-xs">{{ row.deleted_at ? 'Cancelado' : 'Activo' }}</div></td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="row">{{ formatDateString(row.created_at) }}</UserInfoBadge>
              </td>
            </template>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="unifiedData.current_page"
        :length="unifiedData.last_page"
        rounded="circle"
        @update:model-value="onClickPagination"
        density="compact"
      />
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

const filters = ref<any>({
  from: '',
  to: '',
  invoice_number: '',
  inv_type: '',
  partyable_type: '',
  partyable_id: '',
  deleted_status: '',
})

const unifiedData = ref<any>({
  data: [] as any[],
  current_page: 1,
  perPage: 50,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0,
})

const invoiceTypes = [
  { name: 'TM', value: 'tm' },
  { name: 'WM', value: 'wm' },
  { name: 'NC', value: 'nc' },
]

const rowClass = (row: any) => {
  if (row.deleted_at)        return 'bg-red-100! dark:bg-red-900!'
  if (row.is_proforma === 1) return 'bg-stone-200'
  return ''
}

const getCurrencyName = (currencyId: number) => {
  return currencies.find((c) => c.id === currencyId)?.name || ''
}

const getCurrenciesTotal = (invoice: any) => {
  if (!invoice.invoice_total) return []
  return Object.keys(invoice.invoice_total).map((currency_id: any) => {
    const currency = currencies.find((c) => c.id == currency_id)
    return `${currency?.name}: ${formatToCurrency(invoice.invoice_total[currency_id])}`
  })
}

const getPartyableType = (partyableType: string) => {
  const map: Record<string, string> = {
    'App\\Models\\Mexico\\Consignee':   'Customer',
    'App\\Models\\Mexico\\Supplier':    'Supplier',
    'App\\Models\\Mexico\\Line':        'Freight line',
    'App\\Models\\Mexico\\CustomAgent': 'Custom agent',
  }
  return map[partyableType] ?? partyableType
}

const clearPartyableId = () => { filters.value.partyable_id = '' }

const getInvoicePaidStatus = (row: any) => {
  if (row.deleted_at)        return 'Cancelled'
  if (!row.invoice)          return 'Pending'
  if (row.invoice?.is_paid)  return 'Paid @ ' + formatDateOnlyString(row.invoice.paid_at)
  return 'Pending'
}

const searchCustomers = async (search: any) => {
  try   { return await $api.consignees.searchConsignees({ query: search }) }
  catch { snackbar.add({ type: 'error', text: 'Error fetching customers' }) }
}

const searchSuppliers = async (params: any) => {
  try   { return await $api.suppliers.searchSuppliers({ query: params }) }
  catch { snackbar.add({ type: 'error', text: 'Error fetching suppliers' }) }
}

const getData = async () => {
  loadingStore.loading = true
  try {
    const q = flattenArraysToCommaSeparatedString({ ...filters.value })
    const resp = (await $api.freeFormatInvoices.getUnifiedPaged({
      query: { page: unifiedData.value.current_page, perPage: unifiedData.value.perPage, ...q },
    })) as any
    unifiedData.value = resp
    unifiedData.value.current_page = resp.current_page ?? 1
    if (!resp.data?.length) {
      snackbar.add({ type: 'info', text: 'No data found' })
    }
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading data: ' + (e?.message ?? e) })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const onClickFilters = async () => {
  unifiedData.value.current_page = 1
  await getData()
}

const onClickPagination = async (page: number) => {
  unifiedData.value.current_page = page
  await getData()
}

const clearFilters = async () => {
  filters.value = { from: '', to: '', invoice_number: '', inv_type: '', partyable_type: '', partyable_id: '', deleted_status: '' }
  unifiedData.value.current_page = 1
  await getData()
}

await getData()

const viewInvoice = (invoice: any) => {
  if (!invoice?.id) { snackbar.add({ type: 'warning', text: 'Invoice not found' }); return }
  router.push(`/invoices/search/free-format/view-${invoice.id}`)
}

const exportToExcel = async () => {
  try {
    loadingStore.start()
    const today   = new Date()
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    const q       = flattenArraysToCommaSeparatedString({ ...filters.value })
    const resp    = (await $api.freeFormatInvoices.exportUnified({ query: q })) as any
    const blob    = new Blob([resp], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link    = document.createElement('a')
    link.href     = window.URL.createObjectURL(blob)
    link.download = `export-free-format-unified-${dateStr}.xlsx`
    link.click()
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error exporting: ' + (e?.message ?? e) })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}
</script>
