<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="flex items-center justify-between mb-2">
        <v-btn
          size="small"
          variant="text"
          :prepend-icon="showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="toggleFilters"
        >
          {{ showFilters ? 'Hide filters' : 'Show filters' }}
        </v-btn>
      </div>
      <v-expand-transition>
        <div v-show="showFilters">
          <FilterLayoutGrid
            :filters="filterLayoutDefs"
            storage-key="filter-layout:invoices-sea-import"
            @hide="onLayoutFilterHidden"
          >
            <template #year>
              <v-autocomplete v-model="filters.year" :items="prefixYears" density="compact" label="Year" hide-details />
            </template>
            <template #referencia>
              <v-text-field
                v-model="filters.referencia"
                density="compact"
                label="Add reference #"
                hint="Separate multiple references with commas"
                @keyup.enter.stop="addReferencia"
              />
            </template>
            <template #masterBl>
              <v-text-field
                v-model="filters.masterBl"
                density="compact"
                label="Master BL"
                hide-details
                @keyup.enter.stop="onClickFilters"
              />
            </template>
            <template #houseBl>
              <v-text-field
                v-model="filters.houseBl"
                density="compact"
                label="House BL"
                hide-details
                @keyup.enter.stop="onClickFilters"
              />
            </template>
            <template #consignee>
              <ACustomerSearch v-model="filters.consignee_id" @keyup.enter.stop="onClickFilters" />
            </template>
            <template #containerNumber>
              <v-text-field
                v-model="filters.containerNumber"
                density="compact"
                label="Container #"
                hide-details
                @keyup.enter.stop="onClickFilters"
              />
            </template>
            <template #bookingNum>
              <v-text-field
                v-model="filters.bookingNum"
                density="compact"
                label="Booking number"
                hide-details
                @keyup.enter.stop="onClickFilters"
              />
            </template>
            <template #hasTmInvoices>
              <v-autocomplete
                v-model="filters.hasTmInvoices"
                density="compact"
                :items="yesNoItems"
                item-title="text"
                item-value="value"
                label="Has TM invoices"
                hide-details
                @keyup.enter.stop="onClickFilters"
              />
            </template>
            <template #hasWmInvoices>
              <v-autocomplete
                v-model="filters.hasWmInvoices"
                density="compact"
                :items="yesNoItems"
                item-title="text"
                item-value="value"
                label="Has WM invoices"
                hide-details
                @keyup.enter.stop="onClickFilters"
              />
            </template>
            <template #status>
              <v-autocomplete
                density="compact"
                label="Status"
                v-model="filters.deleted_status"
                :items="deletedStatus"
                item-title="name"
                item-value="value"
                hide-details
                @keyup.enter.stop="onClickFilters"
              />
            </template>
            <template #billingStatus>
              <v-autocomplete
                v-model="filters.billingStatus"
                density="compact"
                label="Billing status"
                :items="billingStatusItems"
                item-title="name"
                item-value="value"
                clearable
                hide-details
                @keyup.enter.stop="onClickFilters"
              />
            </template>
          </FilterLayoutGrid>
          <div v-if="filters.referencias.length > 0">
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
          <div class="flex gap-4 pt-4">
            <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
            <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
          </div>
        </div>
      </v-expand-transition>
    </div>
    <v-card>
      <v-card-text>
        <EnhancedPagination
          v-model:currentPage="references.current_page"
          v-model:perPage="perPage"
          :total-pages="references.last_page"
          :from="references.from"
          :to="references.to"
          :total="references.total"
          storage-key="invoices-sea-import-pagination"
          @page-change="onPageChange"
          @per-page-change="onPerPageChange"
        />
        <div class="flex justify-end mb-1">
          <TableColumnsMenu :state="columnsLayout" />
        </div>
        <div class="catalog-table-wrapper">
          <v-table density="compact" fixed-header>
            <thead>
              <tr>
                <template v-for="col in visibleColumns" :key="col.key">
                  <th v-if="col.key === 'actions'" class="text-left" width="80">Actions</th>
                  <th v-else-if="col.key === 'reference'" class="text-left"># Reference</th>
                  <th v-else-if="col.key === 'consignee'" class="text-left">Consignee</th>
                  <th v-else-if="col.key === 'masterBls'" class="text-left">Master BL(s)</th>
                  <th v-else-if="col.key === 'houseBls'" class="text-left">House BL(s)</th>
                  <th v-else-if="col.key === 'containers'" class="text-left">Container(s)</th>
                  <th v-else-if="col.key === 'poNum'" class="text-left">PO Number</th>
                  <th v-else-if="col.key === 'arrivalNotification'" class="text-left">Arrival notification</th>
                  <th v-else-if="col.key === 'sellConcepts'" class="text-left">Sell concepts</th>
                  <th v-else-if="col.key === 'tmInvoices'" class="text-left">TM invoice(s)</th>
                  <th v-else-if="col.key === 'wmInvoices'" class="text-left">WM invoices(s)</th>
                  <th v-else-if="col.key === 'date'" class="text-left">Date</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in references.data"
                :key="`reference-${index}`"
                :class="{
                  'dark:hover:bg-gray-700 hover:bg-slate-300': true,
                  'bg-red-100! dark:bg-red-900!': item.deleted_at,
                }"
              >
                <template v-for="col in visibleColumns" :key="col.key">
                  <td v-if="col.key === 'actions'">
                    <div class="flex gap-1">
                      <v-btn
                        variant="text"
                        icon="mdi-eye-outline"
                        color="blue-lighten-2"
                        density="compact"
                        title="View reference"
                        class="cursor-pointer"
                        @click="viewMaritimeReference(item)"
                      ></v-btn>
                      <v-btn
                        v-if="hasPermission('customer-invoices-create')"
                        variant="text"
                        icon="mdi-text-box-plus-outline"
                        color="green"
                        density="compact"
                        title="Create an invoice for this reference"
                        class="cursor-pointer"
                        @click="goToCreateInvoice(item)"
                      ></v-btn>
                    </div>
                  </td>
                  <td v-else-if="col.key === 'reference'" class="whitespace-nowrap">
                    <ServiceNumberLabel :service="item" />
                  </td>
                  <td v-else-if="col.key === 'consignee'" class="min-w-80">{{ item.consignee?.name }}</td>
                  <td v-else-if="col.key === 'masterBls'">
                    <div class="flex flex-col gap-1">
                      <v-chip
                        v-for="(bl, index) in item.master_bls"
                        :key="`master-bl-${index}`"
                        size="small"
                        color="primary"
                      >
                        <v-icon v-if="bl.can_be_delivered != null">{{ getDeliveredIcon(bl) }}</v-icon>
                        {{ bl.name }}
                      </v-chip>
                    </div>
                  </td>
                  <td v-else-if="col.key === 'houseBls'">
                    <div class="flex flex-col gap-1">
                      <v-chip v-for="(bl, index) in item.house_bls" :key="`house-bl-${index}`" size="small" color="primary">
                        <v-icon v-if="bl.can_be_delivered != null">{{ getDeliveredIcon(bl) }}</v-icon>
                        {{ bl.name }}
                      </v-chip>
                    </div>
                  </td>
                  <td v-else-if="col.key === 'containers'">
                    <div class="flex flex-col gap-1">
                      <v-chip
                        v-for="(container, index) in item.containers"
                        :key="`container-${index}`"
                        size="small"
                        color="primary"
                      >
                        {{ container.container_number }}
                      </v-chip>
                    </div>
                  </td>
                  <td v-else-if="col.key === 'poNum'" class="text-wrap max-w-96">{{ item.po_num }}</td>
                  <td v-else-if="col.key === 'arrivalNotification'">
                    <div v-if="item.arrival_notys?.length <= 0">
                      <v-chip size="small" variant="elevated" color="error">Not sent</v-chip>
                    </div>
                    <div v-if="item.arrival_notys?.length > 0" class="flex flex-col gap-1">
                      <v-chip
                        v-for="(noty, index) in item.arrival_notys"
                        :key="`noty-${index}`"
                        size="small"
                        color="blue-darken-2"
                      >
                        #{{ Number(index) + 1 }} -
                        {{ formatDateString(noty.created_at) }}
                      </v-chip>
                    </div>
                  </td>
                  <td v-else-if="col.key === 'sellConcepts'">
                    <div class="sell-concepts-box">
                      <div v-if="hasNoSellConcepts(item)" class="flex justify-center">
                        <v-chip size="small" variant="elevated" color="error">No sell concepts</v-chip>
                      </div>
                      <template v-else>
                        <div class="sell-concepts-summary">
                          <v-chip v-if="sellConceptsSummary(item).pending > 0" size="x-small" color="error" variant="flat" class="font-bold">
                            <v-icon size="12" start>mdi-link-off</v-icon>{{ sellConceptsSummary(item).pending }} pending
                          </v-chip>
                          <v-chip v-if="sellConceptsSummary(item).linked > 0" size="x-small" color="primary" variant="tonal">
                            <v-icon size="12" start>mdi-link</v-icon>{{ sellConceptsSummary(item).linked }} linked
                          </v-chip>
                        </div>
                        <div v-if="item.charges?.length > 0" class="sell-concepts-group sell-concepts-group--local">
                          <div class="sell-concepts-group-title"><v-icon size="12">mdi-file-document-outline</v-icon> Local charges</div>
                          <div class="flex flex-wrap gap-1">
                            <v-chip
                              v-for="(charge, index) in sortPendingFirst(item.charges, isLinkedCharge)"
                              :key="`charge-${index}`"
                              size="small"
                              :color="isLinkedCharge(charge) ? 'primary' : 'error'"
                              :variant="isLinkedCharge(charge) ? 'tonal' : 'flat'"
                            >
                              <v-icon>{{ isLinkedCharge(charge) ? 'mdi-link' : 'mdi-link-off' }}</v-icon> {{ charge.charge?.name }}
                            </v-chip>
                          </div>
                        </div>
                        <div v-if="item.sell_rate_breakdown?.length > 0" class="sell-concepts-group sell-concepts-group--breakdown">
                          <div class="sell-concepts-group-title"><v-icon size="12">mdi-format-list-bulleted</v-icon> Sell breakdown charges</div>
                          <div class="flex flex-wrap gap-1">
                            <v-chip
                              v-for="(charge, index) in sortPendingFirst(item.sell_rate_breakdown, isLinkedSellBreakdown)"
                              :key="`charge-${index}`"
                              size="small"
                              :color="isLinkedSellBreakdown(charge) ? 'primary' : 'error'"
                              :variant="isLinkedSellBreakdown(charge) ? 'tonal' : 'flat'"
                            >
                              <v-icon>{{ isLinkedSellBreakdown(charge) ? 'mdi-link' : 'mdi-link-off' }}</v-icon> {{ charge.charge?.name }}
                            </v-chip>
                          </div>
                        </div>
                        <div v-if="item.demurrage_charges?.length > 0" class="sell-concepts-group sell-concepts-group--demurrage">
                          <div class="sell-concepts-group-title"><v-icon size="12">mdi-clock-alert-outline</v-icon> Demurrage charges</div>
                          <div class="flex flex-wrap gap-1">
                            <v-chip
                              v-for="(demurrageCharge, index) in sortPendingFirst(item.demurrage_charges, isLinkedDemurrage)"
                              :key="`dem-charge-${index}`"
                              size="small"
                              :color="isLinkedDemurrage(demurrageCharge) ? 'primary' : 'error'"
                              :variant="isLinkedDemurrage(demurrageCharge) ? 'tonal' : 'flat'"
                            >
                              <v-icon>{{ isLinkedDemurrage(demurrageCharge) ? 'mdi-link' : 'mdi-link-off' }}</v-icon>
                              {{ demurrageCharge.name }}
                            </v-chip>
                          </div>
                        </div>
                      </template>
                    </div>
                  </td>
                  <td v-else-if="col.key === 'tmInvoices'">
                    <div v-if="item.invoice_tms?.length <= 0">
                      <v-chip size="small" variant="elevated" color="error">No TM invoices</v-chip>
                    </div>
                    <div v-if="item.invoice_tms?.length > 0" class="flex flex-col gap-1">
                      <v-chip
                        v-for="(invoice, index) in item.invoice_tms"
                        :key="`tm-invoice-${index}`"
                        size="small"
                        color="primary"
                      >
                        {{ invoiceType(invoice) }} #{{ invoice.invoice.invoice_number }}
                      </v-chip>
                    </div>
                  </td>
                  <td v-else-if="col.key === 'wmInvoices'">
                    <div v-if="item.invoice_wms?.length <= 0">
                      <v-chip size="small" variant="elevated" color="error">No WM invoices</v-chip>
                    </div>
                    <div v-if="item.invoice_wms?.length > 0" class="flex flex-col gap-1">
                      <v-chip
                        v-for="(invoice, index) in item.invoice_wms"
                        :key="`wm-invoice-${index}`"
                        size="small"
                        color="primary"
                      >
                        #{{ invoice.invoice.invoice_number }} {{ invoiceType(invoice) }}
                      </v-chip>
                    </div>
                  </td>
                  <td v-else-if="col.key === 'date'" class="whitespace-nowrap">
                    <UserInfoBadge :item="item">
                      {{ formatDateString(item.created_at) }}
                    </UserInfoBadge>
                  </td>
                </template>
              </tr>
            </tbody>
          </v-table>
        </div>
        <EnhancedPagination
          v-model:currentPage="references.current_page"
          v-model:perPage="perPage"
          :total-pages="references.last_page"
          :from="references.from"
          :to="references.to"
          :total="references.total"
          storage-key="invoices-sea-import-pagination"
          @page-change="onPageChange"
          @per-page-change="onPerPageChange"
        />
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { prefixYears } from '~/utils/date'
import { deletedStatus } from '@/utils/data/systemData'
import { flattenArraysToCommaSeparatedString } from '~/utils/formatters'
import { useTableFilters } from '~/composables/useTableFilters'

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const { hasPermission } = useCheckUser()

