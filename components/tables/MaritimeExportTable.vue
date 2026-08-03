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
        storage-key="filter-layout:sea-export"
        @hide="onLayoutFilterHidden"
      >
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
          <v-text-field v-model="filters.masterBl" density="compact" label="Master BL" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #houseBl>
          <v-text-field v-model="filters.houseBl" density="compact" label="House BL" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #containerNumber>
          <v-text-field
            v-model="filters.containerNumber"
            density="compact"
            label="Container #"
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #bookingNum>
          <v-text-field v-model="filters.bookingNum" density="compact" label="Booking line" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #bookingTm>
          <v-text-field v-model="filters.bookingTm" density="compact" label="Booking TM" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #shipper>
          <!-- Data swap por decisión de negocio: consignee_id guarda al shipper real -->
          <ACustomerSearch
            v-model="filters.consignee_id"
            label="shipper"
            @update:search-text="filters.consignee_name = $event"
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #freightForwarder>
          <AFreightForwarderSearch v-model="filters.freight_forwarder_id" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #consignee>
          <!-- Data swap por decisión de negocio: shipper_id guarda al consignee real -->
          <AShipperSearch v-model="filters.shipper_id" label="consignee" @keyup.enter.stop="onClickFilters" />
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
            @keyup.enter.stop="onClickFilters"
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
                <v-icon size="14" :color="item.raw.type === 'vessel' ? 'blue' : 'teal'">{{ item.raw.type === 'vessel' ? 'mdi-ferry' : 'mdi-map-marker-path' }}</v-icon>
                <span class="text-truncate text-body-2">{{ item.raw.display_name }}</span>
              </span>
            </template>
          </v-autocomplete>
        </template>
        <template #origin>
          <v-text-field v-model="filters.origin" density="compact" label="Origin" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #destination>
          <v-text-field v-model="filters.destination" density="compact" label="Destination" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #eta>
          <v-text-field v-model="filters.eta" type="date" density="compact" label="ETA" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #line>
          <v-autocomplete
            v-model="filters.line_id"
            density="compact"
            label="Line"
            :items="catalogs.lines"
            item-title="name"
            item-value="id"
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #hasSailed>
          <v-autocomplete
            v-model="filters.has_sailed"
            density="compact"
            label="Has sailed?"
            :items="yesNoItems"
            item-title="name"
            item-value="value"
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
        <template #poNum>
          <v-text-field
            v-model="filters.poNum"
            density="compact"
            label="PO #"
            hint="PO o pedido tracker"
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
        <div class="flex gap-2">
          <v-chip color="green"><span class="inline-block w-5 h-5 bg-lime-200 mr-2"></span>Ship sailed</v-chip>
        </div>

        <EnhancedPagination
          v-model:currentPage="references.current_page"
          v-model:perPage="perPage"
          :total-pages="references.last_page"
          :from="references.from"
          :to="references.to"
          :total="references.total"
          :show-year-filter="false"
          :storage-key="'maritime-export-pagination'"
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
                <th v-else-if="col.key === 'line'" class="text-left">Freight line</th>
                <th v-else-if="col.key === 'shipper'" class="text-left">Shipper</th>
                <th v-else-if="col.key === 'consignee'" class="text-left">Consignee</th>
                <th v-else-if="col.key === 'masterBls'" class="text-left">Master BL(s)</th>
                <th v-else-if="col.key === 'houseBls'" class="text-left">House BL(s)</th>
                <th v-else-if="col.key === 'totalContainers'" class="text-left">Total containers</th>
                <th v-else-if="col.key === 'containers'" class="text-left">
                  <div class="flex items-center gap-2">
                    <div>Containers</div>
                    <v-icon @click="showDetails">
                      {{ !containerViewer ? 'mdi-eye-off' : 'mdi-eye' }}
                    </v-icon>
                  </div>
                </th>
                <th v-else-if="col.key === 'vesselVoyage'" class="text-left">Vessel - Voyage</th>
                <th v-else-if="col.key === 'pol'" class="text-left">POL</th>
                <th v-else-if="col.key === 'pod'" class="text-left">POD</th>
                <th v-else-if="col.key === 'bookingNumber'" class="text-left">Booking Number</th>
                <th v-else-if="col.key === 'bookingTm'" class="text-left">Booking TM</th>
                <th v-else-if="col.key === 'created'" class="text-left">Created</th>
                <th v-else-if="col.key === 'trash'" class="text-left" width="50"></th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in references.data"
              :key="`reference-${index}`"
              :class="{
                'bg-lime-200! dark:bg-lime-700!': hasSailed(item),
                'dark:hover:bg-gray-700 hover:bg-slate-300': true,
                'bg-pink-100': isSystemTracker(item),
                'bg-red-100! dark:bg-red-900!': item.deleted_at,
              }"
            >
              <template v-for="col in visibleColumns" :key="col.key">
                <td v-if="col.key === 'actions'">
                  <div class="flex">
                    <v-btn
                      v-if="!item.deleted_at && hasPermission('sea-export-references-edit')"
                      variant="text"
                      icon="mdi-pencil-outline"
                      color="blue-lighten-2"
                      density="compact"
                      @click="viewMaritimeReference(item)"
                    ></v-btn>
                    <v-btn
                      v-if="hasPermission('sea-export-references-view') && canViewReference(item)"
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
                <td v-else-if="col.key === 'line'">{{ item.line?.name }}</td>
                <td v-else-if="col.key === 'shipper'">{{ item.consignee?.name }}</td>
                <td v-else-if="col.key === 'consignee'">{{ item.shipper?.name }}</td>
                <td v-else-if="col.key === 'masterBls'">
                  <div class="flex flex-col gap-1">
                    <v-chip
                      v-for="(bl, index) in item.master_bls"
                      :key="`master-bl-${index}`"
                      size="small"
                      color="primary"
                    >
                      <v-icon v-if="bl.type">mdi-check</v-icon>{{ bl.name }}
                    </v-chip>
                  </div>
                </td>
                <td v-else-if="col.key === 'houseBls'">
                  <div class="flex flex-col gap-1">
                    <v-chip v-for="(bl, index) in item.house_bls" :key="`house-bl-${index}`" size="small" color="primary">
                      <v-icon v-if="bl.type">mdi-check</v-icon>{{ bl.name }}
                    </v-chip>
                  </div>
                </td>
                <td v-else-if="col.key === 'totalContainers'">{{ item.containers.length }}</td>
                <td v-else-if="col.key === 'containers'" class="whitespace-nowrap">
                  <div v-if="!containerViewer" class="flex justify-center">
                    <v-icon>mdi-eye-off</v-icon>
                  </div>
                  <div v-if="containerViewer">
                    <div class="flex flex-col gap-1">
                      <v-chip
                        v-for="(container, index) in item.containers"
                        :key="`container-${index}`"
                        size="small"
                        color="primary"
                        class="overflow-auto! text-[10px]!"
                      >
                        {{ container.container_number }} {{ container.container_type?.name }}
                      </v-chip>
                    </div>
                  </div>
                </td>
                <td v-else-if="col.key === 'vesselVoyage'">{{ item.voyage_discharge?.short_name }}</td>
                <td v-else-if="col.key === 'pol'">{{ item.pol?.country_port }}</td>
                <td v-else-if="col.key === 'pod'">{{ item.pod?.country_port }}</td>
                <td v-else-if="col.key === 'bookingNumber'">{{ item.booking_number }}</td>
                <td v-else-if="col.key === 'bookingTm'">{{ item.booking_tm }}</td>
                <td v-else-if="col.key === 'created'" class="whitespace-nowrap">{{ formatDateString(item.created_at) }}</td>
                <td v-else-if="col.key === 'trash'">
                  <TrashButton :item="item" :form-deletion="formDeletion" serviceType="sea-export" @click="confirmDeletion" />
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
          :storage-key="'maritime-export-pagination'"
          @page-change="onPageChange"
          @per-page-change="onPerPageChange"
        />
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { sourceSystems, deletedStatus } from '~/utils/data/systemData'
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

