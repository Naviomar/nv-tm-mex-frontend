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
        storage-key="filter-layout:sea-import"
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
        <template #masterBl>
          <v-text-field v-model="filters.masterBl" density="compact" label="Master BL" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #houseBl>
          <v-text-field v-model="filters.houseBl" density="compact" label="House BL" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #bookingNum>
          <v-text-field v-model="filters.bookingNum" density="compact" label="Booking number" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #containerNumber>
          <v-text-field
            v-model="filters.containerNumber"
            density="compact"
            label="Container #"
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
        <template #consignee>
          <ACustomerSearch
            v-model="filters.consignee_id"
            @update:search-text="filters.consignee_name = $event"
            @keyup.enter.stop="onClickFilters"
          />
        </template>
        <template #freightForwarder>
          <AFreightForwarderSearch v-model="filters.freight_forwarder_id" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #shipper>
          <AShipperSearch v-model="filters.shipper_id" @keyup.enter.stop="onClickFilters" />
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
        <template #eta>
          <v-text-field v-model="filters.eta" type="date" density="compact" label="ETA" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #line>
          <AGlobalSearch :onSearch="searchLines" v-model="filters.line_id" label="Freight line" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #hasRevalidation>
          <v-autocomplete
            v-model="filters.hasRevalidation"
            density="compact"
            label="Has revalidation"
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
        <template #origin>
          <v-text-field v-model="filters.origin" density="compact" label="Origin (POL)" @keyup.enter.stop="onClickFilters" />
        </template>
        <template #destination>
          <v-text-field v-model="filters.destination" density="compact" label="Destination (POD)" @keyup.enter.stop="onClickFilters" />
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
        <template #hasDemurrage>
          <v-autocomplete
            v-model="filters.hasDemurrage"
            density="compact"
            label="Has demurrage"
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
        <template #statusHouseBl>
          <v-autocomplete
            v-model="filters.statusHouseBl"
            density="compact"
            label="Status House BL"
            :items="[
              { name: 'Pending', value: 'pending' },
              { name: 'All', value: 'all' },
            ]"
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
        <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn size="small" color="amber" @click="exportSeaImportRefsXlsx"
          ><v-icon>mdi-microsoft-excel</v-icon> Export excel
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
          :storage-key="'maritime-import-pagination'"
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
                <th v-else-if="col.key === 'masterBls'" class="text-left">Master BL(s)</th>
                <th v-else-if="col.key === 'houseBls'" class="text-left">House BL(s)</th>
                <th v-else-if="col.key === 'containers'" class="text-left">
                  <div class="flex items-center gap-2">
                    <div>Containers</div>
                    <v-icon @click="showDetails">
                      {{ !containerViewer ? 'mdi-eye-off' : 'mdi-eye' }}
                    </v-icon>
                  </div>
                </th>
                <th v-else-if="col.key === 'booking'" class="text-left">Booking</th>
                <th v-else-if="col.key === 'vesselVoyage'" class="text-left">Vessel - voyage</th>
                <th v-else-if="col.key === 'consignee'" class="text-left">Consignee</th>
                <th v-else-if="col.key === 'line'" class="text-left">Freight line</th>
                <th v-else-if="col.key === 'arrivalNotification'" class="text-left">Arrival notification</th>
                <th v-else-if="col.key === 'revalidation'" class="text-left">Revalidation</th>
                <th v-else-if="col.key === 'etd'" class="text-left">ETD</th>
                <th v-else-if="col.key === 'eta'" class="text-left">ETA</th>
                <th v-else-if="col.key === 'ata'" class="text-left">ATA</th>
                <th v-else-if="col.key === 'shipper'" class="text-left">Shipper</th>
                <th v-else-if="col.key === 'trash'"></th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in references.data"
              :key="`reference-${index}`"
              :class="{
                'dark:hover:bg-gray-700 hover:bg-slate-300': true,
                'bg-pink-100! dark:bg-pink-900!': isSystemTracker(item),
                'bg-red-100! dark:bg-red-900!': item.deleted_at,
              }"
            >
              <template v-for="col in visibleColumns" :key="col.key">
                <td v-if="col.key === 'actions'">
                  <div class="flex gap-2">
                    <v-btn
                      v-if="!item.deleted_at && hasPermission('sea-import-references-edit')"
                      variant="text"
                      icon="mdi-pencil-outline"
                      color="blue-lighten-2"
                      density="compact"
                      @click="viewMaritimeReference(item)"
                    ></v-btn>
                    <v-btn
                      v-if="hasPermission('sea-import-references-view') && canViewReference(item)"
                      variant="text"
                      icon="mdi-eye-outline"
                      color="green-lighten-2"
                      density="compact"
                      @click="viewDetails(item)"
                    ></v-btn>
                    <v-btn
                      v-if="isLiveTrackable(item)"
                      variant="text"
                      icon="mdi-earth"
                      :color="getLiveCarrierColor(item)"
                      density="compact"
                      @click="openLiveTracking(item)"
                      title="Live Carrier Tracking"
                    ></v-btn>
                  </div>
                </td>
                <td v-else-if="col.key === 'reference'" class="whitespace-nowrap">
                  <UserInfoBadge :item="item">
                    <ServiceNumberLabel :service="item" />
                  </UserInfoBadge>
                  <v-chip v-if="item.deleted_at" color="red" size="x-small" variant="elevated" class="flex items-center gap-2 mb-2 font-bold">CANCELLED</v-chip><br>
                  <v-alert v-if="item.reason_deleted" color="red" size="x-small" variant="elevated" class="flex items-center gap-2 mb-2 font-bold" v-html="splitText(item.reason_deleted)"></v-alert>
                  <v-chip
                    v-if="isLiveTrackable(item)"
                    size="x-small"
                    :color="getLiveCarrierColor(item)"
                    variant="elevated"
                    class="font-bold"
                  >
                    {{ getLiveCarrierLabel(item) }}
                  </v-chip>
                </td>
                <td v-else-if="col.key === 'masterBls'">
                  <div class="flex flex-col gap-1">
                    <v-chip
                      v-for="(bl, index) in item.master_bls"
                      :key="`master-bl-${index}`"
                      size="small"
                      color="primary"
                    >
                      <v-icon v-if="bl.can_be_delivered != null">{{ getDeliveredIcon(bl) }}</v-icon
                      >{{ bl.name }}
                    </v-chip>
                  </div>
                </td>
                <td v-else-if="col.key === 'houseBls'">
                  <div class="flex flex-col gap-1">
                    <v-chip
                      v-for="(bl, index) in item.house_bls"
                      :key="`house-bl-${index}`"
                      size="small"
                      color="blue-lighten-2"
                    >
                      <v-icon v-if="bl.can_be_delivered != null">{{ getDeliveredIcon(bl) }}</v-icon
                      >{{ bl.name }}
                    </v-chip>
                  </div>
                </td>
                <td v-else-if="col.key === 'containers'">
                  <div v-if="!containerViewer" class="flex justify-center">
                    <v-icon>mdi-eye-off</v-icon>
                  </div>
                  <div v-if="containerViewer">
                    <div class="flex flex-col gap-1">
                      <v-chip
                        v-for="(container, index) in item.containers"
                        :key="`container-${index}`"
                        size="small"
                        color="green-lighten-2"
                      >
                        {{ container.container_number }} {{ container.container_type?.name }}
                      </v-chip>
                    </div>
                  </div>
                </td>
                <td v-else-if="col.key === 'booking'">
                  <v-chip v-if="item.booking_number" size="small" color="teal">{{ item.booking_number }}</v-chip>
                </td>
                <td v-else-if="col.key === 'vesselVoyage'">{{ item.voyage_discharge?.name }}</td>
                <td v-else-if="col.key === 'consignee'">
                  <v-icon v-if="isSystemTracker(item)" size="small" color="pink">mdi-storefront-outline</v-icon>
                  {{ item.consignee?.name }}
                </td>
                <td v-else-if="col.key === 'line'">{{ item.line?.name }}</td>
                <td v-else-if="col.key === 'arrivalNotification'">
                  <div v-if="item.arrival_notys?.length <= 0">
                    <v-chip size="small" color="error">Not sent</v-chip>
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
                <td v-else-if="col.key === 'revalidation'">
                  <div v-if="!item.revalidation">
                    <v-chip size="small" color="error">Pending</v-chip>
                  </div>
                  <div v-if="item.revalidation && item.revalidation?.sent_at == null">
                    <v-chip size="small" color="warning">Pending send</v-chip>
                  </div>
                  <div v-if="item.revalidation?.sent_at">
                    <v-chip size="small" color="lime"> Sent @ {{ formatDateString(item.revalidation.sent_at) }} </v-chip>
                  </div>
                </td>
                <td v-else-if="col.key === 'etd'">{{ item.etd_date }}</td>
                <td v-else-if="col.key === 'eta'">
                  {{ item.voyage_discharge?.eta_date || item.eta_date || '-' }}
                </td>
                <td v-else-if="col.key === 'ata'">
                  <div v-if="item.voyage_discharge == null">No data</div>
                  <v-chip v-if="item.voyage_discharge != null" size="small">{{
                    item.voyage_discharge?.arrival_date || 'TBC'
                  }}</v-chip>
                </td>
                <td v-else-if="col.key === 'shipper'">{{ item.shipper?.name }}</td>
                <td v-else-if="col.key === 'trash'">
                  <TrashButton :item="item" :form-deletion="formDeletion" serviceType="sea-import" @click="confirmDeletion" />
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
          :storage-key="'maritime-import-pagination'"
          @page-change="onPageChange"
          @per-page-change="onPerPageChange"
        />
      </v-card-text>
    </v-card>

    <PremiumLiveTrackingModal
      v-if="showLiveTrackingModal"
      v-model="showLiveTrackingModal"
      :referencia-id="selectedReferenciaForTracking?.id"
      :referencia="selectedReferenciaForTracking"
    />
  </div>
