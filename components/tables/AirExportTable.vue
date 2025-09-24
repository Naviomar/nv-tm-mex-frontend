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
            @keyup.enter="getAirExportReferences"
          />
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
            v-model="filters.masterAwb"
            density="compact"
            label="Master AWB"
            @keyup.enter="getAirExportReferences"
          />
        </div>
        <div class="col-span-2">
          <v-text-field
            v-model="filters.houseAwb"
            density="compact"
            label="House AWB"
            @keyup.enter="getAirExportReferences"
          />
        </div>
        <div class="col-span-4">
          <ACustomerSearch v-model="filters.consignee_id" />
        </div>
        <div class="col-span-4">
          <AFreightForwarderSearch v-model="filters.origin_ff_id" label="Freight Forwarder origin" />
        </div>
        <div class="col-span-4">
          <AFreightForwarderSearch v-model="filters.destination_ff_id" label="Freight Forwarder destination" />
        </div>
        <div class="col-span-4">
          <AAirlineSearch v-model="filters.airline_id" />
        </div>
        <div class="col-span-2">
          <v-text-field
            v-model="filters.flightNum"
            density="compact"
            label="Flight number"
            @keyup.enter="getAirExportReferences"
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
            @keyup.enter="getAirExportReferences"
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
              <th class="text-left">Destination F.F.</th>
              <th class="text-left">Customer</th>
              <th class="text-left">Origin</th>
              <th class="text-left">Destination</th>
              <th class="text-left">Airline</th>
              <th class="text-left">Flight number</th>
              <th class="text-left">Departure</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in references.data"
              :key="`reference-${index}`"
              :class="{
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
                  {{ item.reference_number }}
                </UserInfoBadge>
              </td>
              <td>
                <v-chip size="small" color="primary">
                  {{ item.master_awb }}
                </v-chip>
              </td>
              <td>
                <v-chip
                  v-for="(house, index) in item.house_awbs"
                  :key="`house-awb-${index}`"
                  size="small"
                  color="primary"
                >
                  {{ house.name }}
                </v-chip>
              </td>
              <td>{{ item.origin_ff?.name }}</td>
              <td>{{ item.destination_ff?.name }}</td>
              <td>{{ item.consignee?.name }}</td>
              <td>{{ item.origin }}</td>
              <td>{{ item.destination }}</td>
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
import { deletedStatus } from '@/utils/data/systemData'
import { flattenArraysToCommaSeparatedString } from '~/utils/formatters'
const { $api } = useNuxtApp()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const catalogs = ref<any>({
  consignees: [],
  ffs: [],
  airlines: [],
  customers: [],
})

const filters = ref<any>({
  year: '',
  referencia: '',
  referencias: [],
  masterAwb: '',
  houseAwb: '',
  consignee_id: '',
  freight_forwarder_id: '',
  airline_id: '',
  flightNum: '',
  deleted_status: '',
})

const references = ref<any>({
  data: [],
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
  await getAirExportReferences()
}

const onClickFilters = async () => {
  // set current page to 1
  references.value.current_page = 1
  await getAirExportReferences()
}

const getAirExportReferences = async () => {
  try {
    loadingStore.start()
    const response = await $api.airExport.getReferences({
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

const exportAirRefsXlsx = async () => {
  try {
    loadingStore.start()

    const response = (await $api.airExport.exportXlsxReport({
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
    link.download = `air-export-report-${timestamp}.xlsx`
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
  const response = await $api.airExport.getAirExportFilters()

  catalogs.value = response as any
}

await getAirExportFilters()
await getAirExportReferences()

const clearFilters = async () => {
  filters.value = {
    year: '',
    referencia: '',
    referencias: [],
    masterAwb: '',
    houseAwb: '',
    consignee_id: '',
    freight_forwarder_id: '',
    airline_id: '',
    flightNum: '',
    deleted_status: '',
  }
  await getAirExportReferences()
}

const viewReference = (item: any) => {
  console.log(item)
  router.push(`/air/export/operations-${item.id}`)
}

const confirmDeletion = (item: any) => {
  router.push(`/air/export/view-details-${item.id}`)
}
</script>
