<template>
  <div>
    <div class="mb-4">
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
          <v-text-field
            v-model="filters.masterBl"
            density="compact"
            label="Master BL"
            @keyup.enter="getSeaImportReferences"
          />
        </div>
        <div class="col-span-2">
          <v-text-field
            v-model="filters.houseBl"
            density="compact"
            label="House BL"
            @keyup.enter="getSeaImportReferences"
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
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.vesselId"
            density="compact"
            label="Vessel"
            :items="catalogs.vessels"
            item-title="name"
            item-value="id"
          />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            v-model="filters.voyageDischargeId"
            density="compact"
            label="Voyage discharge"
            :items="catalogs.voyage_discharges"
            item-title="short_name"
            item-value="id"
          />
        </div>
        <div class="col-span-2">
          <v-text-field v-model="filters.eta" type="date" density="compact" label="ETA" />
        </div>
        <div class="col-span-2">
          <v-text-field
            v-model="filters.containerNumber"
            density="compact"
            label="Container #"
            @keyup.enter="getSeaImportReferences"
          />
        </div>
        <div class="col-span-2">
          <v-text-field
            v-model="filters.bookingNum"
            density="compact"
            label="Booking number"
            @keyup.enter="getSeaImportReferences"
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
      <div class="flex space-x-3">
        <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn size="small" color="primary" @click="getSeaImportReferences"> Search </v-btn>
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

const filters = ref({
  year: '',
  referencia: '',
  referencias: [] as any,
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
    const response = await $api.demurrages.getSeaImportReferencias({
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

await getSeaImportFilters()
await getSeaImportReferences()

const clearFilters = async () => {
  filters.value = {
    year: '',
    referencia: '',
    referencias: [],
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
  }
  await getSeaImportReferences()
}

const viewMaritimeReference = (item: any) => {
  router.push(`/maritime/import/demurrages/reference-${item.id}-demurrages`)
}
</script>
