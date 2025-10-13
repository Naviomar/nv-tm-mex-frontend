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
          />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.masterBl" density="compact" label="Master BL" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.houseBl" density="compact" label="House BL" />
        </div>
        <div class="col-span-4">
          <ACustomerSearch v-model="filters.consignee_id" />
        </div>
        <div class="col-span-4">
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
          <v-text-field v-model="filters.origin" density="compact" label="Origin" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.destination" density="compact" label="Destination" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.eta" type="date" density="compact" label="ETA" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.containerNumber" density="compact" label="Container #" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.bookingNum" density="compact" label="Booking line" />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.bookingTm" density="compact" label="Booking TM" />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.line_id"
            density="compact"
            label="Line"
            :items="catalogs.lines"
            item-title="name"
            item-value="id"
          />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.has_sailed"
            density="compact"
            label="Has sailed?"
            :items="[
              {
                name: 'Yes',
                value: 1,
              },
              {
                name: 'No',
                value: 0,
              },
            ]"
            item-title="name"
            item-value="value"
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
        <div class="flex gap-2">
          <v-chip color="green"><span class="inline-block w-5 h-5 bg-lime-200 mr-2"></span>Ship sailed</v-chip>
        </div>

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
              <th class="text-left">Freight line</th>
              <th class="text-left">Shipper</th>
              <th class="text-left">Consignee</th>
              <th class="text-left">Master BL(s)</th>
              <th class="text-left">House BL(s)</th>
              <th class="text-left">Total containers</th>
              <th class="text-left">
                <div class="flex items-center gap-2">
                  <div>Containers</div>
                  <v-icon @click="showDetails">
                    {{ !containerViewer ? 'mdi-eye-off' : 'mdi-eye' }}
                  </v-icon>
                </div>
              </th>
              <th class="text-left">Vessel - Voyage</th>
              <th class="text-left">POL</th>
              <th class="text-left">POD</th>
              <th class="text-left">Booking TM</th>
              <th class="text-left">Created</th>
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
              <td>
                <div class="flex">
                  <v-btn
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
              <td>{{ item.line?.name }}</td>
              <td>{{ item.consignee?.name }}</td>
              <td>{{ item.shipper?.name }}</td>
              <td>
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
              <td>
                <div class="flex flex-col gap-1">
                  <v-chip v-for="(bl, index) in item.house_bls" :key="`house-bl-${index}`" size="small" color="primary">
                    <v-icon v-if="bl.type">mdi-check</v-icon>{{ bl.name }}
                  </v-chip>
                </div>
              </td>
              <td>{{ item.containers.length }}</td>
              <td class="whitespace-nowrap">
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
              <td>{{ item.voyage_discharge?.short_name }}</td>
              <td>{{ item.pol?.country_port }}</td>
              <td>{{ item.pod?.country_port }}</td>
              <td>{{ item.booking_number }}</td>
              <td>{{ item.booking_tm }}</td>
              <td class="whitespace-nowrap">{{ formatDateString(item.created_at) }}</td>
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
import { deletedStatus } from '~/utils/data/systemData'
import { flattenArraysToCommaSeparatedString } from '~/utils/formatters'
const { $api } = useNuxtApp()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const catalogs = ref({
  consignees: [] as any,
  freights: [] as any,
  vessels: [] as any,
  voyages: [] as any,
  lines: [] as any,
})

const filters = ref({
  year: '',
  referencia: '',
  referencias: [] as any,
  masterBl: '',
  houseBl: '',
  consignee_id: '',
  freight_forwarder_id: '',
  vessel_id: '',
  voyage_id: '',
  origin: '',
  destination: '',
  eta: '',
  containerNumber: '',
  bookingNum: '',
  bookingTm: null,
  line_id: '',
  has_sailed: null,
  deleted_status: '',
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
  }
}

const removeReferencia = (index: number) => {
  filters.value.referencias.splice(index, 1)
}

const onClickFilters = async () => {
  // set current page to 1
  references.value.current_page = 1
  await getSeaExportReferences()
}

const onClickPagination = async (page: number) => {
  references.value.current_page = page
  await getSeaExportReferences()
}

const getSeaExportReferences = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.referenciasExport.getSeaExportReferencias({
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
    // timeout 1 second
    loadingStore.stop()
  }
}

const getSeaExportFilters = async () => {
  const response = await $api.referenciasExport.getSeaExportFilters()

  catalogs.value = response as any
}

await getSeaExportFilters()
await getSeaExportReferences()

const clearFilters = async () => {
  filters.value = {
    year: '',
    referencia: '',
    referencias: [],
    masterBl: '',
    houseBl: '',
    consignee_id: '',
    freight_forwarder_id: '',
    vessel_id: '',
    voyage_id: '',
    origin: '',
    destination: '',
    eta: '',
    containerNumber: '',
    bookingNum: '',
    bookingTm: null,
    line_id: '',
    has_sailed: null,
    deleted_status: '',
  }
  await getSeaExportReferences()
}

const viewMaritimeReference = (item: any) => {
  router.push(`/maritime/export/${item.id}`)
}

const confirmDeletion = (item: any) => {
  router.push(`/maritime/export/view-details-${item.id}`)
}
</script>
