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
      <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
        <!-- Filters omitted for brevity, keeping original fields -->
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.countryCode"
            :items="systemCountries"
            item-title="name"
            item-value="code"
            density="compact"
            label="Country"
          />
        </div>
        <div class="col-span-2">
          <v-autocomplete v-model="filters.year" :items="prefixYears" density="compact" label="Year" />
        </div>
        <div class="col-span-2">
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
        <div class="col-span-2">
          <v-text-field v-model="filters.masterBl" density="compact" label="Master BL" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.houseBl" density="compact" label="House BL" />
        </div>
        <div class="col-span-2">
          <ACustomerSearch v-model="filters.consignee_id" />
        </div>
        <div class="col-span-2">
          <AFreightForwarderSearch v-model="filters.freight_forwarder_id" />
        </div>
        <div class="col-span-4">
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
                <v-icon size="14" :color="item.raw.type === 'vessel' ? 'blue' : 'teal'">{{ item.raw.type === 'vessel' ? 'mdi-ferry' : 'mdi-map-marker-path' }}</v-icon>
                <span class="text-truncate text-body-2">{{ item.raw.display_name }}</span>
              </span>
            </template>
          </v-autocomplete>
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.eta" type="date" density="compact" label="ETA" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.containerNumber" density="compact" label="Container #" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.bookingNum" density="compact" label="Booking number" />
        </div>
        <div class="col-span-2">
          <AGlobalSearch :onSearch="searchLines" v-model="filters.line_id" label="Freight line" />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.source_system_id"
            density="compact"
            label="Source system"
            :items="sourceSystems"
            item-title="name"
            item-value="id"
          />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            hide-details
          />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.trackerRef" density="compact" label="Tracker ref" hint="Comma separated" />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.hasRevalidation"
            density="compact"
            label="Has revalidation"
            :items="[
              { name: 'Yes', value: 1 },
              { name: 'No', value: 0 },
            ]"
            item-title="name"
            item-value="value"
            hide-details
          />
        </div>
        <div class="col-span-2">
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
          />
        </div>
      </div>
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
        <div class="catalog-table-wrapper">
        <v-table density="compact" fixed-header>
          <thead>
            <tr>
              <th class="text-left" width="80">Actions</th>
              <th class="text-left"># Reference</th>
              <th class="text-left">Master BL(s)</th>
              <th class="text-left">House BL(s)</th>
              <th class="text-left">
                <div class="flex items-center gap-2">
                  <div>Containers</div>
                  <v-icon @click="showDetails">
                    {{ !containerViewer ? 'mdi-eye-off' : 'mdi-eye' }}
                  </v-icon>
                </div>
              </th>
              <th class="text-left">Vessel - voyage</th>
              <th class="text-left">Consignee</th>
              <th class="text-left">Freight line</th>

              <th class="text-left">Arrival notification</th>
              <th class="text-left">Revalidation</th>
              <th class="text-left">ETD</th>
              <th class="text-left">ETA</th>
              <th class="text-left">ATA</th>
              <th class="text-left">Shipper</th>
              <th></th>
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
              <td>
                <div class="flex gap-1">
                  <v-btn
                    v-if="!item.deleted_at && hasPermission('sea-import-references-edit')"
                    variant="text"
                    icon="mdi-pencil-outline"
                    color="blue-lighten-2"
                    density="compact"
                    @click="viewMaritimeReference(item)"
                  ></v-btn>
                  <v-btn
                    v-if="hasPermission('sea-import-references-view')"
                    variant="text"
                    icon="mdi-eye-outline"
                    color="green-lighten-2"
                    density="compact"
                    @click="viewDetails(item)"
                  ></v-btn>
                  <!-- Premium Live Track Button -->
                  <v-btn
                    v-if="isLiveTrackable(item)"
                    variant="text"
                    icon="mdi-earth"
                    :color="getLiveCarrierColor(item)"
                    density="compact"
                    class="animate-pulse"
                    @click="openLiveTracking(item)"
                    title="Live Carrier Tracking"
                  ></v-btn>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <div class="flex flex-col items-start gap-1">
                  <UserInfoBadge :item="item">
                    <ServiceNumberLabel :service="item" />
                  </UserInfoBadge>
                  <v-chip v-if="item.deleted_at" color="red" size="x-small" variant="elevated" class="ml-1 font-bold">CANCELLED</v-chip>
                  <!-- Carrier Badge -->
                  <v-chip 
                    v-if="isLiveTrackable(item)" 
                    size="x-small" 
                    :color="getLiveCarrierColor(item)" 
                    variant="elevated" 
                    class="font-bold border border-white/20 shadow-sm"
                  >
                    {{ getLiveCarrierLabel(item) }}
                  </v-chip>
                </div>
              </td>
              <td>
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
              <td>
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
              <td>
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
              <td>{{ item.voyage_discharge?.name }}</td>
              <td>
                <v-icon v-if="isSystemTracker(item)" size="small" color="pink">mdi-storefront-outline</v-icon>
                {{ item.consignee?.name }}
              </td>
              <td>{{ item.line?.name }}</td>

              <td>
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
              <td>
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
              <td>{{ item.etd_date }}</td>
              <td>{{ item.eta_date }}</td>
              <td>
                <div v-if="item.voyage_discharge == null">No data</div>
                <v-chip v-if="item.voyage_discharge != null" size="small">{{
                  item.voyage_discharge?.arrival_date || 'TBC'
                }}</v-chip>
              </td>
              <td>{{ item.shipper?.name }}</td>
              <td>
                <TrashButton :item="item" serviceType="sea-import" @click="confirmDeletion" />
              </td>
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

    <!-- Real-time Tracking Modal Integration -->
    <PremiumLiveTrackingModal
      v-model="showLiveTrackingModal"
      :referencia-id="selectedReferenciaForTracking?.id"
      :referencia="selectedReferenciaForTracking"
    />
  </div>