const emits = defineEmits(['view:reference'])

const FILTER_VISIBILITY_KEY = 'invoices-sea-import-filters-visible'
const showFilters = ref(sessionStorage.getItem(FILTER_VISIBILITY_KEY) !== 'false')
const toggleFilters = () => {
  showFilters.value = !showFilters.value
  sessionStorage.setItem(FILTER_VISIBILITY_KEY, String(showFilters.value))
}

const yesNoItems = [
  { text: 'Yes', value: 1 },
  { text: 'No', value: 0 },
]

const billingStatusItems = [
  { name: 'Pendiente de Factura', value: 'pending_invoice' },
  { name: 'Pendiente de Factura Demoras', value: 'pending_demurrage_invoice' },
]

// Registry of every filter available in the search form. The order and spans
// here define the default layout; filters with visible: false are only shown
// when the user adds them from the Layout menu.
const filterLayoutDefs = [
  { key: 'year', label: 'Year', span: 2 },
  { key: 'referencia', label: 'Reference #', span: 2 },
  { key: 'masterBl', label: 'Master BL', span: 2 },
  { key: 'houseBl', label: 'House BL', span: 2 },
  { key: 'consignee', label: 'Consignee', span: 4 },
  { key: 'containerNumber', label: 'Container #', span: 2 },
  { key: 'bookingNum', label: 'Booking number', span: 2 },
  { key: 'hasTmInvoices', label: 'Has TM invoices', span: 3 },
  { key: 'hasWmInvoices', label: 'Has WM invoices', span: 3 },
  { key: 'status', label: 'Status', span: 2 },
  { key: 'billingStatus', label: 'Billing status', span: 3 },
]

