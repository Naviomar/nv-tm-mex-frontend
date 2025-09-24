<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-12 gap-2">
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
          />
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
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.vessel_id"
            density="compact"
            label="Vessel"
            :items="catalogs.vessels"
            item-title="name"
            item-value="id"
          />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.voyage_id"
            density="compact"
            label="Voyage"
            :items="catalogs.voyages"
            item-title="name"
            item-value="id"
          />
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
        <div class="col-span-4">
          <v-autocomplete
            density="compact"
            label="Vessel - voyage"
            v-model="filters.voyage_departure_id"
            :items="catalogs.voyage_discharges"
            item-title="name"
            item-value="id"
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
    <v-card>
      <v-card-text>
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
        <v-table density="compact" fixed-header height="75vh">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
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
                <div class="flex gap-2">
                  <v-btn
                    v-if="item.deleted_at == null"
                    variant="text"
                    icon="mdi-pencil-outline"
                    color="blue-lighten-2"
                    density="compact"
                    @click="viewMaritimeReference(item)"
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
                    #{{ index + 1 }} -
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
                <TrashButton :item="item" />
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
import { flattenArraysToCommaSeparatedString } from '~/utils/formatters'
import { sourceSystems, deletedStatus, systemCountries } from '~/utils/data/systemData'
import { prefixYears } from '~/utils/date'
const { $api } = useNuxtApp()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const currentYear = new Date().getFullYear()

const catalogs = ref({
  consignees: [] as any,
  freights: [] as any,
  vessels: [] as any,
  voyages: [] as any,
  voyage_discharges: [] as any,
  lines: [] as any,
})

const containerViewer = ref(true)

const filters = ref({
  countryCode: null,
  year: '',
  referencia: '',
  referencias: [] as any,
  masterBl: '',
  houseBl: '',
  consignee_id: '',
  freight_forwarder_id: '',
  vessel_id: '',
  voyage_id: '',
  voyage_departure_id: '',
  eta: '',
  containerNumber: '',
  bookingNum: '',
  line_id: '',
  source_system_id: null,
  deleted_status: '',
  trackerRef: '',
  hasRevalidation: null,
  statusHouseBl: null,
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

const isSystemTracker = (item: any) => {
  return item.source_system_id === 2
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
  }
}

const onClickFilters = async () => {
  // set current page to 1
  references.value.current_page = 1
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
  }
}

const removeReferencia = (index: number) => {
  filters.value.referencias.splice(index, 1)
}

const onClickPagination = async (page: number) => {
  references.value.current_page = page
  await getSeaImportReferences()
}

const getSeaImportReferences = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.referencias.getSeaImportReferencias({
      query: {
        page: references.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    references.value = response as any
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

const clearFilters = async () => {
  filters.value = {
    countryCode: null,
    year: '',
    referencia: '',
    referencias: [],
    masterBl: '',
    houseBl: '',
    consignee_id: '',
    freight_forwarder_id: '',
    vessel_id: '',
    voyage_id: '',
    voyage_departure_id: '',
    eta: '',
    containerNumber: '',
    bookingNum: '',
    line_id: '',
    source_system_id: null,
    deleted_status: '',
    trackerRef: '',
    hasRevalidation: null,
    statusHouseBl: null,
  }
  // set page to 1
  references.value.current_page = 1
  await getSeaImportReferences()
}

const viewMaritimeReference = (item: any) => {
  router.push(`/maritime/import/${item.id}`)
}

const confirmDeletion = (item: any) => {
  router.push(`/maritime/import/view-details-${item.id}`)
}

onMounted(() => {
  getSeaImportFilters()
  getSeaImportReferences()
})
</script>
