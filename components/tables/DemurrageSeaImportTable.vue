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
            storage-key="filter-layout:demurrage-sea-import"
            @hide="onLayoutFilterHidden"
          >
            <template #year>
              <v-autocomplete v-model="filters.year" :items="prefixYears" density="compact" label="Year" />
            </template>
            <template #referencia>
              <v-text-field
                v-model="filters.referencia"
                density="compact"
                label="Add reference #"
                hint="Separate multiple references with commas"
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
                    title="Add reference to filter"
                  />
                </template>
              </v-text-field>
            </template>
            <template #masterBl>
              <v-text-field v-model="filters.masterBl" density="compact" label="Master BL" />
            </template>
            <template #houseBl>
              <v-text-field v-model="filters.houseBl" density="compact" label="House BL" />
            </template>
            <template #consignee>
              <AGlobalSearch
                v-model="filters.consignee_id"
                :onSearch="searchCustomers"
                validate-key="consignee_id"
                label="Customer"
              />
            </template>
            <template #freightForwarder>
              <AGlobalSearch
                v-model="filters.ffId"
                :onSearch="searchFfs"
                validate-key="ffId"
                label="Freight Forwarder"
              />
            </template>
            <template #vesselVoyage>
              <v-autocomplete
                v-model="unifiedVesselVoyageSearch"
                density="compact"
                label="Vessel / Voyage"
                :items="unifiedVesselVoyageItems"
                item-title="display_name"
                item-value="id"
                clearable
                hide-details
                @update:model-value="onUnifiedSearchChange"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :color="item.raw.type === 'vessel' ? 'blue' : 'teal'">
                        {{ item.raw.type === 'vessel' ? 'mdi-ferry' : 'mdi-map-marker-path' }}
                      </v-icon>
                    </template>
                    <template #title>
                      <span>{{ item.raw.display_name }}</span>
                    </template>
                    <template #subtitle>
                      <v-chip size="x-small" :color="item.raw.type === 'vessel' ? 'blue' : 'teal'" variant="flat">
                        {{ item.raw.type === 'vessel' ? 'Vessel' : 'Voyage' }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
                <template #selection="{ item }">
                  <span class="d-flex align-center gap-1 text-truncate">
                    <v-icon
                      size="14"
                      :color="item.raw.type === 'vessel' ? 'blue' : 'teal'"
                      >{{ item.raw.type === 'vessel' ? 'mdi-ferry' : 'mdi-map-marker-path' }}</v-icon
                    >
                    <span class="text-truncate text-body-2">{{ item.raw.display_name }}</span>
                  </span>
                </template>
              </v-autocomplete>
            </template>
            <template #eta>
              <v-text-field v-model="filters.eta" type="date" density="compact" label="ETA" />
            </template>
            <template #containerNumber>
              <v-text-field v-model="filters.containerNumber" density="compact" label="Container #" />
            </template>
            <template #bookingNum>
              <v-text-field v-model="filters.bookingNum" density="compact" label="Booking number" />
            </template>
            <template #line>
              <v-autocomplete
                v-model="filters.line_id"
                density="compact"
                label="Freight line"
                :items="catalogs.lines"
                item-title="name"
                item-value="id"
              />
            </template>
            <template #hasDemurrage>
              <v-autocomplete
                v-model="filters.has_demurrage"
                density="compact"
                label="Demurrages generated"
                :items="[
                  { title: 'Yes', value: '1' },
                  { title: 'No', value: '0' }
                ]"
              />
            </template>
            <template #invoiceRefStatus>
              <v-autocomplete
                v-model="filters.invoiceRefStatus"
                density="compact"
                label="Invoice Ref. Status"
                :items="invoiceRefStatusItems"
                item-title="title"
                item-value="value"
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
            <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
            <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
          </div>
        </div>
      </v-expand-transition>
    </div>
    <v-card>
      <v-card-text>
        <v-pagination
          v-model="references.current_page"
          :length="references.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <div class="flex justify-end mb-1">
          <TableColumnsMenu :state="columnsLayout" />
        </div>
        <v-table density="compact" fixed-header>
          <thead>
            <tr>
              <template v-for="col in visibleColumns" :key="col.key">
                <th v-if="col.key === 'actions'" class="text-left" width="50">Actions</th>
                <th v-else-if="col.key === 'line'" class="text-left">Line</th>
                <th v-else-if="col.key === 'vesselVoyageDest'" class="text-left">Vessel / Voyage / Dest</th>
                <th v-else-if="col.key === 'voyageDemurrageInitDay'" class="text-left">
                  Voyage Demurrage init day
                </th>
                <th v-else-if="col.key === 'service'" class="text-left">Service #</th>
                <th v-else-if="col.key === 'conditionType'" class="text-left">Condition type</th>
                <th v-else-if="col.key === 'customer'" class="text-left">Customer</th>
                <th v-else-if="col.key === 'masterBls'" class="text-left">Master BL(s)</th>
                <th v-else-if="col.key === 'containers'" class="text-left">Container(s)</th>
                <th v-else-if="col.key === 'invoice'" class="text-left">Invoice</th>
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
                  <v-btn
                    variant="text"
                    icon="mdi-eye-outline"
                    color="blue-lighten-2"
                    density="compact"
                    @click="viewMaritimeReference(item)"
                  ></v-btn>
                </td>
                <td v-else-if="col.key === 'line'">{{ item.line?.commercial_name }}</td>
                <td v-else-if="col.key === 'vesselVoyageDest'">{{ item.voyage_discharge?.short_name }}</td>
                <td v-else-if="col.key === 'voyageDemurrageInitDay'">
                  <v-chip
                    v-if="item.voyage_discharge?.init_demurrage_at"
                    color="success"
                    size="small"
                    variant="outlined"
                  >
                    {{ item.voyage_discharge?.init_demurrage_at }}
                  </v-chip>
                  <v-chip v-else color="error" size="small" variant="outlined"> No </v-chip>
                </td>
                <td v-else-if="col.key === 'service'">{{ item.reference_number }}</td>
                <td v-else-if="col.key === 'conditionType'">{{ item.cargo_type }}</td>
                <td v-else-if="col.key === 'customer'">{{ item.consignee?.name }}</td>
                <td v-else-if="col.key === 'masterBls'">
                  <div class="grid grid-cols-1 gap-1">
                    <v-chip
                      v-for="(bl, index) in item.master_bls"
                      :key="`master-bl-${index}`"
                      size="small"
                      color="primary"
                      variant="outlined"
                    >
                      <v-icon v-if="bl.type">mdi-check</v-icon>{{ bl.name }} - {{ bl.consignee_mbl?.name }}
                    </v-chip>
                  </div>
                </td>
                <td v-else-if="col.key === 'containers'">
                  <div class="grid grid-cols-1 gap-1">
                    <v-chip
                      v-for="(container, index) in item.containers"
                      :key="`container-${index}`"
                      size="small"
                      :color="container.demurrage ? 'success' : 'error'"
                      variant="outlined"
                    >
                      <v-icon :icon="container.demurrage ? 'mdi-counter' : 'mdi-close'" start></v-icon>
                      <span
                        >{{ container.container_number }}
                        {{ container.demurrage ? ` - ${container.demurrage.start_date}` : '' }}
                      </span>
                    </v-chip>
                  </div>
                </td>
                <td v-else-if="col.key === 'invoice'">
                  <div class="grid grid-cols-1 gap-1">
                    <div v-if="!(item.demurrage_invoices || []).length">
                      <v-chip size="small" color="grey-lighten-3" variant="flat">None</v-chip>
                    </div>
                    <v-tooltip
                      v-for="(invoice, invIndex) in item.demurrage_invoices || []"
                      :key="`demurrage-invoice-${index}-${invIndex}`"
                      location="top"
                      open-delay="300"
                    >
                      <template #activator="{ props }">
                        <v-chip v-bind="props" size="small" color="primary" variant="outlined" class="w-fit">
                          <v-icon start size="small">{{ invoice.is_paid ? 'mdi-cash-check' : 'mdi-cash-clock' }}</v-icon>
                          {{ invoice.invoice_number }}
                        </v-chip>
                      </template>
                      <span>
                        {{ invoice.consignee_name }} - {{ formatDateOnlyString(invoice.issue_date || invoice.created_at) }}
                        - {{ invoice.is_paid ? 'Paid' : 'Pending' }}
                      </span>
                    </v-tooltip>
                  </div>
                </td>
              </template>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="references.current_page"
          :length="references.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <div class="text-xs">
          Showing {{ references.from }} to {{ references.to }} from {{ references.total }} total records
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { prefixYears } from '~/utils/date'
import { flattenArraysToCommaSeparatedString } from '~/utils/formatters'
import { useTableFilters } from '~/composables/useTableFilters'
import { useTableColumns } from '~/composables/useTableColumns'

