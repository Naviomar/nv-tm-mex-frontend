<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.year"
            :items="prefixYears"
            density="compact"
            label="Year"
            @keyup.enter="getAirImportReferences"
          />
        </div>
        <div class="col-span-2">
          <v-text-field
            v-model="filters.referencia"
            density="compact"
            label="Add reference #"
            hint="Press Enter to add numbers"
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
            v-model="filters.masterAwb"
            density="compact"
            label="Master AWB"
            @keyup.enter="getAirImportReferences"
          />
        </div>
        <div class="col-span-2">
          <v-text-field
            v-model="filters.houseAwb"
            density="compact"
            label="House AWB"
            @keyup.enter="getAirImportReferences"
          />
        </div>
        <div class="col-span-4">
          <ACustomerSearch v-model="filters.consignee_id" />
        </div>
        <div class="col-span-4">
          <AFreightForwarderSearch v-model="filters.origin_ff_id" label="Freight Forwarder origin" />
        </div>
        <div class="col-span-2">
          <AAirlineSearch v-model="filters.airline_id" />
        </div>
        <div class="col-span-2">
          <v-text-field
            v-model="filters.flightNum"
            density="compact"
            label="Flight number"
            @keyup.enter="getAirImportReferences"
          />
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
            v-model="filters.has_arrival_noty"
            density="compact"
            label="Has arrival noty"
            :items="[
              { name: 'Yes', value: 1 },
              { name: 'No', value: 0 },
            ]"
            item-title="name"
            item-value="value"
          />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.trackerRef" density="compact" label="Tracker ref" hint="Comma separated" />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            @keyup.enter="getAirImportReferences"
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
        <v-btn size="small" class="" color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn size="small" color="amber" @click="exportAirRefsXlsx"
          ><v-icon>mdi-microsoft-excel</v-icon> Export Air Report
        </v-btn>
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
        <v-table density="compact" fixed-header height="75vh">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left"># Reference</th>
              <th class="text-left">Master AWB</th>
              <th class="text-left">House AWB</th>
              <th class="text-left">Origin F.F.</th>
              <th class="text-left">Consignee</th>
              <th class="text-left">Origin</th>
              <th class="text-left">Destination</th>
              <th class="text-left">Arrival noty</th>
              <th class="text-left">Revalidation</th>
              <th class="text-left">Airline</th>
              <th class="text-left">Flight number</th>
              <th class="text-left">Departure</th>
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
              <td>
                <div class="flex">
                  <v-btn
                    variant="text"
                    icon="mdi-pencil-outline"
                    color="blue-lighten-2"
                    density="compact"
                    @click="viewReference(item)"
                  ></v-btn>
                  <v-btn
                    variant="text"
                    icon="mdi-eye-outline"
                    color="green-lighten-2"
                    density="compact"
                    @click="confirmDeletion(item)"
                  ></v-btn>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="item">
                  <ServiceNumberLabel :service="item" />
                </UserInfoBadge>
              </td>
              <td>
                <v-chip size="small" color="primary">
                  {{ item.master_awb }}
                </v-chip>
              </td>
              <td>
                <v-chip size="small" color="primary">
                  {{ item.house_awb }}
                </v-chip>
              </td>
              <td>{{ item.origin_ff?.name }}</td>
              <td>
                <v-icon v-if="isSystemTracker(item)" size="small" color="pink">mdi-storefront-outline</v-icon>
                {{ item.consignee?.name }}
              </td>
              <td>{{ item.origin }}</td>
              <td>{{ item.destination }}</td>
              <td>
                <div v-for="(noty, index) in item.arrival_notys" :key="`noty-${index}`" class="mb-2">
                  <v-chip size="small" color="green"> Sent @ {{ formatDateString(noty.created_at) }} </v-chip>
                </div>
                <v-chip v-if="item.arrival_notys.length == 0" size="small" color="red">Pending</v-chip>
              </td>
              <td>
                <div v-for="(noty, index) in item.sent_releases" :key="`revalid-${index}`" class="mb-2">
                  <v-chip size="small" color="green"> Sent @ {{ formatDateString(noty.created_at) }} </v-chip>
                </div>
                <v-chip v-if="item.sent_releases.length == 0" size="small" color="red">Pending</v-chip>
              </td>
              <td>{{ item.airline?.name }}</td>
              <td>{{ getFirstRouteFlightNum(item) }}</td>
              <td>{{ getFirstRouteDeparture(item) }}</td>
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
import { sourceSystems, deletedStatus } from '@/utils/data/systemData'
import { flattenArraysToCommaSeparatedString } from '~/utils/formatters'
import { useTableFilters } from '~/composables/useTableFilters'

const { $api } = useNuxtApp()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const catalogs = ref<any>({
  customers: [],
  ffs: [],
  airlines: [],
})

// Initial filter values
const initialFilters = {
  year: '',
  referencia: '',
  referencias: [] as string[],
  has_arrival_noty: null as number | null,
  masterAwb: '',
  houseAwb: '',
  consignee_id: '',
  origin_ff_id: '',
  destination_ff_id: '',
  airline_id: '',
  flightNum: '',
  source_system_id: '',
  trackerRef: '',
  deleted_status: '',
}

// Use the table filters composable for URL persistence
const {
  filters,
  currentPage,
  syncToUrl,
  resetFilters: resetFiltersComposable,
  getFilteredUrl,
} = useTableFilters(initialFilters, {
  storageKey: 'air-import-filters',
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

const onClickPagination = async (page: number) => {
  currentPage.value = page
  references.value.current_page = page
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

const exportAirRefsXlsx = async () => {
  try {
    loadingStore.start()

    const response = (await $api.airImport.exportXlsxReport({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
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

const confirmDeletion = (item: any) => {
  router.push(`/air/import/view-details-${item.id}`)
}

onMounted(async () => {
  await getAirExportFilters()
  // Sync current page from composable after URL is loaded
  references.value.current_page = currentPage.value
  getAirImportReferences()
})
</script>
