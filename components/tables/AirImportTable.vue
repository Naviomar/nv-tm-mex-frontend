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
        storage-key="filter-layout:air-import"
        @hide="onLayoutFilterHidden"
      >
        <template #referencia>
          <v-text-field
            v-model="filters.referencia"
            density="compact"
            label="Add reference #"
            hint="Separate multiple with commas"
            @keyup.enter.stop="onClickFilters"
          >
            <template #append-inner>
              <v-btn
                v-if="filters.referencia"
                icon="mdi-plus"
                size="x-small"
                variant="text"
                color="primary"
                @click="addReferencia"
                title="Add to filter"
              />
            </template>
          </v-text-field>
        </template>
        <template #trackerRef>
          <v-text-field
            v-model="filters.trackerRef"
            density="compact"
            label="Tracker ref"
            hint="Comma separated"
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #masterAwb>
          <v-text-field
            v-model="filters.masterAwb"
            density="compact"
            label="Master AWB"
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #houseAwb>
          <v-text-field
            v-model="filters.houseAwb"
            density="compact"
            label="House AWB"
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #consignee>
          <ACustomerSearch
            v-model="filters.consignee_id"
            @update:search-text="filters.consignee_name = $event"
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #originFf>
          <AFreightForwarderSearch
            v-model="filters.origin_ff_id"
            label="Freight Forwarder origin"
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #airline>
          <AAirlineSearch v-model="filters.airline_id" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #flightNum>
          <v-text-field
            v-model="filters.flightNum"
            density="compact"
            label="Flight number"
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #sourceSystem>
          <v-autocomplete
            v-model="filters.source_system_id"
            density="compact"
            label="Source system"
            :items="sourceSystems"
            item-title="name"
            item-value="id"
            hide-details
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #hasArrivalNoty>
          <v-autocomplete
            v-model="filters.has_arrival_noty"
            density="compact"
            label="Has arrival noty"
            :items="yesNoItems"
            item-title="name"
            item-value="value"
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
            @keyup.enter.stop="onClickFilters"
            hide-details
          />
        </template>
        <template #bookingNum>
          <v-text-field v-model="filters.bookingNum" density="compact" label="Booking number" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #bookingTm>
          <v-text-field v-model="filters.bookingTm" density="compact" label="Booking TM" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #eta>
          <v-text-field v-model="filters.eta" type="date" density="compact" label="ETA" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #invoiceNumber>
          <v-text-field
            v-model="filters.invoiceNumber"
            density="compact"
            label="Invoice #"
            hint="TM or WM invoice number"
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #ffNoteFolio>
          <v-text-field
            v-model="filters.ffNoteFolio"
            density="compact"
            label="CN/DN #"
            hint="Nota de crédito/débito del FF"
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #hasTmInvoices>
          <v-autocomplete
            v-model="filters.hasTmInvoices"
            density="compact"
            label="Has TM invoices"
            :items="yesNoItems"
            item-title="name"
            item-value="value"
            hide-details
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #hasWmInvoices>
          <v-autocomplete
            v-model="filters.hasWmInvoices"
            density="compact"
            label="Has WM invoices"
            :items="yesNoItems"
            item-title="name"
            item-value="value"
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
      <div class="flex gap-4">
        <v-btn size="small" class="" color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn size="small" color="amber" @click="exportAirRefsXlsx"
          ><v-icon>mdi-microsoft-excel</v-icon> Export Air Report
        </v-btn>
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
          :show-year-filter="false"
          :storage-key="'air-import-pagination'"
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
                <th v-if="col.key === 'actions'" class="text-left" width="50">Actions</th>
                <th v-else-if="col.key === 'reference'" class="text-left"># Reference</th>
                <th v-else-if="col.key === 'masterAwb'" class="text-left">Master AWB</th>
                <th v-else-if="col.key === 'houseAwb'" class="text-left">House AWB</th>
                <th v-else-if="col.key === 'originFf'" class="text-left">Origin F.F.</th>
                <th v-else-if="col.key === 'consignee'" class="text-left">Consignee</th>
                <th v-else-if="col.key === 'origin'" class="text-left">Origin</th>
                <th v-else-if="col.key === 'destination'" class="text-left">Destination</th>
                <th v-else-if="col.key === 'arrivalNoty'" class="text-left">Arrival noty</th>
                <th v-else-if="col.key === 'revalidation'" class="text-left">Revalidation</th>
                <th v-else-if="col.key === 'airline'" class="text-left">Airline</th>
                <th v-else-if="col.key === 'flightNum'" class="text-left">Flight number</th>
                <th v-else-if="col.key === 'departure'" class="text-left">Departure</th>
                <th v-else-if="col.key === 'trash'" class="text-left" width="50"></th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in references.data"
              :key="`air-reference-${index}`"
              :class="{
                'dark:hover:bg-gray-700 hover:bg-slate-300': true,
                'bg-pink-100! dark:bg-pink-900!': isSystemTracker(item),
                'bg-red-100! dark:bg-red-900!': item.deleted_at,
              }"
            >
              <template v-for="col in visibleColumns" :key="col.key">
                <td v-if="col.key === 'actions'">
                  <div class="flex">
                    <v-btn
                      v-if="!item.deleted_at && hasPermission('air-import-references-edit')"
                      variant="text"
                      icon="mdi-pencil-outline"
                      color="blue-lighten-2"
                      density="compact"
                      @click="viewReference(item)"
                    ></v-btn>
                    <v-btn
                      v-if="hasPermission('air-import-references-view') && canViewReference(item)"
                      variant="text"
                      icon="mdi-eye-outline"
                      color="green-lighten-2"
                      density="compact"
                      @click="viewDetails(item)"
                    ></v-btn>
                  </div>
                </td>
                <td v-else-if="col.key === 'reference'" class="whitespace-nowrap">
                  <UserInfoBadge :item="item">
                    <ServiceNumberLabel :service="item" />
                  </UserInfoBadge>
                  <v-chip v-if="item.deleted_at" color="red" size="x-small" variant="elevated" class="flex items-center gap-2 mb-2 font-bold">CANCELLED</v-chip>
                  <v-alert v-if="item.reason_deleted" color="red" size="x-small" variant="elevated" class="flex items-center gap-2 mb-2 font-bold" v-html="splitText(item.reason_deleted)"></v-alert>
                </td>
                <td v-else-if="col.key === 'masterAwb'">
                  <v-chip size="small" color="primary">
                    {{ item.master_awb }}
                  </v-chip>
                </td>
                <td v-else-if="col.key === 'houseAwb'">
                  <v-chip size="small" color="primary">
                    {{ item.house_awb }}
                  </v-chip>
                </td>
                <td v-else-if="col.key === 'originFf'">{{ item.origin_ff?.name }}</td>
                <td v-else-if="col.key === 'consignee'">
                  <v-icon v-if="isSystemTracker(item)" size="small" color="pink">mdi-storefront-outline</v-icon>
                  {{ item.consignee?.name }}
                </td>
                <td v-else-if="col.key === 'origin'">{{ item.origin }}</td>
                <td v-else-if="col.key === 'destination'">{{ item.destination }}</td>
                <td v-else-if="col.key === 'arrivalNoty'">
                  <div v-for="(noty, index) in item.arrival_notys" :key="`noty-${index}`" class="mb-2">
                    <v-chip size="small" color="green"> Sent @ {{ formatDateString(noty.created_at) }} </v-chip>
                  </div>
                  <v-chip v-if="item.arrival_notys.length == 0" size="small" color="red">Pending</v-chip>
                </td>
                <td v-else-if="col.key === 'revalidation'">
                  <div v-for="(noty, index) in item.sent_releases" :key="`revalid-${index}`" class="mb-2">
                    <v-chip size="small" color="green"> Sent @ {{ formatDateString(noty.created_at) }} </v-chip>
                  </div>
                  <v-chip v-if="item.sent_releases.length == 0" size="small" color="red">Pending</v-chip>
                </td>
                <td v-else-if="col.key === 'airline'">{{ item.airline?.name }}</td>
                <td v-else-if="col.key === 'flightNum'">{{ getFirstRouteFlightNum(item) }}</td>
                <td v-else-if="col.key === 'departure'">{{ getFirstRouteDeparture(item) }}</td>
                <td v-else-if="col.key === 'trash'">
                  <TrashButton :item="item" :form-deletion="formDeletion" serviceType="air-import" @click="confirmDeletion" />
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
          :show-year-filter="false"
          :storage-key="'air-import-pagination'"
          @page-change="onPageChange"
          @per-page-change="onPerPageChange"
        />
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { sourceSystems, deletedStatus } from '@/utils/data/systemData'
import { flattenArraysToCommaSeparatedString } from '~/utils/formatters'
import { useTableFilters } from '~/composables/useTableFilters'