</template>
<script setup lang="ts">
import { flattenArraysToCommaSeparatedString } from '~/utils/formatters'
import { sourceSystems, deletedStatus } from '~/utils/data/systemData'
import { useTableFilters } from '~/composables/useTableFilters'
import PremiumLiveTrackingModal from '@/components/tracking/PremiumLiveTrackingModal.vue'

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

const containerViewer = ref(true)

const FILTER_VISIBILITY_KEY = 'sea-import-filters-visible'
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
  eta: '',
  containerNumber: '',
  bookingNum: '',
  ffNoteFolio: '',
  line_id: '',
  deleted_status: '',
  trackerRef: '',
  hasRevalidation: null as number | null,
  invoiceNumber: '',
  origin: '',
  destination: '',
  poNum: '',
  hasTmInvoices: null as number | null,
  hasWmInvoices: null as number | null,
  hasDemurrage: null as number | null,
  source_system_id: null as number | null,
  statusHouseBl: null as string | null,
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
  { key: 'masterBl', label: 'Master BL', span: 2 },
  { key: 'houseBl', label: 'House BL', span: 2 },
  { key: 'bookingNum', label: 'Booking number', span: 2 },
  { key: 'containerNumber', label: 'Container #', span: 2 },
  { key: 'ffNoteFolio', label: 'CN/DN #', span: 2 },
  { key: 'consignee', label: 'Consignee', span: 2 },
  { key: 'freightForwarder', label: 'Freight forwarder', span: 2 },
  { key: 'shipper', label: 'Shipper', span: 2 },
  { key: 'vesselVoyage', label: 'Vessel / Voyage', span: 2 },
  { key: 'eta', label: 'ETA', span: 2 },
  { key: 'line', label: 'Freight line', span: 2 },
  { key: 'hasRevalidation', label: 'Has revalidation', span: 2 },
  { key: 'status', label: 'Status', span: 2 },
  { key: 'invoiceNumber', label: 'Invoice #', span: 2, visible: false },
  { key: 'origin', label: 'Origin (POL)', span: 2, visible: false },
  { key: 'destination', label: 'Destination (POD)', span: 2, visible: false },
  { key: 'poNum', label: 'PO #', span: 2, visible: false },
  { key: 'hasTmInvoices', label: 'Has TM invoices', span: 2, visible: false },
  { key: 'hasWmInvoices', label: 'Has WM invoices', span: 2, visible: false },
  { key: 'hasDemurrage', label: 'Has demurrage', span: 2, visible: false },
  { key: 'sourceSystem', label: 'Source system', span: 2, visible: false },
  { key: 'statusHouseBl', label: 'Status House BL', span: 2, visible: false },
]