// Model keys backing each layout filter, used to clear values when the user
// hides a filter so hidden filters never affect the search.
const filterModelKeys: Record<string, string[]> = {
  year: ['year'],
  referencia: ['referencia', 'referencias'],
  masterBl: ['masterBl'],
  houseBl: ['houseBl'],
  consignee: ['consignee_id'],
  containerNumber: ['containerNumber'],
  bookingNum: ['bookingNum'],
  hasTmInvoices: ['hasTmInvoices'],
  hasWmInvoices: ['hasWmInvoices'],
  status: ['deleted_status'],
  billingStatus: ['billingStatus'],
}

const onLayoutFilterHidden = (key: string) => {
  const modelKeys = filterModelKeys[key] || []
  modelKeys.forEach((modelKey) => {
    const initialValue = (initialFilters as any)[modelKey]
    ;(filters.value as any)[modelKey] = Array.isArray(initialValue) ? [...initialValue] : initialValue
  })
  syncToUrl()
}

// Registry of the table columns. Locked columns (Actions, # Reference) cannot
// be hidden nor reordered; the rest can be managed from the Columns menu.
const tableColumnDefs = [
  { key: 'actions', label: 'Actions', locked: true },
  { key: 'reference', label: '# Reference', locked: true },
  { key: 'consignee', label: 'Consignee' },
  { key: 'masterBls', label: 'Master BL(s)' },
  { key: 'houseBls', label: 'House BL(s)' },
  { key: 'containers', label: 'Container(s)' },
  { key: 'poNum', label: 'PO Number' },
  { key: 'arrivalNotification', label: 'Arrival notification' },
  { key: 'sellConcepts', label: 'Sell concepts' },
  { key: 'tmInvoices', label: 'TM invoice(s)' },
  { key: 'wmInvoices', label: 'WM invoices(s)' },
  { key: 'date', label: 'Date' },
]

