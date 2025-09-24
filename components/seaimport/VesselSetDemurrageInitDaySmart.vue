<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-6">
        <div class="col-span-3">
          <v-text-field v-model="filters.ata" density="compact" type="date" label="ATA" />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getVoyageDests"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Line</th>
              <th class="text-left">Vessel</th>
              <th class="text-left">Destination</th>
              <th class="text-left">ATA</th>
              <th class="text-left">Demurrages init day</th>
              <th class="text-left"># import references</th>
              <th class="text-left"># containers</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(voyageDest, index) in voyageDestinations.data" :key="`voyageDest-${index}`">
              <td>
                <div class="flex flex-col gap-2 mb-4">
                  <v-btn size="small" color="primary" @click="getVoyageDestRefs(voyageDest)">Export details</v-btn>
                  <v-btn
                    v-if="canInitDemurrageDay(voyageDest)"
                    size="small"
                    color="secondary"
                    @click="registerDemurrageInitDay(voyageDest)"
                    >Register init day</v-btn
                  >
                </div>
              </td>
              <td>{{ voyageDest.voyage?.vessel?.line?.commercial_name }}</td>
              <td>{{ voyageDest.voyage?.vessel?.name }}</td>
              <td>
                {{ voyageDest.name }}
                <v-btn color="primary" size="x-small" variant="tonal" @click="viewVoyage(voyageDest)"
                  ><v-icon>mdi-eye-outline</v-icon>View voyage destination(s)</v-btn
                >
              </td>
              <td>
                <v-chip color="red" v-if="!voyageDest.arrival_date">No data</v-chip>
                <v-chip color="primary" v-if="voyageDest.arrival_date">{{ voyageDest.arrival_date }}</v-chip>
              </td>
              <td>
                <v-chip color="red" v-if="!voyageDest.init_demurrage_at">No data</v-chip>
                <v-chip color="primary" v-if="voyageDest.init_demurrage_at">{{ voyageDest.init_demurrage_at }}</v-chip>
              </td>
              <td>{{ voyageDest.total_references }}</td>
              <td>{{ getTotalRefContainers(voyageDest.referencias) }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="voyageDestinations.current_page"
          :length="voyageDestinations.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref({
  ata: '',
})

const voyageDestinations = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  voyageDestinations.value.current_page = page
  await getVoyageDests()
}

const getTotalRefContainers = (referencias: any) => {
  let total = 0
  referencias.forEach((ref: any) => {
    total += ref.total_containers
  })
  return total
}

const canInitDemurrageDay = (voyageDest: any) => {
  return !voyageDest.init_demurrage_at && voyageDest.arrival_date
}

const getVoyageDestRefs = async (voyageDest: any) => {
  try {
    loadingStore.loading = true
    const response = (await $api.voyages.getVoyageDestDemurrageDayReportXlsx(voyageDest.id, {
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })) as any

    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `vessel_${voyageDest.name}_demurrage_day_report.xlsx`
    link.click()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const registerDemurrageInitDay = async (voyageDest: any) => {
  router.push(`/maritime/import/demurrages/register-${voyageDest.id}-init-day`)
}

const viewVoyage = (voyageDest: any) => {
  router.push(`/configuration/voyages/destination-${voyageDest.id}`)
}

const getVoyageDests = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.voyages.getVoyageDestinationsDemurrages({
      query: {
        page: voyageDestinations.value.current_page,
        perPage: voyageDestinations.value.perPage,
         ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    voyageDestinations.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

const clearFilters = async () => {
  filters.value = {
    ata: '',
  }
  await getVoyageDests()
}
</script>