// Model keys backing each layout filter, used to clear values when the user
// hides a filter so hidden filters never affect the search.
const filterModelKeys: Record<string, string[]> = {
  referencia: ['referencia', 'referencias'],
  trackerRef: ['trackerRef'],
  masterBl: ['masterBl'],
  houseBl: ['houseBl'],
  bookingNum: ['bookingNum'],
  containerNumber: ['containerNumber'],
  ffNoteFolio: ['ffNoteFolio'],
  consignee: ['consignee_id', 'consignee_name'],
  freightForwarder: ['freight_forwarder_id'],
  shipper: ['shipper_id'],
  vesselVoyage: ['vessel_id', 'voyage_departure_id'],
  eta: ['eta'],
  line: ['line_id'],
  hasRevalidation: ['hasRevalidation'],
  status: ['deleted_status'],
  invoiceNumber: ['invoiceNumber'],
  origin: ['origin'],
  destination: ['destination'],
  poNum: ['poNum'],
  hasTmInvoices: ['hasTmInvoices'],
  hasWmInvoices: ['hasWmInvoices'],
  hasDemurrage: ['hasDemurrage'],
  sourceSystem: ['source_system_id'],
  statusHouseBl: ['statusHouseBl'],
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
  { key: 'masterBls', label: 'Master BL(s)' },
  { key: 'houseBls', label: 'House BL(s)' },
  { key: 'containers', label: 'Containers' },
  { key: 'booking', label: 'Booking' },
  { key: 'vesselVoyage', label: 'Vessel - voyage' },
  { key: 'consignee', label: 'Consignee' },
  { key: 'line', label: 'Freight line' },
  { key: 'arrivalNotification', label: 'Arrival notification' },
  { key: 'revalidation', label: 'Revalidation' },
  { key: 'etd', label: 'ETD' },
  { key: 'eta', label: 'ETA' },
  { key: 'ata', label: 'ATA' },
  { key: 'shipper', label: 'Shipper' },
  { key: 'trash', label: 'Delete' },
]