const columnsLayout = useTableColumns('table-columns:invoices-sea-import', tableColumnDefs)
const { visibleColumns } = columnsLayout

const initialFilters = {
  year: '',
  referencia: '',
  referencias: [] as string[],
  masterBl: '',
  houseBl: '',
  consignee_id: '',
  hasTmInvoices: null as number | null,
  hasWmInvoices: null as number | null,
  containerNumber: '',
  bookingNum: '',
  deleted_status: '',
  billingStatus: null as string | null,
}

const {
  filters,
  currentPage,
  perPage,
  syncToUrl,
  resetFilters: resetFiltersComposable,
} = useTableFilters(initialFilters, {
  storageKey: 'invoices-sea-import-filters',
  arrayFields: ['referencias'],
  enablePerPage: true,
  defaultPerPage: 10,
})

const references = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  last_page: 1,
  from: 1,
  to: 1,
  total: 1,
})

const hasNoSellConcepts = (item: any) => {
  return (
    (item.charges?.length ?? 0) <= 0 &&
    (item.sell_rate_breakdown?.length ?? 0) <= 0 &&
    (item.demurrage_charges?.length ?? 0) <= 0
  )
}

const isLinkedCharge = (charge: any) => !!charge.invoice_charge
const isLinkedSellBreakdown = (charge: any) => !!(charge.invoice_charge || charge.absorbed_invoice_id)
const isLinkedDemurrage = (charge: any) => !!charge.invoice_charge