const { $api } = useNuxtApp()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const catalogs = ref({
  consignees: [] as any,
  freights: [] as any,
  vessels: [] as any,
  voyages: [] as any,
  voyage_discharges: [] as any,
  lines: [] as any,
})

const unifiedVesselVoyageSearch = ref('')

const FILTER_VISIBILITY_KEY = 'demurrage-sea-import-filters-visible'
const showFilters = ref(sessionStorage.getItem(FILTER_VISIBILITY_KEY) !== 'false')
const toggleFilters = () => {
  showFilters.value = !showFilters.value
  sessionStorage.setItem(FILTER_VISIBILITY_KEY, String(showFilters.value))
}

// Initial filter values
const initialFilters = {
  year: '',
  referencia: '',
  referencias: [] as string[],
  masterBl: '',
  houseBl: '',
  consignee_id: '',
  ffId: '',
  vesselId: '',
  voyageDischargeId: '',
  eta: '',
  containerNumber: '',
  bookingNum: '',
  line_id: '',
  startDate: '',
  endDate: '',
  has_demurrage: '',
  invoiceRefStatus: '',
}

const invoiceRefStatusItems = [
  { title: 'Without invoice', value: 'without_invoice' },
  { title: 'With invoice', value: 'with_invoice' },
]

// Registry of every filter available in the search form. The order and spans
// here define the default layout; filters with visible: false are only shown
// when the user adds them from the Layout menu.
const filterLayoutDefs = [
  { key: 'year', label: 'Year', span: 2 },
  { key: 'referencia', label: 'Reference #', span: 2 },
  { key: 'masterBl', label: 'Master BL', span: 2 },
  { key: 'houseBl', label: 'House BL', span: 2 },
  { key: 'consignee', label: 'Customer', span: 4 },
  { key: 'freightForwarder', label: 'Freight Forwarder', span: 4 },
  { key: 'vesselVoyage', label: 'Vessel / Voyage', span: 4 },
  { key: 'eta', label: 'ETA', span: 2 },
  { key: 'containerNumber', label: 'Container #', span: 2 },
  { key: 'bookingNum', label: 'Booking number', span: 2 },
  { key: 'line', label: 'Freight line', span: 2 },
  { key: 'hasDemurrage', label: 'Demurrages generated', span: 2 },
  { key: 'invoiceRefStatus', label: 'Invoice Ref. Status', span: 2 },
]