const columnsLayout = useTableColumns('table-columns:sea-import', tableColumnDefs)
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
  storageKey: 'maritime-import-filters',
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

// Expose getFilteredUrl for child components and back navigation
const backUrl = computed(() => getFilteredUrl('/maritime/import'))
provide('catalogBackUrl', backUrl)

const isSystemTracker = (item: any) => {
  return item.source_system_id === 2
}

const showLiveTrackingModal = ref(false)
const selectedReferenciaForTracking = ref<any>(null)

const isLiveTrackable = (item: any) => {
  if (!item || !item.line) return false
  const name = (item.line.name || '').toLowerCase()
  const comm = (item.line.commercial_name || '').toLowerCase()
  const code = (item.line.code || '').toUpperCase()

  return (
    name.includes('hapag') || comm.includes('hapag') || name.includes('lloyd') || code === 'HLCU' || code === 'HLAG'
  )
}

const getLiveCarrierLabel = (item: any) => {
  const name = (item.line?.name || '').toLowerCase()
  return name.includes('cosco') ? 'Live COSCO' : 'Live Hapag'
}

const getLiveCarrierColor = (item: any) => {
  const name = (item.line?.name || '').toLowerCase()
  return name.includes('cosco') ? 'teal-darken-1' : 'deep-orange-darken-1'
}

const openLiveTracking = (item: any) => {
  selectedReferenciaForTracking.value = item
  showLiveTrackingModal.value = true
}

interface SearchParams {
  name?: string
  id?: number
  [key: string]: any // Allow additional keys, but we will filter them
}

const getDeliveredIcon = (item: any) => {
  return item.can_be_delivered === 1 ? 'mdi-check' : 'mdi-close'
}

const showDetails = () => {
  containerViewer.value = !containerViewer.value
}

const searchLines = async (search: SearchParams) => {
  try {
    const response = await $api.lines.searchLines({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching freight lines',
    })
    console.error(error)
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
    const response = await $api.referencias.getSeaImportReferencias({
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

const exportSeaImportRefsXlsx = async () => {
  try {
    loadingStore.start()

    const response = (await $api.referencias.exportImportXlsxReport({
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
    link.download = `sea-import-report-${timestamp}.xlsx`
    link.click()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSeaImportFilters = async () => {
  const response = await $api.referencias.getSeaImportFilters()

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

const clearFilters = async () => {
  await resetFiltersComposable()
  unifiedVesselVoyageSearch.value = null
  references.value.current_page = 1
  await getSeaImportReferences()
}

const viewMaritimeReference = (item: any) => {
  router.push(`/maritime/import/${item.id}`)
}

const viewDetails = (item: any) => {
  router.push(`/maritime/import/view-details-${item.id}`)
}

const confirmDeletion = async (item: any) => {
  try {
    loadingStore.start()
    await $api.referencias.deleteReference(item.id.toString(), { body: { reason: formDeletion.value.reason, } })
    snackbar.add({ type: 'success', text: `Reference ${item.reference_number} cancelled successfully` })
    await getSeaImportReferences()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error cancelling reference' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(() => {
  getSeaImportFilters()
  // Sync current page from composable after URL is loaded
  references.value.current_page = currentPage.value
  getSeaImportReferences()
})
</script>