// Pending (unlinked) concepts surface first so they draw the eye before the
// ones already tied to an invoice.
const sortPendingFirst = (list: any[], isLinked: (item: any) => boolean) => {
  return [...(list || [])].sort((a, b) => Number(isLinked(a)) - Number(isLinked(b)))
}

const sellConceptsSummary = (item: any) => {
  const linkFlags = [
    ...(item.charges || []).map(isLinkedCharge),
    ...(item.sell_rate_breakdown || []).map(isLinkedSellBreakdown),
    ...(item.demurrage_charges || []).map(isLinkedDemurrage),
  ]
  return {
    pending: linkFlags.filter((linked) => !linked).length,
    linked: linkFlags.filter(Boolean).length,
  }
}

const getDeliveredIcon = (item: any) => {
  return item.can_be_delivered === 1 ? 'mdi-check' : 'mdi-close'
}

const addReferencia = () => {
  if (filters.value.referencia) {
    filters.value.referencia = filters.value.referencia.replace(/\s/g, '')
    const refs = Array.from(new Set(filters.value.referencia.split(','))).filter((ref) => ref !== '')

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

const onClickFilters = async () => {
  addReferencia()
  currentPage.value = 1
  references.value.current_page = 1
  await syncToUrl()
  await getSeaImportReferences()
}

const onPageChange = async (page: number) => {
  currentPage.value = page
  references.value.current_page = page
  await syncToUrl()
  await getSeaImportReferences()
}

const onPerPageChange = async (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  references.value.current_page = 1
  await syncToUrl()
  await getSeaImportReferences()
}

const getSeaImportReferences = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.invoices.getSeaImportReferencias({
      query: {
        page: currentPage.value,
        limit: perPage.value,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    references.value = response as any
    references.value.current_page = currentPage.value
  } catch (e) {
    console.error(e)
  } finally {
    loadingStore.stop()
  }
}

const invoiceType = (invoice: any) => {
  if (invoice.is_proforma == 1) {
    return 'Proforma'
  }
  if (hasInvoiceChargeableDemurrages(invoice)) {
    return 'Demurrage Invoice'
  }
  return 'TM Invoice'
}

const hasInvoiceChargeableDemurrages = (invoiceTm: any) => {
  return invoiceTm.invoice.charges.some((charge: any) => charge.chargeable_type.includes('DemurrageCharge'))
}

const clearFilters = async () => {
  await resetFiltersComposable()
  references.value.current_page = 1
  await getSeaImportReferences()
}

const viewMaritimeReference = (item: any) => {
  emits('view:reference', item)
}

const goToCreateInvoice = (item: any) => {
  const serviceSearch = `${item.impoExpo}M`
  navigateTo(
    `/invoices/capture/consignee/by-service?service=${serviceSearch}&year=${item.reference_year}&service_number=${item.consecutive}`,
    {
      open: {
        target: '_blank',
      },
    }
  )
}

onMounted(() => {
  references.value.current_page = currentPage.value
  getSeaImportReferences()
})
</script>

<style scoped>
.sell-concepts-box {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 6px;
  padding: 6px 8px;
  margin: 8px 0;
  background: rgba(var(--v-theme-on-surface), 0.02);
  min-width: 220px;
}

.sell-concepts-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.sell-concepts-group {
  border-left: 3px solid rgba(var(--v-theme-on-surface), 0.15);
  padding-left: 6px;
  margin-bottom: 6px;
}

.sell-concepts-group:last-child {
  margin-bottom: 0;
}

.sell-concepts-group--local {
  border-left-color: rgb(var(--v-theme-info));
}

.sell-concepts-group--breakdown {
  border-left-color: rgb(var(--v-theme-primary));
}

.sell-concepts-group--demurrage {
  border-left-color: rgb(var(--v-theme-warning));
}

.sell-concepts-group-title {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 2px;
}
</style>