// Model keys backing each layout filter, used to clear values when the user
// hides a filter so hidden filters never affect the search.
const filterModelKeys: Record<string, string[]> = {
  year: ['year'],
  referencia: ['referencia', 'referencias'],
  masterBl: ['masterBl'],
  houseBl: ['houseBl'],
  consignee: ['consignee_id'],
  freightForwarder: ['ffId'],
  vesselVoyage: ['vesselId', 'voyageDischargeId'],
  eta: ['eta'],
  containerNumber: ['containerNumber'],
  bookingNum: ['bookingNum'],
  line: ['line_id'],
  hasDemurrage: ['has_demurrage'],
  invoiceRefStatus: ['invoiceRefStatus'],
}

const onLayoutFilterHidden = (key: string) => {
  const modelKeys = filterModelKeys[key] || []
  modelKeys.forEach((modelKey) => {
    const initialValue = (initialFilters as any)[modelKey]
    ;(filters.value as any)[modelKey] = Array.isArray(initialValue) ? [...initialValue] : initialValue
  })
  if (key === 'vesselVoyage') unifiedVesselVoyageSearch.value = ''
  syncToUrl()
}

// Registry of the table columns. Locked columns (Actions, Service #) cannot
// be hidden nor reordered; the rest can be managed from the Columns menu.
const tableColumnDefs = [
  { key: 'actions', label: 'Actions', locked: true },
  { key: 'line', label: 'Line' },
  { key: 'vesselVoyageDest', label: 'Vessel / Voyage / Dest' },
  { key: 'voyageDemurrageInitDay', label: 'Voyage Demurrage init day' },
  { key: 'service', label: 'Service #', locked: true },
  { key: 'conditionType', label: 'Condition type' },
  { key: 'customer', label: 'Customer' },
  { key: 'masterBls', label: 'Master BL(s)' },
  { key: 'containers', label: 'Container(s)' },
  { key: 'invoice', label: 'Invoice' },
]