const catalogs = ref({
  consignees: [] as any,
  freights: [] as any,
  vessels: [] as any,
  voyages: [] as any,
  voyage_discharges: [] as any,
  lines: [] as any,
})

const FILTER_VISIBILITY_KEY = 'sea-export-filters-visible'
const showFilters = ref(sessionStorage.getItem(FILTER_VISIBILITY_KEY) !== 'false')
const toggleFilters = () => {
  showFilters.value = !showFilters.value
  sessionStorage.setItem(FILTER_VISIBILITY_KEY, String(showFilters.value))
}

// Initial filter values
const initialFilters = {
  referencia: '',
  referencias: [] as string[],
  masterBl: '',
  houseBl: '',
  consignee_id: '',
  consignee_name: '',
  freight_forwarder_id: '',
  shipper_id: '',
  vessel_id: '',
  voyage_departure_id: '',
  origin: '',
  destination: '',
  eta: '',
  containerNumber: '',
  bookingNum: '',
  bookingTm: null as string | null,
  line_id: '',
  has_sailed: null as number | null,
  deleted_status: '',
  invoiceNumber: '',
  ffNoteFolio: '',
  poNum: '',
  hasTmInvoices: null as number | null,
  hasWmInvoices: null as number | null,
  source_system_id: null as number | null,
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
  { key: 'masterBl', label: 'Master BL', span: 2 },
  { key: 'houseBl', label: 'House BL', span: 2 },
  { key: 'containerNumber', label: 'Container #', span: 2 },
  { key: 'bookingNum', label: 'Booking line', span: 2 },
  { key: 'bookingTm', label: 'Booking TM', span: 2 },
  { key: 'shipper', label: 'Shipper', span: 2 },
  { key: 'freightForwarder', label: 'Freight forwarder', span: 2 },
  { key: 'consignee', label: 'Consignee', span: 2 },
  { key: 'vesselVoyage', label: 'Vessel / Voyage', span: 2 },
  { key: 'origin', label: 'Origin', span: 2 },
  { key: 'destination', label: 'Destination', span: 2 },
  { key: 'eta', label: 'ETA', span: 2 },
  { key: 'line', label: 'Line', span: 2 },
  { key: 'hasSailed', label: 'Has sailed?', span: 2 },
  { key: 'status', label: 'Status', span: 2 },
  { key: 'invoiceNumber', label: 'Invoice #', span: 2, visible: false },
  { key: 'ffNoteFolio', label: 'CN/DN #', span: 2, visible: false },
  { key: 'poNum', label: 'PO #', span: 2, visible: false },
  { key: 'hasTmInvoices', label: 'Has TM invoices', span: 2, visible: false },
  { key: 'hasWmInvoices', label: 'Has WM invoices', span: 2, visible: false },
  { key: 'sourceSystem', label: 'Source system', span: 2, visible: false },
]

