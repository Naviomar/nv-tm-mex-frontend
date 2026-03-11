<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-12 gap-2">
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
          <v-text-field
            v-model="filters.masterBl"
            density="compact"
            label="Master BL"
          />
        </div>
        <div class="col-span-2">
          <v-text-field
            v-model="filters.houseBl"
            density="compact"
            label="House BL"
          />
        </div>
        <div class="col-span-4">
          <AGlobalSearch
            v-model="filters.consignee_id"
            :onSearch="searchCustomers"
            validate-key="consignee_id"
            label="Customer"
          />
        </div>
        <div class="col-span-4">
          <AGlobalSearch v-model="filters.ffId" :onSearch="searchFfs" validate-key="ffId" label="Freight Forwarder" />
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
              <v-chip size="small" :color="item.raw.type === 'vessel' ? 'blue' : 'teal'" variant="outlined">
                <v-icon start>{{ item.raw.type === 'vessel' ? 'mdi-ferry' : 'mdi-map-marker-path' }}</v-icon>
                {{ item.raw.display_name }}
              </v-chip>
            </template>
          </v-autocomplete>
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.eta" type="date" density="compact" label="ETA" />
        </div>
        <div class="col-span-2">
          <v-text-field
            v-model="filters.containerNumber"
            density="compact"
            label="Container #"
          />
        </div>
        <div class="col-span-2">
          <v-text-field
            v-model="filters.bookingNum"
            density="compact"
            label="Booking number"
          />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.line_id"
            density="compact"
            label="Freight line"
            :items="catalogs.lines"
            item-title="name"
            item-value="id"
          />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.has_demurrage"
            density="compact"
            label="Demurrages generated"
            :items="[
          { title: 'Yes', value: '1' },
          { title: 'No', value: '0' }
        ]"
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
        <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
      </div>
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
        <v-table density="compact" fixed-header>
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Line</th>
              <th class="text-left">Vessel / Voyage / Dest</th>
              <th class="text-left">Voyage Demurrage init day</th>
              <th class="text-left">Service #</th>
              <th class="text-left">Condition type</th>
              <th class="text-left">Customer</th>
              <th class="text-left">Master BL(s)</th>
              <th class="text-left">Container(s)</th>
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
              <td>
                <v-btn
                  variant="text"
                  icon="mdi-eye-outline"
                  color="blue-lighten-2"
                  density="compact"
                  @click="viewMaritimeReference(item)"
                ></v-btn>
              </td>
              <td>{{ item.line?.commercial_name }}</td>
              <td>{{ item.voyage_discharge?.short_name }}</td>
              <td>
                <v-chip v-if="item.voyage_discharge?.init_demurrage_at" color="success" size="small" variant="outlined">
                  {{ item.voyage_discharge?.init_demurrage_at }}
                </v-chip>
                <v-chip v-else color="error" size="small" variant="outlined"> No </v-chip>
              </td>
              <td>{{ item.reference_number }}</td>
              <td>{{ item.cargo_type }}</td>
              <td>{{ item.consignee?.name }}</td>
              <td>
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
              <td>
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

const unifiedVesselVoyageItems = computed(() => {
  const vessels = catalogs.value.vessels.map((vessel: any) => ({
    id: `vessel-${vessel.id}`,
    display_name: vessel.name,
    type: 'vessel',
    original_id: vessel.id,
  }))

  const voyages = catalogs.value.voyage_discharges.map((voyage: any) => ({
    id: `voyage-${voyage.id}`,
    display_name: voyage.short_name,
    type: 'voyage',
    original_id: voyage.id,
  }))

  return [...vessels, ...voyages]
})

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
}

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
  await getSeaImportFilters()
  // Sync current page from composable after URL is loaded
  references.value.current_page = currentPage.value
  await getSeaImportReferences()
})
</script>