const columnsLayout = useTableColumns('table-columns:demurrage-sea-import', tableColumnDefs)
const { visibleColumns } = columnsLayout

// Use the table filters composable for URL persistence
const {
  filters,
  currentPage,
  syncToUrl,
  resetFilters: resetFiltersComposable,
  setPage,
  getFilteredUrl,
  hasActiveFilters,
} = useTableFilters(initialFilters, {
  storageKey: 'demurrage-sea-import-filters',
  arrayFields: ['referencias'],
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

// Expose getFilteredUrl for child components and back navigation
const backUrl = computed(() => getFilteredUrl('/maritime/import/demurrages/search'))
provide('catalogBackUrl', backUrl)

const unifiedVesselVoyageItems = computed(() => {
  const voyages = catalogs.value.voyage_discharges.map((voyage: any) => ({
    id: `voyage-${voyage.id}`,
    display_name: voyage.short_name,
    type: 'voyage',
    original_id: voyage.id,
  }))

  const vessels = catalogs.value.vessels.map((vessel: any) => ({
    id: `vessel-${vessel.id}`,
    display_name: vessel.name,
    type: 'vessel',
    original_id: vessel.id,
  }))

  return [...voyages, ...vessels]
})

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
    // Sync to URL after adding references
    syncToUrl()
  }
}

const removeReferencia = (index: number) => {
  filters.value.referencias.splice(index, 1)
  syncToUrl()
}

const onUnifiedSearchChange = (value: string | null) => {
  if (!value) {
    filters.value.vesselId = ''
    filters.value.voyageDischargeId = ''
    return
  }

  const selectedItem = unifiedVesselVoyageItems.value.find((item) => item.id === value)

  if (selectedItem) {
    if (selectedItem.type === 'vessel') {
      filters.value.vesselId = selectedItem.original_id.toString()
      filters.value.voyageDischargeId = ''
    } else {
      filters.value.voyageDischargeId = selectedItem.original_id.toString()
      filters.value.vesselId = ''
    }
  }
}

const onClickFilters = async () => {
  // Add any pending reference before searching
  addReferencia()
  // set current page to 1
  currentPage.value = 1
  references.value.current_page = 1
  await syncToUrl()
  await getSeaImportReferences()
}

const onClickPagination = async (page: number) => {
  currentPage.value = page
  references.value.current_page = page
  await syncToUrl()
  await getSeaImportReferences()
}

const getSeaImportReferences = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.demurrages.getSeaImportReferencias({
      query: {
        page: currentPage.value,
        ...flattenArraysToCommaSeparatedString(filters.value),
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
    snackbar.add({
      type: 'error',
      text: 'Error loading demurrage references',
    })
  } finally {
    loadingStore.stop()
  }
}

const getSeaImportFilters = async () => {
  const response = await $api.referencias.getSeaImportFilters()

  catalogs.value = response as any
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

const searchFfs = async (params: any) => {
  try {
    const response = await $api.freightForwarders.searchFfs({
      query: params,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching freight forwarders',
    })
  }
}

const clearFilters = async () => {
  await resetFiltersComposable()
  unifiedVesselVoyageSearch.value = ''
  references.value.current_page = 1
  await getSeaImportReferences()
}

// Sync unified search when filters change (e.g., loaded from URL)
watch(
  [() => filters.value.vesselId, () => filters.value.voyageDischargeId, () => catalogs.value],
  () => {
    if (filters.value.vesselId) {
      unifiedVesselVoyageSearch.value = `vessel-${filters.value.vesselId}`
    } else if (filters.value.voyageDischargeId) {
      unifiedVesselVoyageSearch.value = `voyage-${filters.value.voyageDischargeId}`
    } else {
      unifiedVesselVoyageSearch.value = ''
    }
  },
  { deep: true }
)

const viewMaritimeReference = (item: any) => {
  router.push(`/maritime/import/demurrages/reference-${item.id}-demurrages`)
}

onMounted(async () => {
  // Load filters and data in parallel for better performance
  await Promise.all([
    getSeaImportFilters(),
    getSeaImportReferences()
  ])
  // Sync current page from composable after URL is loaded
  references.value.current_page = currentPage.value
})
</script>