const { $api } = useNuxtApp()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const { hasPermission, fetchIsRestricted, canViewReference } = useCheckUser()
fetchIsRestricted()

const formDeletion = ref<any>({
  reason: null as string | null,
})

const catalogs = ref<any>({
  customers: [],
  ffs: [],
  airlines: [],
})

const FILTER_VISIBILITY_KEY = 'air-import-filters-visible'
const showFilters = ref(sessionStorage.getItem(FILTER_VISIBILITY_KEY) !== 'false')
const toggleFilters = () => {
  showFilters.value = !showFilters.value
  sessionStorage.setItem(FILTER_VISIBILITY_KEY, String(showFilters.value))
}

// Initial filter values
const initialFilters = {
  referencia: '',
  referencias: [] as string[],
  has_arrival_noty: null as number | null,
  masterAwb: '',
  houseAwb: '',
  consignee_id: '',
  consignee_name: '',
  origin_ff_id: '',
  destination_ff_id: '',
  airline_id: '',
  flightNum: '',
  source_system_id: '',
  trackerRef: '',
  deleted_status: '',
  bookingNum: '',
  bookingTm: '',
  eta: '',
  invoiceNumber: '',
  ffNoteFolio: '',
  hasTmInvoices: null as number | null,
  hasWmInvoices: null as number | null,
}