</template>
<script setup lang="ts">
import { flattenArraysToCommaSeparatedString } from '~/utils/formatters'
import { sourceSystems, deletedStatus, systemCountries } from '~/utils/data/systemData'
import { prefixYears } from '~/utils/date'
import { useTableFilters } from '~/composables/useTableFilters'

const { $api } = useNuxtApp()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const { hasPermission } = useCheckUser()

const catalogs = ref({
  consignees: [] as any,
  freights: [] as any,
  vessels: [] as any,
  voyages: [] as any,
  voyage_discharges: [] as any,
  lines: [] as any,
})

const containerViewer = ref(true)

// Live Tracking Modal State
const showLiveTrackingModal = ref(false)
const selectedReferenciaForTracking = ref<any>(null)

const FILTER_VISIBILITY_KEY = 'sea-import-filters-visible'
const showFilters = ref(sessionStorage.getItem(FILTER_VISIBILITY_KEY) !== 'false')
const toggleFilters = () => {
  showFilters.value = !showFilters.value
  sessionStorage.setItem(FILTER_VISIBILITY_KEY, String(showFilters.value))
}

// Initial filter values
const initialFilters = {
  countryCode: null as string | null,
  year: '',
  referencia: '',
  referencias: [] as string[],
  masterBl: '',
  houseBl: '',
  consignee_id: '',
  freight_forwarder_id: '',
  vessel_id: '',
  voyage_departure_id: '',
  eta: '',
  containerNumber: '',
  bookingNum: '',
  line_id: '',
  source_system_id: null as number | null,
  deleted_status: '',
  trackerRef: '',
  hasRevalidation: null as number | null,
  statusHouseBl: null as string | null,
}

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

const backUrl = computed(() => getFilteredUrl('/maritime/import'))
provide('catalogBackUrl', backUrl)

const isSystemTracker = (item: any) => {
  return item.source_system_id === 2
}

// Tracking Utility Methods
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
  [key: string]: any 
}

const getDeliveredIcon = (item: any) => {
  return item.can_be_delivered === 1 ? 'mdi-check' : 'mdi-close'
}

const showDetails = () => {
  containerViewer.value = !containerViewer.value
}

const searchLines = async (search: SearchParams) => {
  try {
    const response = await $api.lines.searchLines({ query: search })
    return response
  } catch (error) {
    snackbar.add({ type: 'error', text: 'Error fetching freight lines' })
    console.error(error)
  }
}

const onClickFilters = async () => {
  addReferencia()
  currentPage.value = 1
  references.value.current_page = 1
  await syncToUrl()
  await getSeaImportReferences()
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
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    references.value = response as any
    references.value.current_page = currentPage.value
    
    if (references.value.data.length === 0) {
      snackbar.add({ type: 'info', text: 'No records found' })
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => { loadingStore.stop() }, 250)
  }
}

const exportSeaImportRefsXlsx = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referencias.exportImportXlsxReport({
      query: { ...flattenArraysToCommaSeparatedString(filters.value) },
    })) as any

    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '')
    link.download = `sea-import-report-${timestamp}.xlsx`
    link.click()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => { loadingStore.stop() }, 250)
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
    await $api.referencias.deleteReference(item.id.toString())
    snackbar.add({ type: 'success', text: `Reference ${item.reference_number} cancelled successfully` })
    await getSeaImportReferences()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error cancelling reference' })
  } finally {
    setTimeout(() => { loadingStore.stop() }, 250)
  }
}

onMounted(() => {
  getSeaImportFilters()
  references.value.current_page = currentPage.value
  getSeaImportReferences()
})
</script>