// Model keys backing each layout filter, used to clear values when the user
// hides a filter so hidden filters never affect the search.
const filterModelKeys: Record<string, string[]> = {
  referencia: ['referencia', 'referencias'],
  masterBl: ['masterBl'],
  houseBl: ['houseBl'],
  containerNumber: ['containerNumber'],
  bookingNum: ['bookingNum'],
  bookingTm: ['bookingTm'],
  shipper: ['consignee_id', 'consignee_name'],
  freightForwarder: ['freight_forwarder_id'],
  consignee: ['shipper_id'],
  vesselVoyage: ['vessel_id', 'voyage_departure_id'],
  origin: ['origin'],
  destination: ['destination'],
  eta: ['eta'],
  line: ['line_id'],
  hasSailed: ['has_sailed'],
  status: ['deleted_status'],
  invoiceNumber: ['invoiceNumber'],
  ffNoteFolio: ['ffNoteFolio'],
  poNum: ['poNum'],
  hasTmInvoices: ['hasTmInvoices'],
  hasWmInvoices: ['hasWmInvoices'],
  sourceSystem: ['source_system_id'],
}

const onLayoutFilterHidden = (key: string) => {
  const modelKeys = filterModelKeys[key] || []
  modelKeys.forEach((modelKey) => {
    const initialValue = (initialFilters as any)[modelKey]
    ;(filters.value as any)[modelKey] = Array.isArray(initialValue) ? [...initialValue] : initialValue
  })
  if (key === 'vesselVoyage') unifiedVesselVoyageSearch.value = null
  syncToUrl()
}