const yesNoItems = [
  { name: 'Yes', value: 1 },
  { name: 'No', value: 0 },
]

// Registry of every filter available in the search form. The order and spans
// here define the default layout; filters with visible: false are only shown
// when the user adds them from the Layout menu.
const filterLayoutDefs = [
  { key: 'referencia', label: 'Reference #', span: 2 },
  { key: 'trackerRef', label: 'Tracker ref', span: 2 },
  { key: 'masterAwb', label: 'Master AWB', span: 2 },
  { key: 'houseAwb', label: 'House AWB', span: 2 },
  { key: 'consignee', label: 'Consignee', span: 2 },
  { key: 'originFf', label: 'FF origin', span: 2 },
  { key: 'airline', label: 'Airline', span: 2 },
  { key: 'flightNum', label: 'Flight number', span: 2 },
  { key: 'sourceSystem', label: 'Source system', span: 2 },
  { key: 'hasArrivalNoty', label: 'Has arrival noty', span: 2 },
  { key: 'status', label: 'Status', span: 2 },
  { key: 'bookingNum', label: 'Booking number', span: 2, visible: false },
  { key: 'bookingTm', label: 'Booking TM', span: 2, visible: false },
  { key: 'eta', label: 'ETA', span: 2, visible: false },
  { key: 'invoiceNumber', label: 'Invoice #', span: 2, visible: false },
  { key: 'ffNoteFolio', label: 'CN/DN #', span: 2, visible: false },
  { key: 'hasTmInvoices', label: 'Has TM invoices', span: 2, visible: false },
  { key: 'hasWmInvoices', label: 'Has WM invoices', span: 2, visible: false },
]

// Model keys backing each layout filter, used to clear values when the user
// hides a filter so hidden filters never affect the search.
const filterModelKeys: Record<string, string[]> = {
  referencia: ['referencia', 'referencias'],
  trackerRef: ['trackerRef'],
  masterAwb: ['masterAwb'],
  houseAwb: ['houseAwb'],
  consignee: ['consignee_id', 'consignee_name'],
  originFf: ['origin_ff_id'],
  airline: ['airline_id'],
  flightNum: ['flightNum'],
  sourceSystem: ['source_system_id'],
  hasArrivalNoty: ['has_arrival_noty'],
  status: ['deleted_status'],
  bookingNum: ['bookingNum'],
  bookingTm: ['bookingTm'],
  eta: ['eta'],
  invoiceNumber: ['invoiceNumber'],
  ffNoteFolio: ['ffNoteFolio'],
  hasTmInvoices: ['hasTmInvoices'],
  hasWmInvoices: ['hasWmInvoices'],
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
  { key: 'masterAwb', label: 'Master AWB' },
  { key: 'houseAwb', label: 'House AWB' },
  { key: 'originFf', label: 'Origin F.F.' },
  { key: 'consignee', label: 'Consignee' },
  { key: 'origin', label: 'Origin' },
  { key: 'destination', label: 'Destination' },
  { key: 'arrivalNoty', label: 'Arrival noty' },
  { key: 'revalidation', label: 'Revalidation' },
  { key: 'airline', label: 'Airline' },
  { key: 'flightNum', label: 'Flight number' },
  { key: 'departure', label: 'Departure' },
  { key: 'trash', label: 'Delete' },
]

const columnsLayout = useTableColumns('table-columns:air-import', tableColumnDefs)
const { visibleColumns } = columnsLayout

// Use the table filters composable for URL persistence
const {
  filters,
  currentPage,
  perPage,
  syncToUrl,
  resetFilters: resetFiltersComposable,
  getFilteredUrl,
} = useTableFilters(initialFilters, {
  storageKey: 'air-import-filters',
  arrayFields: ['referencias'],
  enablePerPage: true,
  defaultPerPage: 10,
})

const references = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  last_page: 1,
  from: 1,
  to: 1,
  total: 1,
})

function splitText(text){
  const spliText = text.split(' ')
  const num_words = 5
  return spliText.reduce((txt, word, i, arr) => {
    txt.push(word)
    if((i + 1) % num_words === 0 && i < arr.length - 1){
        txt.push('<br>')
    }

    return txt;
  }, []).join(' ') 
}

// Expose backUrl for child components
const backUrl = computed(() => getFilteredUrl('/air/import'))
provide('catalogBackUrl', backUrl)

const isSystemTracker = (item: any) => {
  return item.source_system_id === 2
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

// When an exact customer is selected, drop the free-text name search so the
// two filters never combine into an impossible AND.
const buildQueryParams = () => {
  const params: any = { ...flattenArraysToCommaSeparatedString(filters.value) }
  if (params.consignee_id) {
    delete params.consignee_name
  }
  return params
}

const onClickPagination = async (page: number) => {
  await onPageChange(page)
}

const onPageChange = async (page: number) => {
  currentPage.value = page
  references.value.current_page = page
  await syncToUrl()
  await getAirImportReferences()
}

const onPerPageChange = async (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  references.value.current_page = 1
  await syncToUrl()
  await getAirImportReferences()
}

const onClickFilters = async () => {
  // Add any pending reference before searching
  addReferencia()
  // set current page to 1
  currentPage.value = 1
  references.value.current_page = 1
  await syncToUrl()
  await getAirImportReferences()
}

const getAirImportReferences = async () => {
  try {
    loadingStore.start()
    const response = await $api.airImport.getReferences({
      query: {
        page: currentPage.value,
        limit: perPage.value,
        ...buildQueryParams(),
      },
    })

    references.value = response as any
    references.value.current_page = currentPage.value
    
    if (references.value.data.length === 0) {
      snackbar.add({
        type: 'info',
        text: 'No records found',
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

const exportAirRefsXlsx = async () => {
  try {
    loadingStore.start()

    const response = (await $api.airImport.exportXlsxReport({
      query: {
        ...buildQueryParams(),
      },
    })) as any

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    // agrega timestamp to filename
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '')
    link.download = `air-import-report-${timestamp}.xlsx`
    link.click()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getFirstRouteFlightNum = (item: any) => {
  if (item.transits.length > 0) {
    return item.transits[0]?.flight_number
  }
  return ''
}

const getFirstRouteDeparture = (item: any) => {
  if (item.transits.length > 0) {
    return item.transits[0]?.departure_airport?.name
  }
  return ''
}

const getAirExportFilters = async () => {
  const response = await $api.airImport.getAirExportFilters()

  catalogs.value = response as any
}

const clearFilters = async () => {
  await resetFiltersComposable()
  references.value.current_page = 1
  await getAirImportReferences()
}

const viewReference = (item: any) => {
  console.log(item)
  router.push(`/air/import/operations-${item.id}`)
}

const viewDetails = (item: any) => {
  router.push(`/air/import/view-details-${item.id}`)
}

const confirmDeletion = async (item: any) => {
  try {
    loadingStore.start()
    await $api.airImport.deleteReference(item.id.toString(), { body: { reason: formDeletion.value.reason, } })
    snackbar.add({ type: 'success', text: `Reference ${item.reference_number} cancelled successfully` })
    await getAirImportReferences()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error cancelling reference' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getAirExportFilters()
  // Sync current page from composable after URL is loaded
  references.value.current_page = currentPage.value
  getAirImportReferences()
})
</script>