// Registry of the table columns. Locked columns (Actions, # Reference) cannot
// be hidden nor reordered; the rest can be managed from the Columns menu.
const tableColumnDefs = [
  { key: 'actions', label: 'Actions', locked: true },
  { key: 'reference', label: '# Reference', locked: true },
  { key: 'line', label: 'Freight line' },
  { key: 'shipper', label: 'Shipper' },
  { key: 'consignee', label: 'Consignee' },
  { key: 'masterBls', label: 'Master BL(s)' },
  { key: 'houseBls', label: 'House BL(s)' },
  { key: 'totalContainers', label: 'Total containers' },
  { key: 'containers', label: 'Containers' },
  { key: 'vesselVoyage', label: 'Vessel - Voyage' },
  { key: 'pol', label: 'POL' },
  { key: 'pod', label: 'POD' },
  { key: 'bookingNumber', label: 'Booking Number' },
  { key: 'bookingTm', label: 'Booking TM' },
  { key: 'created', label: 'Created' },
  { key: 'trash', label: 'Delete' },
]

const columnsLayout = useTableColumns('table-columns:sea-export', tableColumnDefs)
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
  storageKey: 'maritime-export-filters',
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
const backUrl = computed(() => getFilteredUrl('/maritime/export'))
provide('catalogBackUrl', backUrl)

const containerViewer = ref(false)

const hasSailed = (item: any) => {
  return item.voyage_discharge?.is_sailed === 1
}

const isSystemTracker = (item: any) => {
  return item.source_system_id === 2
}

const showDetails = () => {
  containerViewer.value = !containerViewer.value
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

const onClickFilters = async () => {
  // Add any pending reference before searching
  addReferencia()
  // set current page to 1
  currentPage.value = 1
  references.value.current_page = 1
  await syncToUrl()
  await getSeaExportReferences()
}

const onClickPagination = async (page: number) => {
  await onPageChange(page)
}

const onPageChange = async (page: number) => {
  currentPage.value = page
  references.value.current_page = page
  await syncToUrl()
  await getSeaExportReferences()
}

const onPerPageChange = async (newPerPage: number) => {
  perPage.value = newPerPage
  currentPage.value = 1
  references.value.current_page = 1
  await syncToUrl()
  await getSeaExportReferences()
}

const getSeaExportReferences = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.referenciasExport.getSeaExportReferencias({
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
    // timeout 1 second
    loadingStore.stop()
  }
}

const getSeaExportFilters = async () => {
  const response = await $api.referenciasExport.getSeaExportFilters()

  catalogs.value = response as any
}

const unifiedVesselVoyageSearch = ref<string | null>(null)

const unifiedVesselVoyageItems = computed(() => {
  const voyages = catalogs.value.voyage_discharges.map((voyage: any) => ({
    id: `voyage-${voyage.id}`,
    display_name: (voyage.short_name || voyage.name) + (voyage.voyage?.vessel?.line?.code ? ` (${voyage.voyage.vessel.line.code})` : ''),
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

const onUnifiedSearchChange = (value: string | null) => {
  if (!value) {
    filters.value.vessel_id = ''
    filters.value.voyage_departure_id = ''
    return
  }

  const selectedItem = unifiedVesselVoyageItems.value.find((item) => item.id === value)

  if (selectedItem) {
    if (selectedItem.type === 'vessel') {
      filters.value.vessel_id = selectedItem.original_id.toString()
      filters.value.voyage_departure_id = ''
    } else {
      filters.value.voyage_departure_id = selectedItem.original_id.toString()
      filters.value.vessel_id = ''
    }
  }
}

onMounted(() => {
  getSeaExportFilters()
  references.value.current_page = currentPage.value
  getSeaExportReferences()
})

const clearFilters = async () => {
  await resetFiltersComposable()
  unifiedVesselVoyageSearch.value = null
  references.value.current_page = 1
  await getSeaExportReferences()
}

const viewMaritimeReference = (item: any) => {
  router.push(`/maritime/export/${item.id}`)
}

const viewDetails = (item: any) => {
  router.push(`/maritime/export/view-details-${item.id}`)
}

const confirmDeletion = async (item: any) => {
  try {
    loadingStore.start()
    await $api.referenciasExport.deleteReferenceExport(item.id.toString(), { body: { reason: formDeletion.value.reason, } })
    snackbar.add({ type: 'success', text: `Reference ${item.reference_number} cancelled successfully` })
    await getSeaExportReferences()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error cancelling reference' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
